import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';
import { AdminGuard, JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  @Get()
  async findPublic() {
    const data = await this.announcementsService.findPublic();
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const data = await this.announcementsService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async create(@Body() dto: CreateAnnouncementDto) {
    const data = await this.announcementsService.create(dto);
    return { success: true, message: 'Announcement created', data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
    const data = await this.announcementsService.update(id, dto);
    return { success: true, message: 'Announcement updated', data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/toggle')
  async toggle(@Param('id') id: string) {
    const data = await this.announcementsService.toggle(id);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.announcementsService.remove(id);
    return { success: true, message: 'Announcement deleted', data };
  }
}
