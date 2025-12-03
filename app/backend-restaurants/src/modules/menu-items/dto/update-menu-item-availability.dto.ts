import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class UpdateMenuItemAvailabilityDto {
  @ApiProperty()
  @Type(() => Boolean)
  @IsBoolean()
  isAvailable!: boolean;
}
