import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeletedItemsController } from './deleted-items.controller';
import { DeletedItemsService } from './deleted-items.service';
import { DeletedItem, DeletedItemSchema } from './schemas/deleted-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DeletedItem.name, schema: DeletedItemSchema }]),
  ],
  controllers: [DeletedItemsController],
  providers: [DeletedItemsService],
  exports: [DeletedItemsService],
})
export class DeletedItemsModule {}
