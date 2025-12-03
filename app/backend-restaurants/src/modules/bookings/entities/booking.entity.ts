import { Reservation } from '@prisma/client';
import { BookingResponseDto } from '../dto/booking-response.dto';

export class BookingEntity {
  static fromPrisma(reservation: Reservation): BookingResponseDto {
    return {
      id: reservation.id,
      reservationNumber: reservation.reservationNumber,
      restaurantId: reservation.restaurantId,
      customerId: reservation.customerId,
      tableId: reservation.tableId ?? undefined,
      partySize: reservation.partySize,
      reservationDate: reservation.reservationDate.toISOString().split('T')[0],
      reservationTime: reservation.reservationTime,
      durationMinutes: reservation.durationMinutes,
      status: reservation.status,
      notes: reservation.notes ?? undefined,
      confirmedAt: reservation.confirmedAt?.toISOString(),
      cancelledAt: reservation.cancelledAt?.toISOString(),
      cancellationReason: reservation.cancellationReason ?? undefined,
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
    };
  }
}
