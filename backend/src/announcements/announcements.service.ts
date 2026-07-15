import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';
import { Announcement, AnnouncementDocument } from './schemas/announcement.schema';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectModel(Announcement.name) private announcementModel: Model<AnnouncementDocument>,
  ) {}

  findPublic() {
    return this.announcementModel
      .find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 });
  }

  async findAll(page = 1, limit = 20) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const [announcements, total] = await Promise.all([
      this.announcementModel
        .find()
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      this.announcementModel.countDocuments(),
    ]);

    return { announcements, total, page: pageNum, pages: Math.ceil(total / limitNum) };
  }

  create(dto: CreateAnnouncementDto) {
    return this.announcementModel.create({
      text: dto.text?.trim(),
      link: dto.link?.trim(),
      isActive: dto.isActive ?? true,
      sortOrder: Number(dto.sortOrder || 0),
    });
  }

  async update(id: string, dto: UpdateAnnouncementDto) {
    this.validateObjectId(id);
    const update: any = {};
    if (typeof dto.text !== 'undefined') update.text = dto.text.trim();
    if (typeof dto.link !== 'undefined') update.link = dto.link.trim();
    if (typeof dto.isActive !== 'undefined') update.isActive = dto.isActive;
    if (typeof dto.sortOrder !== 'undefined') update.sortOrder = Number(dto.sortOrder || 0);

    const announcement = await this.announcementModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!announcement) throw new NotFoundException('Announcement not found');
    return announcement;
  }

  async toggle(id: string) {
    this.validateObjectId(id);
    const announcement = await this.announcementModel.findById(id);
    if (!announcement) throw new NotFoundException('Announcement not found');
    announcement.isActive = !announcement.isActive;
    return announcement.save();
  }

  async remove(id: string) {
    this.validateObjectId(id);
    const announcement = await this.announcementModel.findByIdAndDelete(id);
    if (!announcement) throw new NotFoundException('Announcement not found');
    return { id };
  }

  private validateObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid announcement id');
  }
}
