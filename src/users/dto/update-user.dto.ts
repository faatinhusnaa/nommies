// src/users/dto/update-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../entities/user.entity';
import { UserAnswersDto } from '../../auth/dto/register.dto';

export class UpdateUserDto {
  @ApiProperty({ example: 'Husna New Name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'OldPassword123!', required: false })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiProperty({ example: 'NewPassword123!', required: false })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ type: () => UserAnswersDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserAnswersDto)
  quiz?: UserAnswersDto;
}