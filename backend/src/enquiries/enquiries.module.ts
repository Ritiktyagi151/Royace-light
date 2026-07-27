import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnquiriesController } from './enquiries.controller';
import { EnquiriesService } from './enquiries.service';
import { Enquiry, EnquirySchema } from './schemas/enquiry.schema';
import { DeletedItemsModule } from '../deleted-items/deleted-items.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Enquiry.name, schema: EnquirySchema }]),
    DeletedItemsModule,
  ],
  controllers: [EnquiriesController],
  providers: [EnquiriesService],
})
export class EnquiriesModule {}
