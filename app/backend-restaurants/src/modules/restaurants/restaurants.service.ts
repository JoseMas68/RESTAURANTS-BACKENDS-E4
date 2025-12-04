import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Restaurant, Schedule } from '@prisma/client';
import dayjs from 'dayjs';
import { buildSlug } from '@common/utils/slug.util';
import { RestaurantsRepository } from './restaurants.repository';
import { QueryRestaurantsDto } from './dto/query-restaurants.dto';
import { RestaurantEntity } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { ErrorCodes } from '@common/exceptions/error-codes';
import { RESTAURANTS_MOCK } from './mock/restaurants.mock';

@Injectable()
export class RestaurantsService {
  constructor(private readonly repository: RestaurantsRepository) {}

  async findAll(query: QueryRestaurantsDto) {
    // Retornar datos mock
    const page = query.page || 1;
    const limit = query.limit || 10;
    
    let filtered = RESTAURANTS_MOCK;
    
    // Filtrar por búsqueda
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchLower) ||
          r.description.toLowerCase().includes(searchLower) ||
          r.cuisine.toLowerCase().includes(searchLower)
      );
    }

    // Aplicar paginación
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = filtered.slice(start, end);

    return {
      data: data.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        description: restaurant.description,
        imageUrl: restaurant.imageUrl,
        address: restaurant.address,
        phone: restaurant.phone,
        email: restaurant.email,
        cuisine: restaurant.cuisine,
        rating: restaurant.rating,
        reviewCount: restaurant.reviewCount,
        isOpen: restaurant.isOpen,
      })),
      pagination: {
        page,
        limit,
        total: filtered.length,
        pages: Math.ceil(filtered.length / limit),
      },
    };
  }

  async findOne(identifier: string) {
    // Buscar en mock por ID o slug
    const restaurant = RESTAURANTS_MOCK.find(
      (r) => r.id === identifier || r.slug === identifier
    );

    if (!restaurant) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Restaurant not found' });
    }

    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description,
      imageUrl: restaurant.imageUrl,
      address: restaurant.address,
      phone: restaurant.phone,
      email: restaurant.email,
      cuisine: restaurant.cuisine,
      rating: restaurant.rating,
      reviewCount: restaurant.reviewCount,
      isOpen: restaurant.isOpen,
      schedule: restaurant.schedule,
    };
  }

  async getMenus(restaurantId: string) {
    const { MENUS_MOCK } = await import('./mock/restaurants.mock');
    return (MENUS_MOCK as Record<string, any>)[restaurantId] || [];
  }

  async create(dto: CreateRestaurantDto) {
    const slug = await this.generateUniqueSlug(dto.name);

    const restaurant = await this.repository.create(
      {
        name: dto.name,
        slug,
        description: dto.description,
        phone: dto.phone,
        email: dto.email,
        logoUrl: dto.logoUrl,
        coverImageUrl: dto.coverImageUrl,
        addressLine: dto.addressLine,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country ?? 'México',
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        owner: {
          connect: { id: dto.ownerId },
        },
        isActive: dto.isActive ?? true,
      },
      dto.schedules,
    );

    return RestaurantEntity.fromPrisma(restaurant, {
      isOpen: this.isOpenNow(restaurant.schedules),
    });
  }

  async update(id: string, dto: UpdateRestaurantDto) {
    const restaurant = await this.repository.findByIdentifier(id);
    if (!restaurant) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Restaurant not found' });
    }

    let slug: string | undefined;
    if (dto.name && dto.name !== restaurant.name) {
      slug = await this.generateUniqueSlug(dto.name, restaurant.id);
    }

    const updated = await this.repository.update(
      restaurant.id,
      {
        name: dto.name,
        slug,
        description: dto.description,
        phone: dto.phone,
        email: dto.email,
        logoUrl: dto.logoUrl,
        coverImageUrl: dto.coverImageUrl,
        addressLine: dto.addressLine,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country,
        latitude: dto.latitude,
        longitude: dto.longitude,
        isActive: dto.isActive,
        owner: dto.ownerId ? { connect: { id: dto.ownerId } } : undefined,
      },
      dto.schedules,
    );

    return RestaurantEntity.fromPrisma(updated, {
      isOpen: this.isOpenNow(updated.schedules),
    });
  }

  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    let baseSlug = buildSlug(name);
    if (!baseSlug) {
      baseSlug = buildSlug(`restaurant-${Date.now()}`);
    }

    let candidate = baseSlug;
    let counter = 1;

    while (await this.repository.isSlugTaken(candidate, excludeId)) {
      counter += 1;
      candidate = `${baseSlug}-${counter}`;
      if (counter > 100) {
        throw new ConflictException({
          code: ErrorCodes.CONFLICT,
          message: 'Unable to generate unique slug',
        });
      }
    }

    return candidate;
  }

  private isOpenNow(schedules: Schedule[]): boolean {
    const now = dayjs();
    const today = now.day();
    const schedule = schedules.find((item) => item.dayOfWeek === today);

    if (!schedule || schedule.isClosed) {
      return false;
    }

    const referenceDate = now.format('YYYY-MM-DD');
    const openAt = dayjs(`${referenceDate}T${schedule.openTime}`);
    const closeAt = dayjs(`${referenceDate}T${schedule.closeTime}`);

    return now.isAfter(openAt) && now.isBefore(closeAt);
  }
}
