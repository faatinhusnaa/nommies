import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. GET /users (Admin Console list)
  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all registered users (Admin)' })
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAll(paginationQuery);
  }

  // 2. GET /users/me
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  getProfile(@Request() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.usersService.findOne(userId);
  }

  // 3. PATCH /users/me
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  updateProfile(@Request() req: any, @Body() dto: UpdateUserDto) {
    const userId = req.user.sub || req.user.id;
    return this.usersService.update(userId, dto);
  }

  // 4. PATCH /users/:id/reset-points
  @Patch(':id/reset-points')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  resetPoints(
    @Param('id', ParseIntPipe) id: number,
    @Body('points') points: number,
  ) {
    return this.usersService.resetPoints(id, points ?? 0);
  }

  // POST /users/me/treats — Log treats for the current user
  @Post('me/treats')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  logTreat(
    @Request() req: any,
    @Body('treatName') treatName: string,
    @Body('points') points: number,
  ) {
    const userId = req.user.sub || req.user.id;
    return this.usersService.logTreat(userId, treatName, points || 25);
  }

  // 5. GET /users/:id (Inspect user)
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // 6. PATCH /users/:id (Role toggle / admin edit)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  // 7. DELETE /users/:id (Purge user)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}