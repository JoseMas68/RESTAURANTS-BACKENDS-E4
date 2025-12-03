import { ApiProperty } from '@nestjs/swagger';
import { MenuItemResponseDto } from './menu-item-response.dto';

export class MenuGroupDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ type: () => [MenuItemResponseDto] })
  items!: MenuItemResponseDto[];
}

export class MenuGroupedResponseDto {
  @ApiProperty()
  restaurantId!: string;

  @ApiProperty()
  restaurantName!: string;

  @ApiProperty({ type: () => [MenuGroupDto] })
  categories!: MenuGroupDto[];
}
