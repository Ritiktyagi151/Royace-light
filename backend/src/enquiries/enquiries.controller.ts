import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto, UpdateEnquiryStatusDto } from './dto/enquiry.dto';
import { AdminGuard, JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('enquiries')
export class EnquiriesController {
  constructor(private enquiriesService: EnquiriesService) {}

  @Post()
  async create(@Body() dto: CreateEnquiryDto) {
    const data = await this.enquiriesService.create(dto);
    return { success: true, message: 'Enquiry submitted successfully', data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('read') read?: string,
  ) {
    const data = await this.enquiriesService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
      search,
      read,
    });
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/stats')
  async getStats() {
    const data = await this.enquiriesService.getStats();
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/:id/read')
  async markRead(@Param('id') id: string) {
    const data = await this.enquiriesService.markRead(id);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/:id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateEnquiryStatusDto) {
    const data = await this.enquiriesService.updateStatus(id, dto.status);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/:id')
  async remove(@Param('id') id: string) {
    const data = await this.enquiriesService.remove(id);
    return { success: true, message: 'Enquiry deleted', data };
  }
}
