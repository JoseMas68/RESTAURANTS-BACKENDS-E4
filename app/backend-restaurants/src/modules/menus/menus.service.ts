import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { MenusRepository } from './menus.repository';
import { MenuEntity } from './entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ReorderMenusDto } from './dto/reorder-menus.dto';
import { buildSlug } from '@common/utils/slug.util';
import { QueryMenusDto } from './dto/query-menus.dto';
import { ErrorCodes } from '@common/exceptions/error-codes';

@Injectable()
export class MenusService {
  constructor(
    private readonly menusRepository: MenusRepository,
    private readonly prisma: PrismaService,
  ) {}

  async list(restaurantId: string, query: QueryMenusDto) {
    await this.ensureRestaurantExists(restaurantId);

    const categories = await this.menusRepository.listByRestaurant(restaurantId, {
      includeProducts: query.includeProducts,
      activeOnly: query.activeOnly,
    });

    return categories.map(MenuEntity.fromPrisma);
  }

  async create(restaurantId: string, dto: CreateMenuDto) {
    await this.ensureRestaurantExists(restaurantId);

    const slug = await this.generateUniqueSlug(restaurantId, dto.name);
    const category = await this.menusRepository.create(restaurantId, {
      name: dto.name,
      slug,
      description: dto.description,
      imageUrl: dto.imageUrl,
      displayOrder: dto.displayOrder ?? 0,
      isActive: dto.isActive ?? true,
    });

    return MenuEntity.fromPrisma(category);
  }

  async update(restaurantId: string, menuId: string, dto: UpdateMenuDto) {
    await this.ensureRestaurantExists(restaurantId);
    const existing = await this.menusRepository.findById(restaurantId, menuId);

    if (!existing) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Menu not found' });
    }

    let slug: string | undefined;
    if (dto.name && dto.name !== existing.name) {
      slug = await this.generateUniqueSlug(restaurantId, dto.name, menuId);
    }

    const updated = await this.menusRepository.update(menuId, {
      name: dto.name,
      slug,
      description: dto.description,
      imageUrl: dto.imageUrl,
      displayOrder: dto.displayOrder,
      isActive: dto.isActive,
    });

    return MenuEntity.fromPrisma(updated);
  }

  async remove(restaurantId: string, menuId: string) {
    await this.ensureRestaurantExists(restaurantId);
    const existing = await this.menusRepository.findById(restaurantId, menuId);

    if (!existing) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Menu not found' });
    }

    await this.menusRepository.remove(menuId);

    return { message: 'Menu removed' };
  }

  async reorder(restaurantId: string, dto: ReorderMenusDto) {
    await this.ensureRestaurantExists(restaurantId);
    await this.menusRepository.reorder(restaurantId, dto.orderedIds);
    return { message: 'Menus reordered successfully' };
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
      baseSlug = buildSlug(`menu-${Date.now()}`);
    }

    let candidate = baseSlug;
    let counter = 1;

    while (await this.menusRepository.isSlugTaken(restaurantId, candidate, excludeId)) {
      counter += 1;
      candidate = `${baseSlug}-${counter}`;
      if (counter > 100) {
        throw new ConflictException({
          code: ErrorCodes.CONFLICT,
          message: 'Unable to generate unique menu slug',
        });
      }
    }

    return candidate;
  }
}
