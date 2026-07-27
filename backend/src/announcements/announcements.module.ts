import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { Announcement, AnnouncementSchema } from './schemas/announcement.schema';
import { DeletedItemsModule } from '../deleted-items/deleted-items.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Announcement.name, schema: AnnouncementSchema }]),
    DeletedItemsModule,
  ],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
})
export class AnnouncementsModule {}
