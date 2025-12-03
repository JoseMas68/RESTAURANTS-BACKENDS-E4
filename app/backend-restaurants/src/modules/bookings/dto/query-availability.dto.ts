import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class QueryAvailabilityDto {
  @ApiProperty({ example: '2025-01-20' })
  @IsDateString()
  reservationDate!: string;

  @ApiProperty({ example: '19:30' })
  reservationTime!: string;

  @ApiProperty({ minimum: 1, maximum: 20 })
  @IsInt()
  @Min(1)
  @Max(20)
  partySize!: number;

  @ApiPropertyOptional({ default: 90 })
  @IsOptional()
  @IsInt()
  @Min(30)
  durationMinutes?: number = 90;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  tableId?: string;
}
