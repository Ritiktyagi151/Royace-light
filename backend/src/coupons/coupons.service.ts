import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Coupon, CouponDiscountType, CouponDocument, CouponScope } from './schemas/coupon.schema';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Category, CategoryDocument } from '../categories/category.schema';

interface Actor {
  _id?: string;
  name?: string;
  role?: string;
}

interface CouponCartItem {
  productId?: string;
  sku?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private activityLogsService: ActivityLogsService,
  ) {}

  async findAll() {
    return this.couponModel.find().sort({ createdAt: -1 });
  }

  async create(dto: CreateCouponDto, actor?: Actor) {
    const payload = this.normalizePayload(dto);
    await this.ensureValidCouponConfig(payload);
    const coupon = await this.couponModel.create(payload);
    await this.activityLogsService.log({
      actor,
      action: 'coupon.created',
      entityType: 'coupon',
      entityId: String(coupon._id),
      metadata: { code: coupon.code },
    });
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto, actor?: Actor) {
    const current = await this.couponModel.findById(id);
    if (!current) throw new NotFoundException('Coupon not found');

    const payload = this.normalizePayload(dto);
    const nextConfig = { ...current.toObject(), ...payload };
    await this.ensureValidCouponConfig(nextConfig);

    const coupon = await this.couponModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    await this.activityLogsService.log({
      actor,
      action: 'coupon.updated',
      entityType: 'coupon',
      entityId: id,
      metadata: { code: coupon?.code, changes: payload },
    });
    return coupon;
  }

  async remove(id: string, actor?: Actor) {
    const coupon = await this.couponModel.findByIdAndDelete(id);
    if (!coupon) throw new NotFoundException('Coupon not found');
    await this.activityLogsService.log({
      actor,
      action: 'coupon.deleted',
      entityType: 'coupon',
      entityId: id,
      metadata: { code: coupon.code },
    });
    return { message: 'Coupon deleted successfully' };
  }

  async validateCoupon(code: string, subtotal: number, items: CouponCartItem[] = []) {
    const coupon = await this.getUsableCoupon(code);
    return this.calculateDiscount(coupon, subtotal, items);
  }

  async consumeCoupon(code: string, subtotal: number, items: CouponCartItem[] = []) {
    const coupon = await this.getUsableCoupon(code);
    const result = await this.calculateDiscount(coupon, subtotal, items);
    await this.couponModel.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
    return result;
  }

  private async getUsableCoupon(code: string) {
    const normalizedCode = this.normalizeCode(code);
    if (!normalizedCode) throw new BadRequestException('Coupon code is required');

    const coupon = await this.couponModel.findOne({ code: normalizedCode });
    if (!coupon) throw new NotFoundException('Coupon not found');
    if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) throw new BadRequestException('Coupon is not active yet');
    if (coupon.expiresAt && coupon.expiresAt < now) throw new BadRequestException('Coupon has expired');
    if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    return coupon;
  }

  private async calculateDiscount(coupon: CouponDocument, subtotal: number, items: CouponCartItem[] = []) {
    const normalizedSubtotal = Number(subtotal);
    if (!Number.isFinite(normalizedSubtotal) || normalizedSubtotal <= 0) {
      throw new BadRequestException('Invalid subtotal');
    }

    const eligibleSubtotal = await this.getEligibleSubtotal(coupon, items, normalizedSubtotal);
    if (eligibleSubtotal < Number(coupon.minOrderAmount || 0)) {
      throw new BadRequestException(`Minimum order amount is Rs. ${coupon.minOrderAmount}`);
    }

    const rawDiscount = coupon.discountType === CouponDiscountType.PERCENTAGE
      ? (eligibleSubtotal * Number(coupon.discountValue)) / 100
      : Number(coupon.discountValue);

    const cappedDiscount = coupon.maxDiscountAmount
      ? Math.min(rawDiscount, Number(coupon.maxDiscountAmount))
      : rawDiscount;
    const discountAmount = Math.min(eligibleSubtotal, Math.max(0, Math.round(cappedDiscount)));

    return {
      code: coupon.code,
      name: coupon.name,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      subtotal: normalizedSubtotal,
      eligibleSubtotal,
      total: normalizedSubtotal - discountAmount,
    };
  }

  private async getEligibleSubtotal(coupon: CouponDocument, items: CouponCartItem[], subtotal: number) {
    if (!coupon.scope || coupon.scope === CouponScope.ALL) return subtotal;
    if (!items?.length) {
      throw new BadRequestException('Coupon needs cart items for product/category validation');
    }

    const productIds = items
      .map((item) => String(item.productId || '').trim())
      .filter((id) => Types.ObjectId.isValid(id));
    const products = await this.productModel
      .find({ _id: { $in: productIds.map((id) => new Types.ObjectId(id)) } })
      .select('_id sku series category sellingPrice')
      .lean();
    const productMap = new Map(products.map((product: any) => [String(product._id), product]));

    const allowedCategoryIds = new Set((coupon.categoryIds || []).map((id) => String(id).trim()).filter(Boolean));
    if (coupon.categorySlugs?.length) {
      const categories = await this.categoryModel
        .find({ slug: { $in: coupon.categorySlugs.map((slug) => slug.toLowerCase()) } })
        .select('_id slug')
        .lean();
      categories.forEach((category: any) => allowedCategoryIds.add(String(category._id)));
    }

    const allowedProductIds = new Set((coupon.productIds || []).map((id) => String(id).trim()).filter(Boolean));
    const allowedSkus = (coupon.skus || []).map((sku) => String(sku).trim().toUpperCase()).filter(Boolean);

    const eligibleSubtotal = items.reduce((sum, item) => {
      const product = productMap.get(String(item.productId || ''));
      const sku = String(product?.sku || item.sku || '').toUpperCase();
      const series = String(product?.series || '').toUpperCase();
      const category = String(product?.category || item.category || '');

      const isEligible =
        (coupon.scope === CouponScope.PRODUCTS && allowedProductIds.has(String(item.productId || ''))) ||
        (coupon.scope === CouponScope.CATEGORIES && allowedCategoryIds.has(category)) ||
        (coupon.scope === CouponScope.SKUS && allowedSkus.some((allowed) => sku === allowed || sku.startsWith(allowed) || series === allowed));

      if (!isEligible) return sum;
      const lineTotal = Number(item.price || product?.sellingPrice || 0) * Math.max(1, Number(item.quantity || 1));
      return sum + (Number.isFinite(lineTotal) ? lineTotal : 0);
    }, 0);

    if (eligibleSubtotal <= 0) {
      throw new BadRequestException('Coupon is not applicable to products in this cart');
    }

    return eligibleSubtotal;
  }

  private normalizePayload(dto: CreateCouponDto | UpdateCouponDto) {
    const payload: any = { ...dto };
    if (payload.code !== undefined) payload.code = this.normalizeCode(payload.code);
    if (payload.startsAt) payload.startsAt = new Date(payload.startsAt);
    if (payload.expiresAt) payload.expiresAt = new Date(payload.expiresAt);
    if (payload.minOrderAmount === undefined) delete payload.minOrderAmount;
    if (payload.maxDiscountAmount === undefined || payload.maxDiscountAmount === null) delete payload.maxDiscountAmount;
    if (payload.usageLimit === undefined || payload.usageLimit === null) delete payload.usageLimit;
    if (payload.scope === undefined) payload.scope = CouponScope.ALL;
    payload.categoryIds = this.normalizeList(payload.categoryIds);
    payload.categorySlugs = this.normalizeList(payload.categorySlugs).map((slug) => slug.toLowerCase());
    payload.productIds = this.normalizeList(payload.productIds);
    payload.skus = this.normalizeList(payload.skus).map((sku) => sku.toUpperCase());
    return payload;
  }

  private normalizeCode(code?: string) {
    return String(code || '').trim().toUpperCase();
  }

  private normalizeList(value: unknown) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.map((item) => String(item || '').trim()).filter(Boolean))];
  }

  private async ensureValidCouponConfig(payload: any) {
    if (!payload.code) throw new BadRequestException('Coupon code is required');
    if (payload.discountType === CouponDiscountType.PERCENTAGE && Number(payload.discountValue) > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100');
    }
    if (payload.startsAt && payload.expiresAt && payload.startsAt > payload.expiresAt) {
      throw new BadRequestException('Start date must be before expiry date');
    }
    if (payload.scope === CouponScope.CATEGORIES && !payload.categoryIds?.length && !payload.categorySlugs?.length) {
      throw new BadRequestException('Add at least one category ID or slug for this coupon');
    }
    if (payload.scope === CouponScope.PRODUCTS && !payload.productIds?.length) {
      throw new BadRequestException('Add at least one product ID for this coupon');
    }
    if (payload.scope === CouponScope.SKUS && !payload.skus?.length) {
      throw new BadRequestException('Add at least one SKU or SKU prefix for this coupon');
    }
  }
}
