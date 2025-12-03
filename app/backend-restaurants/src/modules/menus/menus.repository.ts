import { Injectable } from '@nestjs/common';
import { Category, Prisma, Product } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class MenusRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(restaurantId: string, menuId: string): Promise<Category | null> {
    return this.prisma.category.findFirst({
      where: { id: menuId, restaurantId },
    });
  }

  async listByRestaurant(
    restaurantId: string,
    options: { includeProducts?: boolean; activeOnly?: boolean } = {},
  ): Promise<Array<Category & { products?: Product[] }>> {
    return this.prisma.category.findMany({
      where: {
        restaurantId,
        ...(options.activeOnly && { isActive: true }),
      },
      include: options.includeProducts ? { products: { where: { isAvailable: true } } } : undefined,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async create(
    restaurantId: string,
    data: Omit<Prisma.CategoryCreateInput, 'restaurant'>,
  ): Promise<Category> {
    return this.prisma.category.create({
      data: {
        ...data,
        restaurant: { connect: { id: restaurantId } },
      },
    });
  }

  async update(menuId: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return this.prisma.category.update({
      where: { id: menuId },
      data,
    });
  }

  async remove(menuId: string): Promise<void> {
    await this.prisma.category.delete({ where: { id: menuId } });
  }

  async reorder(restaurantId: string, orderedIds: string[]): Promise<void> {
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.category.update({
          where: { id, restaurantId },
          data: { displayOrder: index + 1 },
        }),
      ),
    );
  }

  async isSlugTaken(
    restaurantId: string,
    slug: string,
    excludeId?: string,
  ): Promise<boolean> {
    const category = await this.prisma.category.findFirst({
      where: {
        restaurantId,
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true },
    });

    return Boolean(category);
  }
}
