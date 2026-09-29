// src/auth/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UserAnswersDto {
  @ApiProperty({
    example: 'long',
    enum: ['short', 'medium_short', 'medium_long', 'long'],
    description: 'Choice for time horizon',
  })
  @IsIn(['short', 'medium_short', 'medium_long', 'long'])
  time_horizon: string;

  @ApiProperty({
    example: 'buy_dip',
    enum: ['panic_sell', 'cut_losses', 'hold', 'buy_dip'],
    description: 'Reaction to market drop',
  })
  @IsIn(['panic_sell', 'cut_losses', 'hold', 'buy_dip'])
  volatility_reaction: string;

  @ApiProperty({
    example: 'growth',
    enum: ['preserve', 'balanced', 'growth'],
    description: 'Investment goal',
  })
  @IsIn(['preserve', 'balanced', 'growth'])
  goal: string;

  @ApiProperty({
    example: 'intermediate',
    enum: ['beginner', 'intermediate', 'expert'],
    description: 'Experience level',
  })
  @IsIn(['beginner', 'intermediate', 'expert'])
  experience: string;
}

export class RegisterWithQuizDto {
  @ApiProperty({ example: 'Husna' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'admin', required: false })
  @IsOptional()
  @IsIn(['user', 'admin'])
  role?: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ type: () => UserAnswersDto })
  @ValidateNested()
  @Type(() => UserAnswersDto)
  quiz: UserAnswersDto;
}