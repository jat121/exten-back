import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule { }
