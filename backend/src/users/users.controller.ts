import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard, AdminGuard } from '../auth/guards/auth.guard';
import { CreateManagedUserDto, UpdateManagedUserDto } from './dto/user-management.dto';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('role') role?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    // If page/limit provided, usersService will return paginated object, otherwise array
    const data = await this.usersService.findAll(
      role,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
      search,
    );
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id);
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: CreateManagedUserDto) {
    const data = await this.usersService.create(dto);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateManagedUserDto) {
    const data = await this.usersService.update(id, dto);
    return { success: true, data };
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    const data = await this.usersService.toggleActive(id);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.usersService.remove(id);
    return { success: true, data };
  }
}
