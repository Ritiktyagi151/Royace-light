import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDiscountType, CouponDocument } from './schemas/coupon.schema';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

interface Actor {
  _id?: string;
  name?: string;
  role?: string;
}

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
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

  async validateCoupon(code: string, subtotal: number) {
    const coupon = await this.getUsableCoupon(code);
    return this.calculateDiscount(coupon, subtotal);
  }

  async consumeCoupon(code: string, subtotal: number) {
    const coupon = await this.getUsableCoupon(code);
    const result = this.calculateDiscount(coupon, subtotal);
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

  private calculateDiscount(coupon: CouponDocument, subtotal: number) {
    const normalizedSubtotal = Number(subtotal);
    if (!Number.isFinite(normalizedSubtotal) || normalizedSubtotal <= 0) {
      throw new BadRequestException('Invalid subtotal');
    }
    if (normalizedSubtotal < Number(coupon.minOrderAmount || 0)) {
      throw new BadRequestException(`Minimum order amount is Rs. ${coupon.minOrderAmount}`);
    }

    const rawDiscount = coupon.discountType === CouponDiscountType.PERCENTAGE
      ? (normalizedSubtotal * Number(coupon.discountValue)) / 100
      : Number(coupon.discountValue);

    const cappedDiscount = coupon.maxDiscountAmount
      ? Math.min(rawDiscount, Number(coupon.maxDiscountAmount))
      : rawDiscount;
    const discountAmount = Math.min(normalizedSubtotal, Math.max(0, Math.round(cappedDiscount)));

    return {
      code: coupon.code,
      name: coupon.name,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      subtotal: normalizedSubtotal,
      total: normalizedSubtotal - discountAmount,
    };
  }

  private normalizePayload(dto: CreateCouponDto | UpdateCouponDto) {
    const payload: any = { ...dto };
    if (payload.code !== undefined) payload.code = this.normalizeCode(payload.code);
    if (payload.startsAt) payload.startsAt = new Date(payload.startsAt);
    if (payload.expiresAt) payload.expiresAt = new Date(payload.expiresAt);
    if (payload.minOrderAmount === undefined) delete payload.minOrderAmount;
    if (payload.maxDiscountAmount === undefined || payload.maxDiscountAmount === null) delete payload.maxDiscountAmount;
    if (payload.usageLimit === undefined || payload.usageLimit === null) delete payload.usageLimit;
    return payload;
  }

  private normalizeCode(code?: string) {
    return String(code || '').trim().toUpperCase();
  }

  private async ensureValidCouponConfig(payload: any) {
    if (!payload.code) throw new BadRequestException('Coupon code is required');
    if (payload.discountType === CouponDiscountType.PERCENTAGE && Number(payload.discountValue) > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100');
    }
    if (payload.startsAt && payload.expiresAt && payload.startsAt > payload.expiresAt) {
      throw new BadRequestException('Start date must be before expiry date');
    }
  }
}
