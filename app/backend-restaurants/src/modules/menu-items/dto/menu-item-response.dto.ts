import { ApiProperty } from '@nestjs/swagger';

export class MenuItemCategoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}

export class MenuItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  restaurantId!: string;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  price!: number;

  @ApiProperty({ required: false })
  discountPrice?: number;

  @ApiProperty({ required: false })
  imageUrl?: string;

  @ApiProperty({ required: false })
  preparationTime?: number;

  @ApiProperty({ required: false })
  calories?: number;

  @ApiProperty()
  isVegetarian!: boolean;

  @ApiProperty()
  isVegan!: boolean;

  @ApiProperty()
  isGlutenFree!: boolean;

  @ApiProperty()
  isFeatured!: boolean;

  @ApiProperty()
  isAvailable!: boolean;

  @ApiProperty()
  displayOrder!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ type: () => MenuItemCategoryDto, required: false })
  category?: MenuItemCategoryDto;
}
