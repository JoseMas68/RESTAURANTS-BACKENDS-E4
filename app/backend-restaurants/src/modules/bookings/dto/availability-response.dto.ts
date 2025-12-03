import { ApiProperty } from '@nestjs/swagger';

export class AvailabilitySlotDto {
  @ApiProperty()
  time!: string;

  @ApiProperty()
  isAvailable!: boolean;

  @ApiProperty({ required: false })
  availableTables?: number;
}

export class AvailabilityResponseDto {
  @ApiProperty()
  restaurantId!: string;

  @ApiProperty()
  reservationDate!: string;

  @ApiProperty({ type: () => [AvailabilitySlotDto] })
  slots!: AvailabilitySlotDto[];
}
