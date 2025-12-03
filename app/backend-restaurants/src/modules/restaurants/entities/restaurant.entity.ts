import { Restaurant, Schedule } from '@prisma/client';
import { RestaurantResponseDto } from '../dto/restaurant-response.dto';
import { ScheduleEntity } from './schedule.entity';

export class RestaurantEntity {
  static fromPrisma(
    restaurant: Restaurant & { schedules: Schedule[] },
    options?: { isOpen?: boolean },
  ): RestaurantResponseDto {
    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description ?? undefined,
      phone: restaurant.phone,
      email: restaurant.email ?? undefined,
      logoUrl: restaurant.logoUrl ?? undefined,
      coverImageUrl: restaurant.coverImageUrl ?? undefined,
      addressLine: restaurant.addressLine,
      city: restaurant.city,
      state: restaurant.state ?? undefined,
      postalCode: restaurant.postalCode ?? undefined,
      country: restaurant.country,
      latitude: restaurant.latitude?.toNumber(),
      longitude: restaurant.longitude?.toNumber(),
      averageRating: Number(restaurant.averageRating),
      totalReviews: restaurant.totalReviews,
      isActive: restaurant.isActive,
      ownerId: restaurant.ownerId,
      schedules: restaurant.schedules.map(ScheduleEntity.fromPrisma),
      createdAt: restaurant.createdAt.toISOString(),
      updatedAt: restaurant.updatedAt.toISOString(),
      isOpen: options?.isOpen ?? false,
    };
  }
}
