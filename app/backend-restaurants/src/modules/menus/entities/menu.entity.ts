import { Category, Product } from '@prisma/client';
import { MenuResponseDto } from '../dto/menu-response.dto';

export class MenuEntity {
  static fromPrisma(category: Category & { products?: Product[] }): MenuResponseDto {
    return {
      id: category.id,
      restaurantId: category.restaurantId,
      name: category.name,
      slug: category.slug,
      description: category.description ?? undefined,
      imageUrl: category.imageUrl ?? undefined,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
      productCount: category.products?.length,
    };
  }
}
