import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { ReviewsRepository } from '../reviews.repository';
import { ReviewEntity } from '../entities/review.entity';
import { CreateReviewDto } from '../dto/create-review.dto';
import { QueryReviewsDto } from '../dto/query-reviews.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { RespondReviewDto } from '../dto/respond-review.dto';
import { ErrorCodes } from '@common/exceptions/error-codes';

@Injectable()
export class ReviewsService {
  constructor(private readonly repository: ReviewsRepository, private readonly prisma: PrismaService) {}

  async paginate(query: QueryReviewsDto) {
    const result = await this.repository.paginate(query);
    return {
      data: result.data.map(ReviewEntity.fromPrisma),
      pagination: result.pagination,
    };
  }

  async create(dto: CreateReviewDto) {
    await this.ensureRestaurantExists(dto.restaurantId);
    await this.ensureCustomerExists(dto.customerId);

    const existing = await this.prisma.review.findFirst({
      where: { restaurantId: dto.restaurantId, customerId: dto.customerId },
    });

    if (existing) {
      throw new ConflictException({ code: ErrorCodes.CONFLICT, message: 'Review already exists' });
    }

    const review = await this.repository.create({
      restaurant: { connect: { id: dto.restaurantId } },
      customer: { connect: { id: dto.customerId } },
      order: dto.orderId ? { connect: { id: dto.orderId } } : undefined,
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
      isVisible: dto.isVisible ?? true,
      isVerified: Boolean(dto.orderId),
    });

    await this.refreshRestaurantMetrics(dto.restaurantId);
    return ReviewEntity.fromPrisma(review);
  }

  async update(reviewId: string, dto: UpdateReviewDto) {
    const review = await this.repository.findById(reviewId);
    if (!review) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Review not found' });
    }

    const updated = await this.repository.update(review.id, {
      rating: dto.rating ?? review.rating,
      title: dto.title ?? review.title,
      comment: dto.comment ?? review.comment,
      isVisible: dto.isVisible ?? review.isVisible,
    });

    await this.refreshRestaurantMetrics(updated.restaurantId);
    return ReviewEntity.fromPrisma(updated);
  }

  async findById(reviewId: string) {
    const review = await this.repository.findById(reviewId);
    if (!review) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Review not found' });
    }
    return ReviewEntity.fromPrisma(review);
  }

  async respond(reviewId: string, dto: RespondReviewDto) {
    const review = await this.repository.findById(reviewId);
    if (!review) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Review not found' });
    }

    const updated = await this.repository.update(review.id, {
      response: dto.response,
      responseAt: new Date(),
    });

    return ReviewEntity.fromPrisma(updated);
  }

  async remove(reviewId: string) {
    const review = await this.repository.findById(reviewId);
    if (!review) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Review not found' });
    }

    await this.repository.delete(review.id);
    await this.refreshRestaurantMetrics(review.restaurantId);

    return { message: 'Review removed' };
  }

  private async ensureRestaurantExists(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true },
    });
    if (!restaurant) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'Restaurant not found' });
    }
  }

  private async ensureCustomerExists(customerId: string) {
    const customer = await this.prisma.user.findUnique({
      where: { id: customerId },
      select: { id: true },
    });
    if (!customer) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: 'User not found' });
    }
  }

  private async refreshRestaurantMetrics(restaurantId: string) {
    const metrics = await this.repository.aggregateRestaurantRatings(restaurantId);
    const average = metrics._avg.rating ?? 0;
    const total = metrics._count.rating ?? 0;

    await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        averageRating: average,
        totalReviews: total,
      },
    });
  }
}
