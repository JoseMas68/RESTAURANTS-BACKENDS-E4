import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from '../services/reviews.service';
import { QueryReviewsDto } from '../dto/query-reviews.dto';
import { ReviewResponseDto } from '../dto/review-response.dto';
import { CreateReviewDto } from '../dto/create-review.dto';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

@ApiTags('Restaurant Reviews')
@Controller('restaurants/:restaurantId/reviews')
export class RestaurantReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiPaginatedResponse(ReviewResponseDto)
  async list(@Param('restaurantId') restaurantId: string, @Query() query: QueryReviewsDto) {
    return this.reviewsService.paginate({ ...query, restaurantId });
  }

  @Post()
  @ApiOkResponse({ type: ReviewResponseDto })
  async create(@Param('restaurantId') restaurantId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create({ ...dto, restaurantId });
  }
}
