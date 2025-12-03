import { ApiProperty } from '@nestjs/swagger';
import { ScheduleDto } from './schedule.dto';

export class RestaurantResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  phone!: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  logoUrl?: string;

  @ApiProperty({ required: false })
  coverImageUrl?: string;

  @ApiProperty()
  addressLine!: string;

  @ApiProperty()
  city!: string;

  @ApiProperty({ required: false })
  state?: string;

  @ApiProperty({ required: false })
  postalCode?: string;

  @ApiProperty()
  country!: string;

  @ApiProperty({ type: Number, required: false })
  latitude?: number;

  @ApiProperty({ type: Number, required: false })
  longitude?: number;

  @ApiProperty({ type: Number })
  averageRating!: number;

  @ApiProperty()
  totalReviews!: number;

  @ApiProperty({ description: 'Flag computed using todays schedule', default: false })
  isOpen!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  ownerId!: string;

  @ApiProperty({ type: () => [ScheduleDto] })
  schedules!: ScheduleDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
