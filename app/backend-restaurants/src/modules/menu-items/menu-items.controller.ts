import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MenuItemsService } from './menu-items.service';
import { QueryMenuItemsDto } from './dto/query-menu-items.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { UpdateMenuItemAvailabilityDto } from './dto/update-menu-item-availability.dto';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';
import { MenuGroupedResponseDto } from './dto/menu-group-response.dto';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

@ApiTags('Menu Items')
@Controller('restaurants/:restaurantId')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get('menu-items')
  @ApiPaginatedResponse(MenuItemResponseDto)
  async paginate(
    @Param('restaurantId') restaurantId: string,
    @Query() query: QueryMenuItemsDto,
  ) {
    return this.menuItemsService.paginate(restaurantId, query);
  }

  @Get('menu-items/:itemId')
  @ApiOkResponse({ type: MenuItemResponseDto })
  async findOne(@Param('restaurantId') restaurantId: string, @Param('itemId') itemId: string) {
    return this.menuItemsService.findOne(restaurantId, itemId);
  }

  @Post('menu-items')
  @ApiOkResponse({ type: MenuItemResponseDto })
  async create(@Param('restaurantId') restaurantId: string, @Body() dto: CreateMenuItemDto) {
    return this.menuItemsService.create(restaurantId, dto);
  }

  @Patch('menu-items/:itemId')
  @ApiOkResponse({ type: MenuItemResponseDto })
  async update(
    @Param('restaurantId') restaurantId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuItemsService.update(restaurantId, itemId, dto);
  }

  @Patch('menu-items/:itemId/availability')
  @ApiOkResponse({ type: MenuItemResponseDto })
  async updateAvailability(
    @Param('restaurantId') restaurantId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateMenuItemAvailabilityDto,
  ) {
    return this.menuItemsService.updateAvailability(restaurantId, itemId, dto);
  }

  @Delete('menu-items/:itemId')
  @ApiOkResponse({ description: 'Menu item removed' })
  async remove(@Param('restaurantId') restaurantId: string, @Param('itemId') itemId: string) {
    return this.menuItemsService.remove(restaurantId, itemId);
  }

  @Get('menu')
  @ApiOperation({ summary: 'Get restaurant menu grouped by category' })
  @ApiOkResponse({ type: MenuGroupedResponseDto })
  async getMenu(@Param('restaurantId') restaurantId: string) {
    return this.menuItemsService.getMenu(restaurantId);
  }
}
