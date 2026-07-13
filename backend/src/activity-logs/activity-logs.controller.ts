import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { JwtAuthGuard, AdminGuard } from '../auth/guards/auth.guard';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ActivityLogsController {
  constructor(private activityLogsService: ActivityLogsService) {}

  @Get()
  async findRecent(@Query('limit') limit = 50) {
    const data = await this.activityLogsService.findRecent(+limit);
    return { success: true, data };
  }
}
