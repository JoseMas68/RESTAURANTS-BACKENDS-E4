import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { QueryRestaurantsDto } from './dto/query-restaurants.dto';
import { RestaurantResponseDto } from './dto/restaurant-response.dto';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @ApiPaginatedResponse(RestaurantResponseDto)
  async findAll(@Query() query: QueryRestaurantsDto) {
    return this.restaurantsService.findAll(query);
  }

  @Get(':restaurantId/menus')
  @ApiOkResponse()
  async getMenus(@Param('restaurantId') restaurantId: string) {
    return this.restaurantsService.getMenus(restaurantId);
  }

  @Get(':identifier')
  @ApiOkResponse({ type: RestaurantResponseDto })
  async findOne(@Param('identifier') identifier: string) {
    return this.restaurantsService.findOne(identifier);
  }

  @Post()
  @ApiCreatedResponse({ type: RestaurantResponseDto })
  async create(@Body() dto: CreateRestaurantDto) {
    return this.restaurantsService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: RestaurantResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateRestaurantDto) {
    return this.restaurantsService.update(id, dto);
  }
}
