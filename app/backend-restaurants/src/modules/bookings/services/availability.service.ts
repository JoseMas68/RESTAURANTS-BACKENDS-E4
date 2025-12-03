import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { QueryAvailabilityDto } from '../dto/query-availability.dto';
import { AvailabilityResponseDto } from '../dto/availability-response.dto';

const RESERVATION_BLOCK_MINUTES = 15;

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async checkAvailability(
    restaurantId: string,
    query: QueryAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    const reservationDate = new Date(query.reservationDate);
    const reservations = await this.prisma.reservation.findMany({
      where: {
        restaurantId,
        reservationDate,
        reservationTime: query.reservationTime,
        status: { in: ['pending', 'confirmed', 'seated'] },
      },
      select: { tableId: true },
    });

    const tables = await this.prisma.table.findMany({
      where: { restaurantId, isAvailable: true },
      select: { id: true, capacity: true },
      orderBy: { capacity: 'asc' },
    });

    const occupiedTables = new Set(reservations.map((item) => item.tableId).filter(Boolean) as string[]);

    const eligibleTables = tables.filter((table) => table.capacity >= query.partySize);
    const freeTables = eligibleTables.filter((table) => !occupiedTables.has(table.id));

    const isAvailable = query.tableId
      ? freeTables.some((table) => table.id === query.tableId)
      : freeTables.length > 0;

    return {
      restaurantId,
      reservationDate: query.reservationDate,
      slots: [
        {
          time: query.reservationTime,
          isAvailable,
          availableTables: freeTables.length,
        },
        ...this.suggestNearbySlots(query.reservationTime).map((time) => ({
          time,
          isAvailable: true,
          availableTables: freeTables.length,
        })),
      ],
    };
  }

  private suggestNearbySlots(time: string): string[] {
    const [hours, minutes] = time.split(':').map(Number);
    const slots: string[] = [];

    const addMinutes = (delta: number) => {
      const date = new Date();
      date.setHours(hours, minutes + delta, 0, 0);
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      slots.push(`${h}:${m}`);
    };

    addMinutes(-RESERVATION_BLOCK_MINUTES);
    addMinutes(RESERVATION_BLOCK_MINUTES);

    return Array.from(new Set(slots));
  }
}
