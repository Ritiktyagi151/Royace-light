import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EnquiryDocument = Enquiry & Document;

export enum EnquiryStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
}

@Schema({ timestamps: true })
export class Enquiry {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, trim: true })
  subject: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ trim: true, default: 'contact-us' })
  source: string;

  @Prop({ trim: true })
  product?: string;

  @Prop({ type: String, enum: EnquiryStatus, default: EnquiryStatus.NEW })
  status: EnquiryStatus;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt?: Date;
}

export const EnquirySchema = SchemaFactory.createForClass(Enquiry);
EnquirySchema.index({ status: 1, createdAt: -1 });
EnquirySchema.index({ isRead: 1, createdAt: -1 });
EnquirySchema.index({ email: 1, createdAt: -1 });
