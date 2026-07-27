import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEnquiryDto } from './dto/enquiry.dto';
import { Enquiry, EnquiryDocument, EnquiryStatus } from './schemas/enquiry.schema';
import { DeletedItemsService } from '../deleted-items/deleted-items.service';

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectModel(Enquiry.name) private enquiryModel: Model<EnquiryDocument>,
    private deletedItemsService: DeletedItemsService,
  ) {}

  async create(dto: CreateEnquiryDto) {
    const email = String(dto.email || '').trim().toLowerCase();
    if (!email) throw new BadRequestException('Email address is required');

    return this.enquiryModel.create({
      name: dto.name?.trim(),
      email,
      phone: dto.phone?.trim(),
      subject: dto.subject?.trim(),
      message: dto.message?.trim(),
      source: dto.source?.trim() || 'contact-us',
      product: dto.product?.trim(),
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    read?: string;
  }) {
    const pageNum = Math.max(1, Number(query.page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const filter: any = {};

    if (query.status && Object.values(EnquiryStatus).includes(query.status as EnquiryStatus)) {
      filter.status = query.status;
    }

    if (query.read === 'true') filter.isRead = true;
    if (query.read === 'false') filter.isRead = false;

    const cleanedSearch = query.search?.trim();
    if (cleanedSearch) {
      const regex = new RegExp(this.escapeRegex(cleanedSearch), 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { subject: regex },
        { message: regex },
        { product: regex },
      ];
    }

    const [enquiries, total] = await Promise.all([
      this.enquiryModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      this.enquiryModel.countDocuments(filter),
    ]);

    return { enquiries, total, page: pageNum, pages: Math.ceil(total / limitNum) };
  }

  async getStats() {
    const [total, unread, newCount, contacted, inProgress, closed] = await Promise.all([
      this.enquiryModel.countDocuments(),
      this.enquiryModel.countDocuments({ isRead: false }),
      this.enquiryModel.countDocuments({ status: EnquiryStatus.NEW }),
      this.enquiryModel.countDocuments({ status: EnquiryStatus.CONTACTED }),
      this.enquiryModel.countDocuments({ status: EnquiryStatus.IN_PROGRESS }),
      this.enquiryModel.countDocuments({ status: EnquiryStatus.CLOSED }),
    ]);

    return { total, unread, new: newCount, contacted, inProgress, closed };
  }

  async markRead(id: string) {
    this.validateObjectId(id);
    const enquiry = await this.enquiryModel.findByIdAndUpdate(
      id,
      { $set: { isRead: true, readAt: new Date() } },
      { new: true },
    );
    if (!enquiry) throw new NotFoundException('Enquiry not found');
    return enquiry;
  }

  async updateStatus(id: string, status: EnquiryStatus) {
    this.validateObjectId(id);
    const enquiry = await this.enquiryModel.findByIdAndUpdate(
      id,
      { $set: { status, isRead: true, readAt: new Date() } },
      { new: true, runValidators: true },
    );
    if (!enquiry) throw new NotFoundException('Enquiry not found');
    return enquiry;
  }

  async remove(id: string) {
    this.validateObjectId(id);
    const enquiry = await this.enquiryModel.findById(id);
    if (!enquiry) throw new NotFoundException('Enquiry not found');
    await this.deletedItemsService.archiveDocument(
      enquiry,
      'enquiry',
      enquiry.subject || enquiry.email || enquiry.name || String(enquiry._id),
    );
    await this.enquiryModel.findByIdAndDelete(id);
    return { id };
  }

  private validateObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid enquiry id');
  }

  private escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
