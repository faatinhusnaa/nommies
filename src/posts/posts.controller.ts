// src/posts/posts.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1. GET /posts — Fetch all posts (needed to display the feed)
  @Get()
  @ApiOperation({ summary: 'Get all community dispatches' })
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.postsService.findAll(paginationQuery);
  }

  // 2. POST /posts — Create new post (needed for "Dispatch to Wire")
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dispatch a new post to the wire' })
  create(@Request() req: any, @Body() body: { title: string; content: string }) {
    const userId = req.user.sub || req.user.id;
    return this.postsService.create({
      title: body.title,
      content: body.content,
      userId,
    });
  }

  // 3. GET /posts/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get a single post by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  // 4. POST /posts/:id/vote — Upvote / Downvote
  @Post(':id/vote')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vote on a post' })
  vote(
    @Param('id', ParseIntPipe) id: number,
    @Body('direction') direction: 'up' | 'down',
  ) {
    const delta = direction === 'up' ? 1 : -1;
    return this.postsService.updateVotes(id, delta);
  }

  // 5. POST /posts/:id/replies — Add reply
  @Post(':id/replies')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reply to a post' })
  addReply(
    @Param('id', ParseIntPipe) postId: number,
    @Request() req: any,
    @Body('content') content: string,
  ) {
    const userId = req.user.sub || req.user.id;
    return this.postsService.createReply(postId, userId, content);
  }

  // 6. DELETE /posts/:id
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }
}