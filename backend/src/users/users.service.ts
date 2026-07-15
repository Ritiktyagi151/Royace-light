import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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

  async toggleActive(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    user.isActive = !user.isActive;
    await user.save();
    return user;
  }

}
