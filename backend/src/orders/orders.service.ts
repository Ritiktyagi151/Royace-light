import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { EmailService } from '../email/email.service';
import { DeliveryService } from '../delivery/delivery.service';
import { AdminCreateOrderDto, CreateOrderDto, RequestReturnDto, ReviewReturnRequestDto, UpdateOrderStatusDto } from './dto/order.dto';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private emailService: EmailService,
    private deliveryService: DeliveryService,
    private config: ConfigService,
    private couponsService: CouponsService,
  ) {}

  // ─── Create Razorpay Order ────────────────────────────────
  async createRazorpayOrder(amount: number, dto?: Partial<CreateOrderDto>) {
    const normalizedAmount = Number(amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    if (dto?.items?.length) {
      await this.validateOrderItems(dto as CreateOrderDto, true);
    }

    const keyId = this.config.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.config.get<string>('RAZORPAY_KEY_SECRET');
    if (!keyId || !keySecret) {
      throw new BadRequestException('Online payment is not configured');
    }

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(normalizedAmount * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    return { orderId: order.id, amount: order.amount, currency: order.currency };
  }

  // ─── Verify Payment ──────────────────────────────────────
  verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, signature: string): boolean {
    const secret = this.config.get<string>('RAZORPAY_KEY_SECRET');
    if (!secret || !razorpayOrderId || !razorpayPaymentId || !signature) return false;
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return expected === signature;
  }

  // ─── Place Order ──────────────────────────────────────────
  async placeOrder(userId: string, dto: CreateOrderDto) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = dto;
    const paymentMethod =
      dto.paymentMethod === 'online' || dto.paymentMethod === 'razorpay'
        ? 'online'
        : 'cod';

    // Fetch user
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const { normalizedItems, subtotal, amount, deliveryFees, discountAmount, coupon } =
      await this.validateOrderItems(dto, false);

    if (paymentMethod === 'online') {
      const valid = this.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
      if (!valid) throw new BadRequestException('Payment verification failed');
    }

    const decremented: { productId: string; quantity: number }[] = [];
    try {
      for (const item of normalizedItems) {
        const updated = await this.productModel.findOneAndUpdate(
          {
            _id: new Types.ObjectId(item.productId),
            totalQuantity: { $gte: item.quantity },
          },
          { $inc: { totalQuantity: -item.quantity, salesCount: item.quantity } },
        );

        if (!updated) {
          throw new BadRequestException(`Insufficient stock for ${item.name}`);
        }
        decremented.push({ productId: item.productId, quantity: item.quantity });
      }
    } catch (err) {
      await Promise.all(
        decremented.map((item) =>
          this.productModel.findByIdAndUpdate(item.productId, {
            $inc: { totalQuantity: item.quantity, salesCount: -item.quantity },
          }),
        ),
      );
      throw err;
    }

    // Create order in DB
    const order = await this.orderModel.create({
      userId: new Types.ObjectId(userId),
      items: normalizedItems,
      amount,
      subtotal,
      discountAmount,
      coupon,
      deliveryFees,
      address: dto.address,
      paymentId: razorpayPaymentId,
      razorpayOrderId,
      payment: paymentMethod === 'online',
      paymentMethod,
      status: OrderStatus.PLACED,
      orderDate: new Date(),
      deliveryMethod: dto.deliveryMethod,
    });

    // Clear cart
    await this.cartModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { items: [] },
    );

    // Emails (non-blocking)
    this.emailService
      .sendOrderPlacedEmail(user.email, order)
      .catch(() => {});
    this.emailService
      .sendAdminNewOrderEmail(order, user.name, user.email)
      .catch(() => {});

    // Update email tracking flag
    await this.orderModel.findByIdAndUpdate(order._id, { emailSentPlaced: true });

    return order;
  }

  async createAdminOrder(dto: AdminCreateOrderDto) {
    const customerEmail = dto.customerEmail?.trim().toLowerCase();
    if (!customerEmail) throw new BadRequestException('Customer email is required');

    const user = await this.userModel.findOne({ email: customerEmail });
    if (!user) throw new NotFoundException('Customer not found');

    if (!dto.items?.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    let subtotal = 0;
    const normalizedItems = dto.items.map((item) => {
      const quantity = Number(item.quantity);
      const price = Number(item.price);
      const name = item.name?.trim();
      if (!name) throw new BadRequestException('Item name is required');
      if (!Number.isInteger(quantity) || quantity < 1) throw new BadRequestException('Invalid item quantity');
      if (!Number.isFinite(price) || price < 0) throw new BadRequestException('Invalid item price');

      const itemTotal = price * quantity;
      subtotal += itemTotal;
      return {
        productId: item.productId || item.product || `manual-${Date.now()}`,
        name,
        price,
        quantity,
        color: item.color || '',
        size: item.size || '',
        image: item.image || '',
        itemTotal,
      };
    });

    const deliveryFees = Number(dto.deliveryFees || 0);
    if (!Number.isFinite(deliveryFees) || deliveryFees < 0) {
      throw new BadRequestException('Invalid delivery fee');
    }

    const paymentMethod = dto.paymentMethod === 'online' || dto.paymentMethod === 'razorpay' ? 'online' : 'cod';
    const amount = subtotal + deliveryFees;
    const order = await this.orderModel.create({
      userId: user._id,
      items: normalizedItems,
      amount,
      subtotal,
      discountAmount: 0,
      deliveryFees,
      address: dto.address,
      paymentId: dto.paymentId,
      razorpayOrderId: dto.razorpayOrderId,
      payment: Boolean(dto.payment),
      paymentMethod,
      status: dto.status || OrderStatus.PLACED,
      orderDate: new Date(),
      deliveryMethod: dto.deliveryMethod,
    });

    return this.orderModel.findById(order._id).populate('userId', 'name email');
  }

  // ─── Update Order Status (Admin) ─────────────────────────
  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    const prevStatus = order.status;
    if (prevStatus === dto.status) {
      return this.orderModel.findById(orderId).populate('userId', 'name email');
    }

    const validNextStatuses = this.getValidNextStatuses(prevStatus);
    if (!validNextStatuses.includes(dto.status)) {
      throw new BadRequestException(`Cannot change status from ${prevStatus} directly to ${dto.status}`);
    }

    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      orderId,
      { $set: { status: dto.status } },
      { new: true, runValidators: true },
    );
    if (!updatedOrder) throw new NotFoundException('Order not found');

    // Fetch customer for emails
    const user = await this.userModel.findById(order.userId);

    // ─── Trigger Delhivery when order is Confirmed ──────────
    if (dto.status === OrderStatus.CONFIRMED && prevStatus !== OrderStatus.CONFIRMED) {
      try {
        const productNames = order.items.map((i: any) => i.name).join(', ');
        const totalQty = order.items.reduce((s: number, i: any) => s + i.quantity, 0);
        const totalWeight = totalQty * 200; // assume 200g per item

        const shipmentResult = await this.deliveryService.createShipment({
          orderId: String(order._id).slice(-8).toUpperCase(),
          orderDate: order.orderDate.toISOString(),
          customerName: user?.name || 'Customer',
          customerPhone: order.address.phone,
          customerEmail: user?.email || '',
          addressLine1: order.address.addressLineOne,
          addressLine2: order.address.addressLineTwo,
          city: order.address.city,
          state: order.address.state,
          pinCode: order.address.pinCode,
          country: order.address.country || 'India',
          codAmount: order.paymentMethod === 'cod' ? order.amount : 0,
          orderValue: order.amount,
          paymentMode: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
          weight: totalWeight,
          productName: productNames,
          quantity: totalQty,
        });

        if (shipmentResult.success) {
          await this.orderModel.findByIdAndUpdate(orderId, {
            delivery: {
              waybill: shipmentResult.waybill,
              trackingUrl: shipmentResult.trackingUrl,
              shipmentId: shipmentResult.shipmentId,
              courierName: 'Delhivery',
              dispatchedAt: new Date(),
            },
          });
        } else {
          console.warn(`Delhivery shipment not created for order ${orderId}: ${shipmentResult.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.warn(`Delhivery shipment failed after status update for order ${orderId}: ${err.message}`);
      }
    }

    // ─── Email on Shipped ────────────────────────────────────
    if (dto.status === OrderStatus.SHIPPED && !order.emailSentShipped && user) {
      const updated = await this.orderModel.findById(orderId);
      await this.emailService.sendOrderShippedEmail(user.email, updated)
        .then(() => this.orderModel.findByIdAndUpdate(orderId, { emailSentShipped: true }))
        .catch((err) => console.warn(`Order shipped email failed for ${orderId}: ${err.message}`));
    }

    // ─── Email on Delivered ──────────────────────────────────
    if (dto.status === OrderStatus.DELIVERED && !order.emailSentDelivered && user) {
      await this.emailService.sendOrderDeliveredEmail(user.email, order)
        .then(() => this.orderModel.findByIdAndUpdate(orderId, { emailSentDelivered: true }))
        .catch((err) => console.warn(`Order delivered email failed for ${orderId}: ${err.message}`));
    }

    return this.orderModel.findById(orderId).populate('userId', 'name email');
  }

  async requestReturn(orderId: string, userId: string, dto: RequestReturnDto) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (String(order.userId) !== String(userId)) {
      throw new ForbiddenException('Access denied');
    }

    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Return can only be requested after delivery');
    }

    if (order.returnRequest?.status === 'Requested') {
      throw new BadRequestException('Return request is already pending');
    }

    if (order.returnRequest?.status === 'Approved') {
      throw new BadRequestException('This order has already been returned');
    }

    const reason = dto.reason?.trim();
    if (!reason) {
      throw new BadRequestException('Return reason is required');
    }

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(
        orderId,
        {
          $set: {
            returnRequest: {
              status: 'Requested',
              reason,
              details: dto.details?.trim(),
              requestedAt: new Date(),
            },
          },
        },
        { new: true, runValidators: true },
      )
      .populate('userId', 'name email');

    if (!updatedOrder) throw new NotFoundException('Order not found');
    return updatedOrder;
  }

  async reviewReturnRequest(orderId: string, dto: ReviewReturnRequestDto) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (order.returnRequest?.status !== 'Requested') {
      throw new BadRequestException('No pending return request found for this order');
    }

    const approved = dto.decision === 'approved';
    const returnRequest = {
      ...order.returnRequest,
      status: approved ? 'Approved' : 'Rejected',
      reviewedAt: new Date(),
      adminNote: dto.adminNote?.trim(),
    };

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(
        orderId,
        {
          $set: {
            status: approved ? OrderStatus.RETURNED : order.status,
            returnRequest,
          },
        },
        { new: true, runValidators: true },
      )
      .populate('userId', 'name email');

    if (!updatedOrder) throw new NotFoundException('Order not found');
    return updatedOrder;
  }

  async deleteOrder(orderId: string) {
    const order = await this.orderModel
      .findByIdAndUpdate(
        orderId,
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true },
      )
      .populate('userId', 'name email');
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async restoreOrder(orderId: string) {
    const order = await this.orderModel
      .findByIdAndUpdate(
        orderId,
        { $set: { isDeleted: false }, $unset: { deletedAt: 1 } },
        { new: true },
      )
      .populate('userId', 'name email');
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async permanentlyDeleteOrder(orderId: string) {
    const order = await this.orderModel.findByIdAndDelete(orderId);
    if (!order) throw new NotFoundException('Order not found');
    return { id: orderId };
  }

  async bulkUpdateStatus(orderIds: string[], status: OrderStatus) {
    const ids = this.normalizeOrderIds(orderIds);
    if (!ids.length) throw new BadRequestException('Select at least one order');

    const result = await this.orderModel.updateMany(
      { _id: { $in: ids }, isDeleted: { $ne: true } },
      { $set: { status } },
      { runValidators: true },
    );

    return {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      status,
    };
  }

  async bulkDelete(orderIds: string[]) {
    const ids = this.normalizeOrderIds(orderIds);
    if (!ids.length) throw new BadRequestException('Select at least one order');

    const result = await this.orderModel.updateMany(
      { _id: { $in: ids } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );

    return {
      matched: result.matchedCount,
      modified: result.modifiedCount,
    };
  }

  private getValidNextStatuses(status: OrderStatus) {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PLACED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.OUT_FOR_DELIVERY],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.RETURNED]: [],
    };

    return transitions[status] || [];
  }

  // ─── Get all orders (Admin) ───────────────────────────────
  async getAllOrders(
    page = 1,
    limit = 20,
    status?: string,
    search?: string,
    fromDate?: string,
    toDate?: string,
    deleted = false,
    returnRequested = false,
  ) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const filter: any = deleted ? { isDeleted: true } : { isDeleted: { $ne: true } };
    if (status) filter.status = status;
    if (returnRequested) filter['returnRequest.status'] = 'Requested';

    if (fromDate || toDate) {
      filter.orderDate = {};
      if (fromDate) {
        const start = new Date(`${fromDate}T00:00:00.000`);
        if (!Number.isNaN(start.getTime())) filter.orderDate.$gte = start;
      }
      if (toDate) {
        const end = new Date(`${toDate}T23:59:59.999`);
        if (!Number.isNaN(end.getTime())) filter.orderDate.$lte = end;
      }
      if (!Object.keys(filter.orderDate).length) delete filter.orderDate;
    }

    const cleanedSearch = search?.trim();
    if (cleanedSearch) {
      const regex = new RegExp(this.escapeRegex(cleanedSearch), 'i');
      const users = await this.userModel.find({
        $or: [{ name: regex }, { email: regex }],
      }).select('_id');
      const searchFilters: any[] = [
        { userId: { $in: users.map((user) => user._id) } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: '$_id' },
              regex: this.escapeRegex(cleanedSearch),
              options: 'i',
            },
          },
        },
      ];

      if (Types.ObjectId.isValid(cleanedSearch)) {
        searchFilters.push({ _id: new Types.ObjectId(cleanedSearch) });
      }

      filter.$or = searchFilters;
    }

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      this.orderModel.countDocuments(filter),
    ]);

    return { orders, total, page: pageNum, pages: Math.ceil(total / limitNum) };
  }

  // ─── Get user orders ─────────────────────────────────────
  async getUserOrders(userId: string) {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId), isDeleted: { $ne: true } })
      .sort({ createdAt: -1 });
  }

  // ─── Get single order ────────────────────────────────────
  async getOrder(orderId: string, userId?: string, role?: string) {
    const order = await this.orderModel.findById(orderId).populate('userId', 'name email');
    if (!order) throw new NotFoundException('Order not found');

    if (role !== 'admin' && userId && String(order.userId) !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  // ─── Track order by waybill ───────────────────────────────
  async trackOrder(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (!order.delivery?.waybill) {
      return { tracked: false, message: 'Shipment not yet created' };
    }

    const tracking = await this.deliveryService.trackShipment(order.delivery.waybill);
    return { tracked: true, delivery: order.delivery, tracking };
  }

  // ─── Admin stats ──────────────────────────────────────────
  async getOrderStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const activeFilter = { isDeleted: { $ne: true } };
    const billableFilter = {
      ...activeFilter,
      status: { $nin: [OrderStatus.CANCELLED, OrderStatus.RETURNED] },
    };
    const [total, deleted, placed, confirmed, processing, shipped, outForDelivery, delivered, cancelled, returned, todaysOrders, paymentStats] =
      await Promise.all([
        this.orderModel.countDocuments(activeFilter),
        this.orderModel.countDocuments({ isDeleted: true }),
        this.orderModel.countDocuments({ ...activeFilter, status: OrderStatus.PLACED }),
        this.orderModel.countDocuments({ ...activeFilter, status: OrderStatus.CONFIRMED }),
        this.orderModel.countDocuments({ ...activeFilter, status: OrderStatus.PROCESSING }),
        this.orderModel.countDocuments({ ...activeFilter, status: OrderStatus.SHIPPED }),
        this.orderModel.countDocuments({ ...activeFilter, status: OrderStatus.OUT_FOR_DELIVERY }),
        this.orderModel.countDocuments({ ...activeFilter, status: OrderStatus.DELIVERED }),
        this.orderModel.countDocuments({ ...activeFilter, status: OrderStatus.CANCELLED }),
        this.orderModel.countDocuments({ ...activeFilter, status: OrderStatus.RETURNED }),
        this.orderModel.countDocuments({ ...activeFilter, orderDate: { $gte: todayStart, $lte: todayEnd } }),
        this.orderModel.aggregate([
          { $match: billableFilter },
          {
            $addFields: {
              amountValue: {
                $convert: {
                  input: '$amount',
                  to: 'double',
                  onError: 0,
                  onNull: 0,
                },
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amountValue' },
              paidAmount: {
                $sum: { $cond: [{ $eq: ['$payment', true] }, '$amountValue', 0] },
              },
              dueAmount: {
                $sum: { $cond: [{ $eq: ['$payment', true] }, 0, '$amountValue'] },
              },
              onlinePaidAmount: {
                $sum: {
                  $cond: [
                    { $and: [{ $eq: ['$payment', true] }, { $in: ['$paymentMethod', ['online', 'razorpay']] }] },
                    '$amountValue',
                    0,
                  ],
                },
              },
              codDueAmount: {
                $sum: {
                  $cond: [
                    { $and: [{ $eq: ['$payment', false] }, { $eq: ['$paymentMethod', 'cod'] }] },
                    '$amountValue',
                    0,
                  ],
                },
              },
              paidOrders: { $sum: { $cond: [{ $eq: ['$payment', true] }, 1, 0] } },
              dueOrders: { $sum: { $cond: [{ $eq: ['$payment', false] }, 1, 0] } },
            },
          },
        ]),
      ]);
    const payments = paymentStats[0] || {};

    return {
      total,
      deleted,
      placed,
      confirmed,
      processing,
      shipped,
      outForDelivery,
      delivered,
      cancelled,
      returned,
      pending: placed + confirmed + processing + shipped + outForDelivery,
      todaysOrders,
      revenue: payments.paidAmount || 0,
      payment: {
        totalAmount: payments.totalAmount || 0,
        paidAmount: payments.paidAmount || 0,
        dueAmount: payments.dueAmount || 0,
        onlinePaidAmount: payments.onlinePaidAmount || 0,
        codDueAmount: payments.codDueAmount || 0,
        paidOrders: payments.paidOrders || 0,
        dueOrders: payments.dueOrders || 0,
      },
    };
  }

  async getRevenueTrend(period: 'daily' | 'weekly' | 'monthly' = 'daily', fromDate?: string, toDate?: string) {
    const dateRange = this.resolveTrendDateRange(period, fromDate, toDate);
    const dateFormat = period === 'monthly'
      ? '%Y-%m'
      : period === 'weekly'
      ? '%G-W%V'
      : '%Y-%m-%d';

    const data = await this.orderModel.aggregate([
      {
        $match: {
          isDeleted: { $ne: true },
          payment: true,
          status: { $nin: [OrderStatus.CANCELLED, OrderStatus.RETURNED] },
          orderDate: { $gte: dateRange.start, $lte: dateRange.end },
        },
      },
      {
        $addFields: {
          amountValue: {
            $convert: {
              input: '$amount',
              to: 'double',
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$orderDate' } },
          revenue: { $sum: '$amountValue' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      period,
      fromDate: dateRange.start,
      toDate: dateRange.end,
      data: data.map((item) => ({
        label: item._id,
        revenue: item.revenue || 0,
        orders: item.orders || 0,
      })),
    };
  }

  private normalizeOrderIds(orderIds: string[] = []) {
    return [...new Set(orderIds)]
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));
  }

  private resolveTrendDateRange(period: 'daily' | 'weekly' | 'monthly', fromDate?: string, toDate?: string) {
    const end = toDate ? new Date(`${toDate}T23:59:59.999`) : new Date();
    if (Number.isNaN(end.getTime())) end.setTime(Date.now());

    const start = fromDate ? new Date(`${fromDate}T00:00:00.000`) : new Date(end);
    if (Number.isNaN(start.getTime())) start.setTime(end.getTime());

    if (!fromDate) {
      if (period === 'monthly') start.setMonth(start.getMonth() - 11);
      else if (period === 'weekly') start.setDate(start.getDate() - 84);
      else start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    }

    return { start, end };
  }

  private escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private getProductDisplayImage(product: ProductDocument) {
    const assets = Array.isArray(product.imageAssets)
      ? [...product.imageAssets].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
      : [];
    const primary = assets.find((asset) => asset.isPrimary) || assets[0];
    if (primary) return primary.webpUrl || primary.url || '';

    const legacyProduct = product as any;
    return legacyProduct.primaryImage || legacyProduct.image || legacyProduct.images?.[0] || '';
  }

  private async validateOrderItems(dto: CreateOrderDto, skipCouponConsumption = true) {
    if (!dto.items?.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const normalizedItems = [];
    let subtotal = 0;

    for (const item of dto.items) {
      const productId = item.productId || item.product;
      if (!productId || !Types.ObjectId.isValid(productId)) {
        throw new BadRequestException('Invalid product in order');
      }

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new BadRequestException('Invalid item quantity');
      }

      const product = await this.productModel.findById(productId);
      if (!product) throw new NotFoundException('Product not found');
      if (!product.isActive) throw new BadRequestException(`${product.name} is not available`);
      if (product.totalQuantity < quantity) {
        throw new BadRequestException(`Only ${product.totalQuantity} piece(s) available for ${product.name}`);
      }

      const price = Number(product.sellingPrice);
      const itemTotal = price * quantity;
      subtotal += itemTotal;
      normalizedItems.push({
        productId: String(product._id),
        name: product.name,
        price,
        quantity,
        color: item.color || '',
        size: item.size || '',
        image: this.getProductDisplayImage(product) || item.image || '',
        itemTotal,
      });
    }

    const deliveryFees = Number(dto.deliveryFees || 0);
    if (!Number.isFinite(deliveryFees) || deliveryFees < 0) {
      throw new BadRequestException('Invalid delivery fee');
    }

    let discountAmount = 0;
    let coupon;
    if (dto.couponCode?.trim()) {
      const appliedCoupon = skipCouponConsumption
        ? await this.couponsService.validateCoupon(dto.couponCode, subtotal, normalizedItems)
        : await this.couponsService.consumeCoupon(dto.couponCode, subtotal, normalizedItems);
      discountAmount = appliedCoupon.discountAmount;
      coupon = {
        code: appliedCoupon.code,
        name: appliedCoupon.name,
        discountType: appliedCoupon.discountType,
        discountValue: appliedCoupon.discountValue,
        discountAmount: appliedCoupon.discountAmount,
      };
    }

    const amount = subtotal + deliveryFees - discountAmount;
    const clientAmount = Number(dto.amount ?? dto.totalAmount ?? 0);
    if (!Number.isFinite(clientAmount) || Math.abs(clientAmount - amount) > 1) {
      throw new BadRequestException('Order amount does not match current product prices');
    }

    return { normalizedItems, subtotal, amount, deliveryFees, discountAmount, coupon };
  }
}
