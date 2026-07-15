import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthOtpDocument = AuthOtp & Document;

@Schema({ timestamps: true })
export class AuthOtp {
  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, trim: true })
  codeHash: string;

  @Prop({ default: 'register', trim: true })
  purpose: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  used: boolean;
}

export const AuthOtpSchema = SchemaFactory.createForClass(AuthOtp);
AuthOtpSchema.index({ phone: 1, purpose: 1, used: 1 });
AuthOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
