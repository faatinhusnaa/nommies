// src/users/dto/pagination-query.dto.ts
import { IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, description: 'Page number (starts at 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page: number = 1;

  @ApiPropertyOptional({ default: 10, description: 'Number of items per page' })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit: number = 10;
}