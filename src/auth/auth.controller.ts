import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterWithQuizDto } from './dto/register.dto';

export class LoginDto {
  @ApiProperty({ example: 'investor@example.com' })
  @IsEmail({}, { message: 'Must be a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'Password123!', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ example: 'Password123!', required: false })
  @IsOptional()
  @IsString()
  pass?: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'investor@example.com' })
  @IsEmail({}, { message: 'Must be a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  newPassword: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('quiz')
  @ApiOperation({ summary: 'Get investor suitability quiz questions and valid choice keys' })
  @ApiResponse({ status: 200, description: 'List of quiz questions' })
  getQuizQuestions() {
    return this.authService.getQuizQuestions();
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user and assess risk tier via quiz' })
  @ApiResponse({ status: 201, description: 'User registered with assigned risk tier' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async register(@Body() dto: RegisterWithQuizDto) {
    return this.authService.register(dto);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiResponse({ status: 200, description: 'JWT token returned successfully' })
  @ApiResponse({ status: 400, description: 'Missing credentials' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  async login(@Body() loginDto: LoginDto) {
    const password = loginDto.password || loginDto.pass;

    if (!password) {
      throw new BadRequestException('Password is required');
    }

    return this.authService.login(loginDto.email, password);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.email, body.newPassword);
  }
}