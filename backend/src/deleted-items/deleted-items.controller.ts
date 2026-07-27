import { Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, AdminGuard } from '../auth/guards/auth.guard';
import { DeletedItemsService } from './deleted-items.service';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('deleted-items')
export class DeletedItemsController {
  constructor(private deletedItemsService: DeletedItemsService) {}

  @Get('admin/all')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('entityType') entityType?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.deletedItemsService.findAll({
      page: Number(page),
      limit: Number(limit),
      entityType,
      search,
    });
    return { success: true, data };
  }

  @Patch('admin/:id/restore')
  async restore(@Param('id') id: string) {
    const data = await this.deletedItemsService.restore(id);
    return { success: true, ...data };
  }

  @Delete('admin/:id/permanent')
  async permanentlyDelete(@Param('id') id: string) {
    const data = await this.deletedItemsService.permanentlyDelete(id);
    return { success: true, ...data };
  }
}
