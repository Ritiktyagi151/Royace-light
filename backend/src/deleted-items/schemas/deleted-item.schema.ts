import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type DeletedItemDocument = DeletedItem & Document;

@Schema({ timestamps: true })
export class DeletedItem {
  @Prop({ required: true, trim: true })
  entityType: string;

  @Prop({ required: true, trim: true })
  entityId: string;

  @Prop({ required: true, trim: true })
  label: string;

  @Prop({ required: true, trim: true })
  collectionName: string;

  @Prop({ required: true, trim: true })
  modelName: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  snapshot: Record<string, unknown>;

  @Prop({ type: Object })
  deletedBy?: {
    id?: string;
    name?: string;
    role?: string;
  };

  @Prop({ type: Date, default: Date.now })
  deletedAt: Date;

  _id: Types.ObjectId;
}

export const DeletedItemSchema = SchemaFactory.createForClass(DeletedItem);
DeletedItemSchema.index({ entityType: 1, deletedAt: -1 });
DeletedItemSchema.index({ entityId: 1, entityType: 1 });
