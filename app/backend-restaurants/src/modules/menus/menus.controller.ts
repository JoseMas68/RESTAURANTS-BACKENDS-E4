import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ReorderMenusDto } from './dto/reorder-menus.dto';
import { MenuResponseDto } from './dto/menu-response.dto';
import { QueryMenusDto } from './dto/query-menus.dto';

@ApiTags('Menus')
@Controller('restaurants/:restaurantId/menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  @ApiOkResponse({ type: [MenuResponseDto] })
  @ApiOperation({ summary: 'List restaurant menus/categories' })
  async list(@Param('restaurantId') restaurantId: string, @Query() query: QueryMenusDto) {
    return this.menusService.list(restaurantId, query);
  }

  @Post()
  @ApiOkResponse({ type: MenuResponseDto })
  async create(@Param('restaurantId') restaurantId: string, @Body() dto: CreateMenuDto) {
    return this.menusService.create(restaurantId, dto);
  }

  @Patch(':menuId')
  @ApiOkResponse({ type: MenuResponseDto })
  async update(
    @Param('restaurantId') restaurantId: string,
    @Param('menuId') menuId: string,
    @Body() dto: UpdateMenuDto,
  ) {
    return this.menusService.update(restaurantId, menuId, dto);
  }

  @Delete(':menuId')
  @ApiOkResponse({ description: 'Menu removed' })
  async remove(@Param('restaurantId') restaurantId: string, @Param('menuId') menuId: string) {
    return this.menusService.remove(restaurantId, menuId);
  }

  @Put('reorder')
  @ApiOkResponse({ description: 'Menus reordered successfully' })
  async reorder(@Param('restaurantId') restaurantId: string, @Body() dto: ReorderMenusDto) {
    return this.menusService.reorder(restaurantId, dto);
  }
}
