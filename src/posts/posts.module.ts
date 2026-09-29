import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { EventsModule } from '../events/events.module';
import { Reply } from './entities/reply.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Reply, User]), EventsModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}