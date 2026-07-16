import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../../users/schemas/user.schema';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      // Support both Bearer token and custom 'token' header (legacy)
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => req?.headers?.['token'] as string || null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { id: string; source?: string }) {
    if (payload.source === 'env-admin' && payload.id === 'env-admin') {
      const email = this.config.get<string>('ADMIN_EMAIL')?.trim().toLowerCase();
      const password = this.config.get<string>('ADMIN_PASSWORD');
      const name = this.config.get<string>('ADMIN_NAME')?.trim() || 'Admin';

      if (!email || !password) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      return {
        _id: 'env-admin',
        id: 'env-admin',
        name,
        email,
        role: UserRole.ADMIN,
        isActive: true,
      };
    }

    const user = await this.userModel.findById(payload.id).select('-password');
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
