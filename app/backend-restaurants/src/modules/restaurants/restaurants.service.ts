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

@Injectable()
export class RestaurantsService {
  constructor(private readonly repository: RestaurantsRepository) {}

  async findAll(query: QueryRestaurantsDto) {
    const result = await this.repository.paginate(query);

    const data = result.data
      .map((restaurant) => ({
        restaurant,
        isOpen: this.isOpenNow(restaurant.schedules),
      }))
      .filter((item) => (typeof query.isOpen === 'boolean' ? item.isOpen === query.isOpen : true))
      .map((item) => RestaurantEntity.fromPrisma(item.restaurant, { isOpen: item.isOpen }));

    return { data, pagination: result.pagination };
  }

  async findOne(identifier: string) {
    const restaurant = await this.repository.findByIdentifier(identifier);
    if (!restaurant) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Restaurant not found' });
    }

    const isOpen = this.isOpenNow(restaurant.schedules);
    return RestaurantEntity.fromPrisma(restaurant, { isOpen });
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
