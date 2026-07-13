import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivityLog, ActivityLogDocument } from './schemas/activity-log.schema';

interface ActivityActor {
  _id?: string;
  name?: string;
  role?: string;
}

interface LogActivityInput {
  actor?: ActivityActor;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectModel(ActivityLog.name) private activityLogModel: Model<ActivityLogDocument>,
  ) {}

  async log(input: LogActivityInput) {
    const actorId = input.actor?._id && Types.ObjectId.isValid(input.actor._id)
      ? new Types.ObjectId(input.actor._id)
      : undefined;

    return this.activityLogModel.create({
      actorId,
      actorName: input.actor?.name,
      actorRole: input.actor?.role,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata || {},
    });
  }

  async findRecent(limit = 50) {
    return this.activityLogModel
      .find()
      .sort({ createdAt: -1 })
      .limit(Math.min(100, Math.max(1, Number(limit) || 50)));
  }
}
