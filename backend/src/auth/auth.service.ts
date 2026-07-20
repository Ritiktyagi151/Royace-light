import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { AuthOtp, AuthOtpDocument } from './schemas/auth-otp.schema';
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  UpdateProfileDto,
  SendRegisterOtpDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(AuthOtp.name) private otpModel: Model<AuthOtpDocument>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  private createToken(userId: string): string {
    return this.jwtService.sign({ id: userId });
  }

  private createEnvAdminToken(): string {
    return this.jwtService.sign({ id: 'env-admin', source: 'env-admin' });
  }

  private getEnvAdmin() {
    const email = this.config.get<string>('ADMIN_EMAIL')?.trim().toLowerCase();
    const password = this.config.get<string>('ADMIN_PASSWORD');
    const name = this.config.get<string>('ADMIN_NAME')?.trim() || 'Admin';

    if (!email || !password) return null;
    return { email, password, name };
  }

  async sendRegisterOtp(dto: SendRegisterOtpDto) {
    const phone = this.normalizePhone(dto.phone);
    const existingPhone = await this.userModel.findOne({ phone });
    if (existingPhone) throw new BadRequestException('Phone number already registered');

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 10);
    await this.otpModel.updateMany({ phone, purpose: 'register', used: false }, { used: true });
    await this.otpModel.create({
      phone,
      codeHash,
      purpose: 'register',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const smsSent = await this.sendSmsOtp(phone, code);
    const response: any = { phone, expiresInMinutes: 10, smsSent };
    if (!smsSent && this.config.get<string>('NODE_ENV') !== 'production') {
      response.devOtp = code;
      this.logger.warn(`SMS OTP not sent. Development OTP for ${phone}: ${code}`);
    }
    return response;
  }

  async register(dto: RegisterDto) {
    const phone = this.normalizePhone(dto.phone);
    if (dto.otp?.trim()) {
      await this.verifyRegisterOtp(phone, dto.otp);
    }

    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new BadRequestException('User already exists');
    const existingPhone = await this.userModel.findOne({ phone });
    if (existingPhone) throw new BadRequestException('Phone number already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      phone,
      password: hashed,
      role: UserRole.USER,
    });

    const token = this.createToken(String(user._id));
    return { token, userId: user._id, role: user.role, name: user.name, email: user.email, phone: user.phone };
  }

  private async verifyRegisterOtp(phone: string, otp: string) {
    const entry = await this.otpModel
      .findOne({ phone, purpose: 'register', used: false, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 });
    if (!entry) throw new BadRequestException('OTP expired or not found');

    const match = await bcrypt.compare(String(otp || ''), entry.codeHash);
    if (!match) throw new BadRequestException('Invalid OTP');
    entry.used = true;
    await entry.save();
  }

  private normalizePhone(phone?: string) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length === 10) return digits;
    if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
    throw new BadRequestException('Enter a valid 10-digit phone number');
  }

  private async sendSmsOtp(phone: string, code: string) {
    const authKey = this.config.get<string>('MSG91_AUTH_KEY');
    const templateId = this.config.get<string>('MSG91_OTP_TEMPLATE_ID');
    const senderId = this.config.get<string>('MSG91_SENDER_ID') || 'ROYACE';
    if (!authKey || !templateId) {
      this.logger.warn('MSG91_AUTH_KEY or MSG91_OTP_TEMPLATE_ID is missing. SMS OTP is disabled.');
      return false;
    }

    try {
      const response = await fetch('https://control.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          authkey: authKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: templateId,
          sender: senderId,
          short_url: '0',
          mobiles: `91${phone}`,
          OTP: code,
          otp: code,
        }),
      });
      if (!response.ok) {
        this.logger.warn(`MSG91 OTP request failed with status ${response.status}`);
      }
      return response.ok;
    } catch (error) {
      this.logger.warn(`MSG91 OTP request failed: ${(error as Error).message}`);
      return false;
    }
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

  async adminLogin(dto: LoginDto) {
    const envAdmin = this.getEnvAdmin();
    const email = dto.email.trim().toLowerCase();

    if (envAdmin && email === envAdmin.email && dto.password === envAdmin.password) {
      const token = this.createEnvAdminToken();
      return {
        token,
        userId: 'env-admin',
        role: UserRole.ADMIN,
        name: envAdmin.name,
        email: envAdmin.email,
      };
    }

    const user = await this.userModel.findOne({ email, role: UserRole.ADMIN });
    if (!user) throw new UnauthorizedException('Invalid admin credentials');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid admin credentials');
    if (!user.isActive) throw new UnauthorizedException('Admin account is deactivated');

    const token = this.createToken(String(user._id));
    return {
      token,
      userId: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    };
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
