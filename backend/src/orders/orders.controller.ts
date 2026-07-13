import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Request, Header,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AdminCreateOrderDto, CreateOrderDto, RequestReturnDto, ReviewReturnRequestDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard, AdminGuard } from '../auth/guards/auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // Create Razorpay order (pre-payment)
  @UseGuards(JwtAuthGuard)
  @Post('create-razorpay-order')
  async createRazorpayOrder(@Body() body: CreateOrderDto & { amount: number }) {
    const data = await this.ordersService.createRazorpayOrder(body.amount, body);
    return { success: true, data };
  }

  // Place order after payment
  @UseGuards(JwtAuthGuard)
  @Post('place')
  async placeOrder(@Request() req, @Body() dto: CreateOrderDto) {
    const data = await this.ordersService.placeOrder(req.user._id, dto);
    return { success: true, message: 'Order placed successfully', data };
  }

  // My orders (customer)
  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  async getMyOrders(@Request() req) {
    const data = await this.ordersService.getUserOrders(req.user._id);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/return-request')
  async requestReturn(@Param('id') id: string, @Request() req, @Body() dto: RequestReturnDto) {
    const data = await this.ordersService.requestReturn(id, req.user._id, dto);
    return { success: true, message: 'Return request submitted', data };
  }

  // Track single order
  @UseGuards(JwtAuthGuard)
  @Get(':id/track')
  async trackOrder(@Param('id') id: string) {
    const data = await this.ordersService.trackOrder(id);
    return { success: true, data };
  }

  // Get single order
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOrder(@Param('id') id: string, @Request() req) {
    const data = await this.ordersService.getOrder(id, req.user._id, req.user.role);
    return { success: true, data };
  }

  // ─── Admin routes ───────────────────────────────────────
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async getAllOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const data = await this.ordersService.getAllOrders(+page, +limit, status, search, fromDate, toDate);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/stats')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async getStats() {
    const data = await this.ordersService.getOrderStats();
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin')
  async createAdminOrder(@Body() dto: AdminCreateOrderDto) {
    const data = await this.ordersService.createAdminOrder(dto);
    return { success: true, message: 'Order created successfully', data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/:id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    const data = await this.ordersService.updateOrderStatus(id, dto);
    return { success: true, message: 'Order status updated', data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/:id/return-request')
  async reviewReturn(@Param('id') id: string, @Body() dto: ReviewReturnRequestDto) {
    const data = await this.ordersService.reviewReturnRequest(id, dto);
    return { success: true, message: 'Return request reviewed', data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/:id')
  async deleteOrder(@Param('id') id: string) {
    const data = await this.ordersService.deleteOrder(id);
    return { success: true, message: 'Order deleted successfully', data };
  }
}
