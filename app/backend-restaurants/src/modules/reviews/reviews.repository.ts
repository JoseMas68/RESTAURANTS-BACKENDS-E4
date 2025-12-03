import { Injectable } from '@nestjs/common';
import { Prisma, Review } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { QueryReviewsDto } from './dto/query-reviews.dto';
import { buildPagination, buildPaginationMeta } from '@common/utils/pagination.util';

export interface PaginatedReviews {
  data: Review[];
  pagination: ReturnType<typeof buildPaginationMeta>;
}

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async paginate(query: QueryReviewsDto): Promise<PaginatedReviews> {
    const { skip, take, page, limit } = buildPagination({ page: query.page, limit: query.limit });

    const where: Prisma.ReviewWhereInput = {
      ...(query.restaurantId && { restaurantId: query.restaurantId }),
      ...(query.customerId && { customerId: query.customerId }),
      ...(typeof query.rating === 'number' && { rating: query.rating }),
      ...(typeof query.isVisible === 'boolean' && { isVisible: query.isVisible }),
      ...(typeof query.isVerified === 'boolean' && { isVerified: query.isVerified }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data,
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string): Promise<Review | null> {
    return this.prisma.review.findUnique({ where: { id } });
  }

  async create(data: Prisma.ReviewCreateInput): Promise<Review> {
    return this.prisma.review.create({ data });
  }

  async update(id: string, data: Prisma.ReviewUpdateInput): Promise<Review> {
    return this.prisma.review.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.review.delete({ where: { id } });
  }

  async aggregateRestaurantRatings(restaurantId: string) {
    return this.prisma.review.aggregate({
      where: { restaurantId, isVisible: true },
      _avg: { rating: true },
      _count: { rating: true },
    });
  }
}
