import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  Head,
  Options,
  Header,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../auth/enum/role.enum';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // GET /users/me
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get current logged-in user profile' })
  getMyProfile(@Request() req: any) {
    const currentUserId = req.user.sub || req.user.id;
    return this.usersService.getProfile(currentUserId);
  }

  // PATCH /users/me
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update current logged-in user profile' })
  updateMyProfile(@Request() req: any, @Body() dto: UpdateUserDto) {
    const currentUserId = req.user.sub || req.user.id;
    return this.usersService.updateProfile(
      currentUserId,
      { id: currentUserId, role: req.user.role },
      dto,
    );
  }

  // PATCH /users/me/avatar — Upload Profile Picture
  @Patch('me/avatar')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  async uploadAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const currentUserId = req.user.sub || req.user.id;
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(currentUserId, avatarUrl);
  }

  // PATCH /users/:id/reset-points — Admin only
  @Patch(':id/reset-points')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reset or set user treat points (Admin only)' })
  async resetPoints(
    @Param('id', ParseIntPipe) id: number,
    @Body('points') points?: number,
  ) {
    const targetPoints = typeof points === 'number' ? points : 0;
    return this.usersService.updatePoints(id, targetPoints);
  }

  // GET /users — Admin only
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all users with pagination (Admin only)' })
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAll(paginationQuery);
  }

  // GET /users/:id
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Find user by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getProfile(id);
  }

  @Head(':id')
  @Header('X-User-Exists', 'true')
  async head(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.getProfile(id);
  }

  @Options(':id')
  @Header('Allow', 'GET, HEAD, PUT, PATCH, DELETE, OPTIONS')
  options() {
    return;
  }

  // PUT / PATCH /users/:id
  @Put(':id')
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update user by ID' })
  updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(
      id,
      { id: req.user.sub || req.user.id, role: req.user.role },
      dto,
    );
  }

  // DELETE /users/:id — Admin only
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a user by ID (Admin only)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);
  }
}