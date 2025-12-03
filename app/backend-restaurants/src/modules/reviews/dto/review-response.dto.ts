import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  restaurantId!: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty({ required: false })
  orderId?: string;

  @ApiProperty()
  rating!: number;

  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  comment?: string;

  @ApiProperty()
  isVerified!: boolean;

  @ApiProperty()
  isVisible!: boolean;

  @ApiProperty({ required: false })
  response?: string;

  @ApiProperty({ required: false })
  responseAt?: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
