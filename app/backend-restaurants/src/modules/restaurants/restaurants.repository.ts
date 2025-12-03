import { Injectable } from '@nestjs/common';
import { Prisma, Restaurant, Schedule } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { buildPagination, buildPaginationMeta } from '@common/utils/pagination.util';
import { QueryRestaurantsDto } from './dto/query-restaurants.dto';
import { ScheduleDto } from './dto/schedule.dto';

export interface PaginatedRestaurants {
  data: Array<Restaurant & { schedules: Schedule[] }>;
  pagination: ReturnType<typeof buildPaginationMeta>;
}

@Injectable()
export class RestaurantsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async paginate(query: QueryRestaurantsDto): Promise<PaginatedRestaurants> {
    const { skip, take, page, limit } = buildPagination({ page: query.page, limit: query.limit });

    const where: Prisma.RestaurantWhereInput = {
      isActive: true,
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query.city && { city: { equals: query.city, mode: 'insensitive' } }),
      ...(typeof query.rating === 'number' && {
        averageRating: { gte: query.rating },
      }),
    };

    const orderBy: Prisma.RestaurantOrderByWithRelationInput[] = [];
    if (query.sortBy) {
      orderBy.push({ [query.sortBy]: query.sortOrder ?? 'desc' } as Prisma.RestaurantOrderByWithRelationInput);
    } else {
      orderBy.push({ createdAt: 'desc' });
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.restaurant.findMany({
        where,
        include: { schedules: true },
        skip,
        take,
        orderBy,
      }),
      this.prisma.restaurant.count({ where }),
    ]);

    return {
      data,
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async findByIdentifier(identifier: string): Promise<Restaurant & { schedules: Schedule[] } | null> {
    return this.prisma.restaurant.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: { schedules: true },
    });
  }

  async create(
    data: Prisma.RestaurantCreateInput,
    schedules: ScheduleDto[],
  ): Promise<Restaurant & { schedules: Schedule[] }> {
    return this.prisma.restaurant.create({
      data: {
        ...data,
        schedules: {
          create: schedules.map((schedule) => ({
            dayOfWeek: schedule.dayOfWeek,
            openTime: schedule.openTime,
            closeTime: schedule.closeTime,
            isClosed: schedule.isClosed ?? false,
          })),
        },
      },
      include: { schedules: true },
    });
  }

  async update(
    id: string,
    data: Prisma.RestaurantUpdateInput,
    schedules: ScheduleDto[] | undefined,
  ): Promise<Restaurant & { schedules: Schedule[] }> {
    return this.prisma.$transaction(async (tx) => {
      if (schedules) {
        await tx.schedule.deleteMany({ where: { restaurantId: id } });
      }

      const restaurant = await tx.restaurant.update({
        where: { id },
        data: {
          ...data,
          ...(schedules && {
            schedules: {
              create: schedules.map((schedule) => ({
                dayOfWeek: schedule.dayOfWeek,
                openTime: schedule.openTime,
                closeTime: schedule.closeTime,
                isClosed: schedule.isClosed ?? false,
              })),
            },
          }),
        },
        include: { schedules: true },
      });

      return restaurant;
    });
  }

  async updateMetrics(
    id: string,
    averages: { averageRating: number; totalReviews: number },
  ): Promise<void> {
    await this.prisma.restaurant.update({
      where: { id },
      data: averages,
    });
  }

  async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true },
    });

    return Boolean(restaurant);
  }
}
