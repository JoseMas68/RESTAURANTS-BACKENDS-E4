import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { MenuItemsRepository } from './menu-items.repository';
import { QueryMenuItemsDto } from './dto/query-menu-items.dto';
import { MenuItemEntity } from './entities/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { UpdateMenuItemAvailabilityDto } from './dto/update-menu-item-availability.dto';
import { buildSlug } from '@common/utils/slug.util';
import { ErrorCodes } from '@common/exceptions/error-codes';
import { MenuGroupedResponseDto } from './dto/menu-group-response.dto';

@Injectable()
export class MenuItemsService {
  constructor(
    private readonly repository: MenuItemsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async paginate(restaurantId: string, query: QueryMenuItemsDto) {
    await this.ensureRestaurantExists(restaurantId);
    const result = await this.repository.paginate(restaurantId, query);

    return {
      data: result.data.map(MenuItemEntity.fromPrisma),
      pagination: result.pagination,
    };
  }

  async findOne(restaurantId: string, itemId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: itemId, restaurantId },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Menu item not found' });
    }

    return MenuItemEntity.fromPrisma(product);
  }

  async create(restaurantId: string, dto: CreateMenuItemDto) {
    await this.ensureRestaurantExists(restaurantId);

    const category = await this.prisma.category.findFirst({
      where: { id: dto.categoryId, restaurantId },
    });

    if (!category) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Category not found' });
    }

    const slug = await this.generateUniqueSlug(restaurantId, dto.name);

    const product = await this.repository.create({
      name: dto.name,
      slug,
      description: dto.description,
      price: dto.price,
      discountPrice: dto.discountPrice,
      imageUrl: dto.imageUrl,
      preparationTime: dto.preparationTime,
      calories: dto.calories,
      isVegetarian: dto.isVegetarian ?? false,
      isVegan: dto.isVegan ?? false,
      isGlutenFree: dto.isGlutenFree ?? false,
      isFeatured: dto.isFeatured ?? false,
      isAvailable: dto.isAvailable ?? true,
      displayOrder: dto.displayOrder ?? 0,
      restaurant: { connect: { id: restaurantId } },
      category: { connect: { id: dto.categoryId } },
    });

    return this.findOne(restaurantId, product.id);
  }

  async update(restaurantId: string, itemId: string, dto: UpdateMenuItemDto) {
    const existing = await this.repository.findById(restaurantId, itemId);

    if (!existing) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Menu item not found' });
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, restaurantId },
      });
      if (!category) {
        throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Category not found' });
      }
    }

    let slug: string | undefined;
    if (dto.name && dto.name !== existing.name) {
      slug = await this.generateUniqueSlug(restaurantId, dto.name, itemId);
    }

    await this.repository.update(itemId, {
      name: dto.name,
      slug,
      description: dto.description,
      price: dto.price,
      discountPrice: dto.discountPrice,
      imageUrl: dto.imageUrl,
      preparationTime: dto.preparationTime,
      calories: dto.calories,
      isVegetarian: dto.isVegetarian,
      isVegan: dto.isVegan,
      isGlutenFree: dto.isGlutenFree,
      isFeatured: dto.isFeatured,
      isAvailable: dto.isAvailable,
      displayOrder: dto.displayOrder,
      category: dto.categoryId ? { connect: { id: dto.categoryId } } : undefined,
    });

    return this.findOne(restaurantId, itemId);
  }

  async updateAvailability(
    restaurantId: string,
    itemId: string,
    dto: UpdateMenuItemAvailabilityDto,
  ) {
    const existing = await this.repository.findById(restaurantId, itemId);
    if (!existing) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Menu item not found' });
    }

    await this.repository.update(itemId, { isAvailable: dto.isAvailable });

    return this.findOne(restaurantId, itemId);
  }

  async remove(restaurantId: string, itemId: string) {
    const existing = await this.repository.findById(restaurantId, itemId);

    if (!existing) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Menu item not found' });
    }

    await this.repository.remove(itemId);
    return { message: 'Menu item removed' };
  }

  async getMenu(restaurantId: string): Promise<MenuGroupedResponseDto> {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id: restaurantId } });

    if (!restaurant) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Restaurant not found' });
    }

    const categories = await this.repository.listMenu(restaurantId);

    return {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        items: category.products.map((product) =>
          MenuItemEntity.fromPrisma({ ...product, category }),
        ),
      })),
    };
  }

  private async ensureRestaurantExists(restaurantId: string): Promise<void> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true },
    });

    if (!restaurant) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Restaurant not found' });
    }
  }

  private async generateUniqueSlug(
    restaurantId: string,
    value: string,
    excludeId?: string,
  ): Promise<string> {
    let baseSlug = buildSlug(value);
    if (!baseSlug) {
      baseSlug = buildSlug(`menu-item-${Date.now()}`);
    }

    let candidate = baseSlug;
    let counter = 1;

    while (await this.repository.isSlugTaken(restaurantId, candidate, excludeId)) {
      counter += 1;
      candidate = `${baseSlug}-${counter}`;
      if (counter > 100) {
        throw new ConflictException({
          code: ErrorCodes.CONFLICT,
          message: 'Unable to generate unique item slug',
        });
      }
    }

    return candidate;
  }
}
