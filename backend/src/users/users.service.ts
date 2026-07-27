import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { CreateManagedUserDto, UpdateManagedUserDto } from './dto/user-management.dto';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { DeletedItemsService } from '../deleted-items/deleted-items.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private deletedItemsService: DeletedItemsService,
  ) {}

  async findAll(role?: string, page?: number, limit?: number, search?: string) {
    const filter: any = {};
    if (role) filter.role = role;
    const cleanedSearch = search?.trim();
    if (cleanedSearch) {
      const regex = new RegExp(this.escapeRegex(cleanedSearch), 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
      ];
    }
    // if pagination requested
    if (page && limit) {
      const pageNum = +page || 1;
      const lim = +limit || 20;
      const [users, total] = await Promise.all([
        this.userModel.find(filter).select('-password').sort({ createdAt: -1 }).skip((pageNum - 1) * lim).limit(lim),
        this.userModel.countDocuments(filter),
      ]);
      return { users, total, page: pageNum, pages: Math.ceil(total / lim) };
    }
    return this.userModel.find(filter).select('-password').sort({ createdAt: -1 });
  }

  private escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateManagedUserDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.userModel.findOne({ email });
    if (existing) throw new BadRequestException('Email already in use');

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      name: dto.name.trim(),
      email,
      password,
      role: dto.role,
      phone: dto.phone?.trim(),
      address: dto.address?.trim(),
      isActive: dto.isActive ?? true,
    });
    return this.userModel.findById(user._id).select('-password');
  }

  async update(id: string, dto: UpdateManagedUserDto) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email.trim().toLowerCase() !== user.email) {
      const email = dto.email.trim().toLowerCase();
      const existing = await this.userModel.findOne({ email, _id: { $ne: user._id } });
      if (existing) throw new BadRequestException('Email already in use');
      user.email = email;
    }
    if (dto.name !== undefined) user.name = dto.name.trim();
    if (dto.phone !== undefined) user.phone = dto.phone.trim();
    if (dto.address !== undefined) user.address = dto.address.trim();
    if (dto.isActive !== undefined && user.role === UserRole.ADMIN && user.isActive && !dto.isActive) {
      await this.ensureAnotherAdmin(id, 'At least one active admin must remain');
    }
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.password?.trim()) user.password = await bcrypt.hash(dto.password, 10);

    if (dto.role && dto.role !== user.role) {
      if (user.role === UserRole.ADMIN && dto.role !== UserRole.ADMIN) {
        await this.ensureAnotherAdmin(id, 'At least one admin must remain');
      }
      user.role = dto.role;
    }

    await user.save();
    return this.userModel.findById(id).select('-password');
  }

  async toggleActive(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.ADMIN && user.isActive) {
      await this.ensureAnotherAdmin(id, 'At least one active admin must remain');
    }
    user.isActive = !user.isActive;
    await user.save();
    return this.userModel.findById(id).select('-password');
  }

  async remove(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.ADMIN) {
      await this.ensureAnotherAdmin(id, 'Last admin cannot be deleted');
    }
    await this.deletedItemsService.archiveDocument(user, 'user', user.name || user.email || String(user._id));
    await user.deleteOne();
    return { deleted: true };
  }

  private async ensureAnotherAdmin(id: string, message: string) {
    const admins = await this.userModel.countDocuments({
      _id: { $ne: id },
      role: UserRole.ADMIN,
      isActive: true,
    });
    if (admins < 1) throw new BadRequestException(message);
  }
}
