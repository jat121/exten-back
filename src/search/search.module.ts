import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Buff, BufferSchema } from '../models/buffer.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { BufferRepo } from './buffer.repo';

@Module({
  imports: [MongooseModule.forFeature([{ name: Buff.name, schema: BufferSchema }])],
  controllers: [SearchController],
  providers: [SearchService, BufferRepo]
})
export class SearchModule { }
