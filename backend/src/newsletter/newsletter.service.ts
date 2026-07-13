import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NewsletterSubscriber, NewsletterSubscriberDocument } from './schemas/newsletter-subscriber.schema';
import { SubscribeNewsletterDto } from './dto/newsletter.dto';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(NewsletterSubscriber.name) private subscriberModel: Model<NewsletterSubscriberDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async subscribe(dto: SubscribeNewsletterDto, userId?: string) {
    const email = this.normalizeEmail(dto.email);
    if (!email) throw new BadRequestException('Email address is required');

    const userObjectId = userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : undefined;
    const subscriber = await this.subscriberModel.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          userId: userObjectId,
          isActive: true,
          source: dto.source || 'website',
          subscribedAt: new Date(),
        },
        $unset: { unsubscribedAt: '' },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return {
      email: subscriber.email,
      isActive: subscriber.isActive,
      message: 'Subscribed successfully',
    };
  }

  async getPreference(userId: string) {
    const user = await this.userModel.findById(userId).select('email');
    if (!user) throw new BadRequestException('User not found');

    const subscriber = await this.subscriberModel.findOne({ email: user.email });
    return {
      email: user.email,
      isActive: Boolean(subscriber?.isActive),
      subscribedAt: subscriber?.subscribedAt,
      unsubscribedAt: subscriber?.unsubscribedAt,
    };
  }

  async updatePreference(userId: string, isActive: boolean) {
    const user = await this.userModel.findById(userId).select('email');
    if (!user) throw new BadRequestException('User not found');

    if (isActive) {
      return this.subscribe({ email: user.email, source: 'account' }, userId);
    }

    const subscriber = await this.subscriberModel.findOneAndUpdate(
      { email: user.email },
      {
        $set: {
          email: user.email,
          userId: new Types.ObjectId(userId),
          isActive: false,
          unsubscribedAt: new Date(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return {
      email: subscriber.email,
      isActive: subscriber.isActive,
      message: 'Newsletter preference updated',
    };
  }

  async findAll(page = 1, limit = 20) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const [subscribers, total] = await Promise.all([
      this.subscriberModel
        .find()
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      this.subscriberModel.countDocuments(),
    ]);

    return { subscribers, total, page: pageNum, pages: Math.ceil(total / limitNum) };
  }

  private normalizeEmail(email?: string) {
    return String(email || '').trim().toLowerCase();
  }
}
