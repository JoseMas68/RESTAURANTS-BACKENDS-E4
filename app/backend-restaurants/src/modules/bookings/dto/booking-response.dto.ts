import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '@prisma/client';

export class BookingResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  reservationNumber!: string;

  @ApiProperty()
  restaurantId!: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty({ required: false })
  tableId?: string;

  @ApiProperty()
  partySize!: number;

  @ApiProperty()
  reservationDate!: string;

  @ApiProperty()
  reservationTime!: string;

  @ApiProperty()
  durationMinutes!: number;

  @ApiProperty({ enum: ReservationStatus })
  status!: ReservationStatus;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ required: false })
  confirmedAt?: string;

  @ApiProperty({ required: false })
  cancelledAt?: string;

  @ApiProperty({ required: false })
  cancellationReason?: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
