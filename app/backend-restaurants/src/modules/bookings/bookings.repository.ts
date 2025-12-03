import { Injectable } from '@nestjs/common';
import { Prisma, Reservation, Table } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { buildPagination, buildPaginationMeta } from '@common/utils/pagination.util';

export interface PaginatedBookings {
  data: Reservation[];
  pagination: ReturnType<typeof buildPaginationMeta>;
}

@Injectable()
export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async paginate(query: QueryBookingsDto): Promise<PaginatedBookings> {
    const { skip, take, page, limit } = buildPagination({ page: query.page, limit: query.limit });

    const where: Prisma.ReservationWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.restaurantId && { restaurantId: query.restaurantId }),
      ...(query.customerId && { customerId: query.customerId }),
      ...(query.reservationDate && {
        reservationDate: new Date(query.reservationDate),
      }),
      ...(query.search && {
        OR: [
          { reservationNumber: { contains: query.search, mode: 'insensitive' } },
          { notes: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.reservation.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return {
      data,
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(restaurantId: string, id: string): Promise<Reservation | null> {
    return this.prisma.reservation.findFirst({ where: { id, restaurantId } });
  }

  async findByIdForCustomer(customerId: string, id: string): Promise<Reservation | null> {
    return this.prisma.reservation.findFirst({ where: { id, customerId } });
  }

  async create(data: Prisma.ReservationCreateInput): Promise<Reservation> {
    return this.prisma.reservation.create({ data });
  }

  async update(id: string, data: Prisma.ReservationUpdateInput): Promise<Reservation> {
    return this.prisma.reservation.update({ where: { id }, data });
  }

  async releaseTable(tableId: string, reservationDate: Date, reservationTime: string) {
    await this.prisma.reservation.updateMany({
      where: {
        tableId,
        reservationDate,
        reservationTime,
        status: { in: ['pending', 'confirmed'] },
      },
      data: { tableId: null },
    });
  }

  async listTables(restaurantId: string): Promise<Table[]> {
    return this.prisma.table.findMany({
      where: { restaurantId, isAvailable: true },
      orderBy: [{ capacity: 'asc' }],
    });
  }

  async countReservationsForSlot(
    restaurantId: string,
    reservationDate: Date,
    reservationTime: string,
  ): Promise<number> {
    return this.prisma.reservation.count({
      where: {
        restaurantId,
        reservationDate,
        reservationTime,
        status: { in: ['pending', 'confirmed', 'seated'] },
      },
    });
  }

  async generateReservationNumber(tx: Prisma.TransactionClient): Promise<string> {
    const sequence = Date.now().toString().slice(-6);
    return `RES-${sequence}`;
  }
}
