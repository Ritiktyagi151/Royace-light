import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  RegisterVendorDto,
  UpdateProfileDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  private createToken(userId: string): string {
    return this.jwtService.sign({ id: userId });
  }

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new BadRequestException('User already exists');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: hashed,
      role: UserRole.USER,
    });

    const token = this.createToken(String(user._id));
    return { token, userId: user._id, role: user.role, name: user.name, email: user.email, phone: user.phone };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new NotFoundException('User not found');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    const token = this.createToken(String(user._id));
    return { token, userId: user._id, role: user.role, name: user.name, email: user.email, phone: user.phone };
  }

  async registerVendor(dto: RegisterVendorDto) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new BadRequestException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: UserRole.VENDOR,
      shopName: dto.shopName,
      shopDescription: dto.shopDescription,
      phone: dto.phone,
      isActive: true,
    });

    const token = this.createToken(String(user._id));
    return { token, userId: user._id, role: user.role, name: user.name, email: user.email, phone: user.phone, shopName: user.shopName };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const match = await bcrypt.compare(dto.currentPassword, user.password);
    if (!match) throw new UnauthorizedException('Current password is incorrect');

    const same = await bcrypt.compare(dto.newPassword, user.password);
    if (same) throw new BadRequestException('New password must differ from current');

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.userModel.findByIdAndUpdate(userId, { password: hashed });
    return { message: 'Password changed successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userModel.findOne({ email: dto.email, _id: { $ne: user._id } });
      if (existing) throw new BadRequestException('Email already in use');
      user.email = dto.email;
    }
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.phone !== undefined) user.phone = dto.phone;

    await user.save();
    const updated = await this.userModel.findById(userId).select('-password');
    return updated;
  }
}
