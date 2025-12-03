import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from '../services/reviews.service';
import { QueryReviewsDto } from '../dto/query-reviews.dto';
import { ReviewResponseDto } from '../dto/review-response.dto';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiPaginatedResponse(ReviewResponseDto)
  async list(@Query() query: QueryReviewsDto) {
    return this.reviewsService.paginate(query);
  }

  @Get(':reviewId')
  @ApiOkResponse({ type: ReviewResponseDto })
  async findOne(@Param('reviewId') reviewId: string) {
    return this.reviewsService.findById(reviewId);
  }

  @Post()
  @ApiOkResponse({ type: ReviewResponseDto })
  async create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }

  @Patch(':reviewId')
  @ApiOkResponse({ type: ReviewResponseDto })
  async update(@Param('reviewId') reviewId: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(reviewId, dto);
  }

  @Delete(':reviewId')
  @ApiOkResponse({ description: 'Review removed' })
  async remove(@Param('reviewId') reviewId: string) {
    return this.reviewsService.remove(reviewId);
  }
}
