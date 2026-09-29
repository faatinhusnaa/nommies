import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Reply } from './entities/reply.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Reply)
    private readonly replyRepository: Repository<Reply>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const user = await this.userRepository.findOneBy({ id: createPostDto.userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${createPostDto.userId} not found`);
    }

    const post = this.postRepository.create({
      title: createPostDto.title,
      content: createPostDto.content,
      user,
      votes: 0,
    });
    const savedPost = await this.postRepository.save(post);

    this.eventsGateway.broadcastNewPost(savedPost);

    return savedPost;
  }

  async findAll(paginationQuery?: PaginationQueryDto) {
    const { page = 1, limit = 50 } = paginationQuery || {};
    const skip = (page - 1) * limit;

    const [data, total] = await this.postRepository.findAndCount({
      relations: {
        user: true,
        replies: {
          user: true,
        },
      },
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: {
        user: true,
        replies: {
          user: true,
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    this.postRepository.merge(post, updatePostDto);
    return await this.postRepository.save(post);
  }

  async remove(id: number): Promise<void> {
    const post = await this.findOne(id);
    await this.postRepository.remove(post);
  }

  async updateVotes(id: number, delta: number): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    post.votes = (post.votes || 0) + delta;
    const updatedPost = await this.postRepository.save(post);

    return updatedPost;
  }

  async createReply(postId: number, userId: number, content: string): Promise<Reply> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const reply = this.replyRepository.create({
      content,
      post,
      user,
    });

    return await this.replyRepository.save(reply);
  }
}