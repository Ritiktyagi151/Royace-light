import { Body, Controller, Get, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto, UpdateNewsletterPreferenceDto } from './dto/newsletter.dto';
import { AdminGuard, JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('newsletter')
export class NewsletterController {
  constructor(private newsletterService: NewsletterService) {}

  @Post('subscribe')
  async subscribe(@Body() dto: SubscribeNewsletterDto, @Request() req) {
    const data = await this.newsletterService.subscribe(dto, req.user?._id);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getPreference(@Request() req) {
    const data = await this.newsletterService.getPreference(req.user._id);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updatePreference(@Request() req, @Body() dto: UpdateNewsletterPreferenceDto) {
    const data = await this.newsletterService.updatePreference(req.user._id, dto.isActive);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  async findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    const data = await this.newsletterService.findAll(+page, +limit);
    return { success: true, data };
  }
}
