import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ScheduleDto {
  @ApiProperty({ minimum: 0, maximum: 6 })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ example: '09:00' })
  @IsString()
  openTime!: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  closeTime!: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean = false;
}
