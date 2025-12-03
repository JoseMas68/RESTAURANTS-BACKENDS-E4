import { Category, Product } from '@prisma/client';
import { MenuItemResponseDto } from '../dto/menu-item-response.dto';

export class MenuItemEntity {
  static fromPrisma(product: Product & { category?: Category | null }): MenuItemResponseDto {
    return {
      id: product.id,
      restaurantId: product.restaurantId,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description ?? undefined,
      price: Number(product.price),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined,
      imageUrl: product.imageUrl ?? undefined,
      preparationTime: product.preparationTime ?? undefined,
      calories: product.calories ?? undefined,
      isVegetarian: product.isVegetarian,
      isVegan: product.isVegan,
      isGlutenFree: product.isGlutenFree,
      isFeatured: product.isFeatured,
      isAvailable: product.isAvailable,
      displayOrder: product.displayOrder,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          }
        : undefined,
    };
  }
}
