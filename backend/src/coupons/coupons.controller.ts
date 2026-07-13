import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';
import { JwtAuthGuard, AdminGuard } from '../auth/guards/auth.guard';

@Controller('coupons')
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('validate')
  async validate(@Body() dto: ValidateCouponDto) {
    const data = await this.couponsService.validateCoupon(dto.code, dto.subtotal);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  async findAll() {
    const data = await this.couponsService.findAll();
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin')
  async create(@Body() dto: CreateCouponDto, @Request() req) {
    const data = await this.couponsService.create(dto, req.user);
    return { success: true, message: 'Coupon created', data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateCouponDto, @Request() req) {
    const data = await this.couponsService.update(id, dto, req.user);
    return { success: true, message: 'Coupon updated', data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/:id')
  async remove(@Param('id') id: string, @Request() req) {
    const data = await this.couponsService.remove(id, req.user);
    return { success: true, ...data };
  }
}
