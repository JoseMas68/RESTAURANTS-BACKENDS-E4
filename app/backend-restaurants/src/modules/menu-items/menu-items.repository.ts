import { Injectable } from '@nestjs/common';
import { Category, Prisma, Product } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { QueryMenuItemsDto } from './dto/query-menu-items.dto';
import { buildPagination, buildPaginationMeta } from '@common/utils/pagination.util';

export interface PaginatedMenuItems {
  data: Array<Product & { category: Category }>;
  pagination: ReturnType<typeof buildPaginationMeta>;
}

@Injectable()
export class MenuItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async paginate(
    restaurantId: string,
    query: QueryMenuItemsDto,
  ): Promise<PaginatedMenuItems> {
    const { skip, take, page, limit } = buildPagination({ page: query.page, limit: query.limit });

    const where: Prisma.ProductWhereInput = {
      restaurantId,
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(typeof query.isAvailable === 'boolean' && { isAvailable: query.isAvailable }),
      ...(typeof query.isFeatured === 'boolean' && { isFeatured: query.isFeatured }),
      ...(typeof query.isVegetarian === 'boolean' && { isVegetarian: query.isVegetarian }),
      ...(typeof query.isVegan === 'boolean' && { isVegan: query.isVegan }),
      ...(typeof query.isGlutenFree === 'boolean' && { isGlutenFree: query.isGlutenFree }),
      ...(typeof query.minPrice === 'number' && { price: { gte: query.minPrice } }),
      ...(typeof query.maxPrice === 'number' && { price: { lte: query.maxPrice } }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
    if (query.sortBy) {
      orderBy.push({ [query.sortBy]: query.sortOrder ?? 'asc' } as Prisma.ProductOrderByWithRelationInput);
    } else {
      orderBy.push({ displayOrder: 'asc' }, { createdAt: 'asc' });
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(restaurantId: string, itemId: string): Promise<Product | null> {
    return this.prisma.product.findFirst({ where: { id: itemId, restaurantId } });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  async listMenu(restaurantId: string): Promise<Array<Category & { products: Product[] }>> {
    return this.prisma.category.findMany({
      where: { restaurantId, isActive: true },
      include: {
        products: {
          where: { isAvailable: true },
          orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async isSlugTaken(
    restaurantId: string,
    slug: string,
    excludeId?: string,
  ): Promise<boolean> {
    const product = await this.prisma.product.findFirst({
      where: {
        restaurantId,
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true },
    });

    return Boolean(product);
  }
}
