import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { DeletedItem, DeletedItemDocument } from './schemas/deleted-item.schema';

type RestorableDocument = {
  _id: unknown;
  collection: { name: string };
  toObject: (options?: Record<string, unknown>) => Record<string, unknown>;
};

interface Actor {
  _id?: string;
  id?: string;
  name?: string;
  role?: string;
}

const RESTORABLE_COLLECTIONS = new Set([
  'products',
  'categories',
  'coupons',
  'announcements',
  'enquiries',
  'users',
]);

@Injectable()
export class DeletedItemsService {
  constructor(
    @InjectModel(DeletedItem.name) private deletedItemModel: Model<DeletedItemDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  async archiveDocument(
    document: RestorableDocument,
    entityType: string,
    label: string,
    actor?: Actor,
  ) {
    const collectionName = document.collection.name;
    if (!RESTORABLE_COLLECTIONS.has(collectionName)) {
      throw new BadRequestException(`"${collectionName}" cannot be restored from trash`);
    }

    const snapshot = document.toObject({
      depopulate: true,
      flattenMaps: true,
      virtuals: false,
    });
    delete (snapshot as any).id;

    await this.deletedItemModel.create({
      entityType,
      entityId: String(document._id),
      label: label || `${entityType} ${document._id}`,
      collectionName,
      modelName: (document as any).constructor?.modelName || entityType,
      snapshot,
      deletedBy: actor
        ? {
            id: String(actor._id || actor.id || ''),
            name: actor.name,
            role: actor.role,
          }
        : undefined,
      deletedAt: new Date(),
    });
  }

  async findAll(query: { page?: number; limit?: number; entityType?: string; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const filter: any = {};

    if (query.entityType) filter.entityType = query.entityType;
    if (query.search?.trim()) {
      const regex = new RegExp(this.escapeRegex(query.search.trim()), 'i');
      filter.$or = [{ label: regex }, { entityType: regex }, { entityId: regex }];
    }

    const [items, total] = await Promise.all([
      this.deletedItemModel
        .find(filter)
        .select('-snapshot')
        .sort({ deletedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.deletedItemModel.countDocuments(filter),
    ]);

    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async restore(id: string) {
    this.validateObjectId(id);
    const deletedItem = await this.deletedItemModel.findById(id);
    if (!deletedItem) throw new NotFoundException('Deleted item not found');

    if (!RESTORABLE_COLLECTIONS.has(deletedItem.collectionName)) {
      throw new BadRequestException('This item type cannot be restored');
    }

    const snapshot = deletedItem.snapshot as any;
    const originalId = snapshot?._id;
    if (!originalId) throw new BadRequestException('Deleted item snapshot is missing original id');

    const collection = this.connection.collection(deletedItem.collectionName);
    const existing = await collection.findOne({ _id: new Types.ObjectId(String(originalId)) });
    if (existing) {
      throw new ConflictException('A record with this original id already exists');
    }

    try {
      await collection.insertOne(snapshot);
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('Restore failed because a unique field already exists');
      }
      throw error;
    }

    await this.deletedItemModel.findByIdAndDelete(id);
    return { message: `${deletedItem.label} restored successfully` };
  }

  async permanentlyDelete(id: string) {
    this.validateObjectId(id);
    const deletedItem = await this.deletedItemModel.findByIdAndDelete(id);
    if (!deletedItem) throw new NotFoundException('Deleted item not found');
    return { message: `${deletedItem.label} permanently removed from trash` };
  }

  private validateObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid deleted item id');
  }

  private escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
