import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { BookingsRepository } from '../bookings.repository';
import { BookingEntity } from '../entities/booking.entity';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { QueryBookingsDto } from '../dto/query-bookings.dto';
import { ConfirmBookingDto } from '../dto/confirm-booking.dto';
import { UpdateBookingStatusDto } from '../dto/update-booking-status.dto';
import { CancelBookingDto } from '../dto/cancel-booking.dto';
import { AvailabilityService } from './availability.service';
import { QueryAvailabilityDto } from '../dto/query-availability.dto';
import { AvailabilityResponseDto } from '../dto/availability-response.dto';
import { ErrorCodes } from '@common/exceptions/error-codes';

@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly availabilityService: AvailabilityService,
    private readonly prisma: PrismaService,
  ) {}

  async listForCustomer(customerId: string, query: QueryBookingsDto) {
    const result = await this.bookingsRepository.paginate({ ...query, customerId });
    return {
      data: result.data.map(BookingEntity.fromPrisma),
      pagination: result.pagination,
    };
  }

  async listForRestaurant(restaurantId: string, query: QueryBookingsDto) {
    const result = await this.bookingsRepository.paginate({ ...query, restaurantId });
    return {
      data: result.data.map(BookingEntity.fromPrisma),
      pagination: result.pagination,
    };
  }

  async findForRestaurant(restaurantId: string, bookingId: string) {
    const reservation = await this.bookingsRepository.findById(restaurantId, bookingId);
    if (!reservation) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Booking not found' });
    }
    return BookingEntity.fromPrisma(reservation);
  }

  async findForCustomer(customerId: string, bookingId: string) {
    const reservation = await this.bookingsRepository.findByIdForCustomer(customerId, bookingId);
    if (!reservation) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Booking not found' });
    }
    return BookingEntity.fromPrisma(reservation);
  }

  async create(dto: CreateBookingDto) {
    await this.ensureRestaurantExists(dto.restaurantId);
    const availability = await this.availabilityService.checkAvailability(dto.restaurantId, {
      reservationDate: dto.reservationDate,
      reservationTime: dto.reservationTime,
      partySize: dto.partySize,
      durationMinutes: dto.durationMinutes,
      tableId: dto.tableId,
    });

    const slot = availability.slots[0];
    if (!slot?.isAvailable) {
      throw new BadRequestException({
        code: ErrorCodes.RESERVATION_NOT_AVAILABLE,
        message: 'No availability for selected slot',
      });
    }

    const reservation = await this.prisma.$transaction(async (tx) => {
      const reservationNumber = await this.bookingsRepository.generateReservationNumber(tx);
      return tx.reservation.create({
        data: {
          reservationNumber,
          restaurant: { connect: { id: dto.restaurantId } },
          customer: { connect: { id: dto.customerId } },
          table: dto.tableId ? { connect: { id: dto.tableId } } : undefined,
          partySize: dto.partySize,
          reservationDate: new Date(dto.reservationDate),
          reservationTime: dto.reservationTime,
          durationMinutes: dto.durationMinutes ?? 90,
          status: ReservationStatus.pending,
          notes: dto.notes,
        },
      });
    });

    return BookingEntity.fromPrisma(reservation);
  }

  async confirm(restaurantId: string, bookingId: string, dto: ConfirmBookingDto) {
    const reservation = await this.bookingsRepository.findById(restaurantId, bookingId);
    if (!reservation) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Booking not found' });
    }

    const tableId = dto.tableId ?? reservation.tableId;
    if (tableId) {
      const table = await this.prisma.table.findFirst({
        where: { id: tableId, restaurantId },
      });
      if (!table) {
        throw new BadRequestException({ code: ErrorCodes.VALIDATION_ERROR, message: 'Invalid table' });
      }
    }

    const updated = await this.bookingsRepository.update(reservation.id, {
      status: ReservationStatus.confirmed,
      table: tableId ? { connect: { id: tableId } } : undefined,
      notes: dto.notes ?? reservation.notes,
      confirmedAt: new Date(),
    });

    return BookingEntity.fromPrisma(updated);
  }

  async updateStatus(restaurantId: string, bookingId: string, dto: UpdateBookingStatusDto) {
    const reservation = await this.bookingsRepository.findById(restaurantId, bookingId);
    if (!reservation) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Booking not found' });
    }

    const updated = await this.bookingsRepository.update(reservation.id, {
      status: dto.status,
    });

    return BookingEntity.fromPrisma(updated);
  }

  async cancel(customerId: string, bookingId: string, dto: CancelBookingDto) {
    const reservation = await this.bookingsRepository.findByIdForCustomer(customerId, bookingId);
    if (!reservation) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Booking not found' });
    }

    const updated = await this.bookingsRepository.update(reservation.id, {
      status: ReservationStatus.cancelled,
      cancellationReason: dto.reason,
      cancelledAt: new Date(),
    });

    return BookingEntity.fromPrisma(updated);
  }

  async checkAvailability(restaurantId: string, query: QueryAvailabilityDto): Promise<AvailabilityResponseDto> {
    await this.ensureRestaurantExists(restaurantId);
    return this.availabilityService.checkAvailability(restaurantId, query);
  }

  private async ensureRestaurantExists(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true },
    });
    if (!restaurant) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Restaurant not found' });
    }
  }
}
