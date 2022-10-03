import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchController } from './search/search.controller';
import { SearchModule } from './search/search.module';

@Module({
  imports: [SearchModule,
    MongooseModule.forRoot('mongodb://localhost/buffer')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
