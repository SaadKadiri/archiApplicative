import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './chat/chat.entity';
import { ChatGPTService } from './AI/ai.service';
import { ChatService } from './chat/chat.service';
import { ChatController } from './chat/chat.controller';
import { HttpModule } from '@nestjs/axios';
import * as dotenv from 'dotenv';
import { Product } from './product/product.entity';
import { Generation } from './generation/generation.entity';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      entities: [Conversation, Product, Generation],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Conversation, Product, Generation]),
    HttpModule,
  ],
  providers: [ChatGPTService, ChatService],
  controllers: [ChatController],
})
export class AppModule {}
