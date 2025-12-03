import { Review } from '@prisma/client';
import { ReviewResponseDto } from '../dto/review-response.dto';

export class ReviewEntity {
  static fromPrisma(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      restaurantId: review.restaurantId,
      customerId: review.customerId,
      orderId: review.orderId ?? undefined,
      rating: review.rating,
      title: review.title ?? undefined,
      comment: review.comment ?? undefined,
      isVerified: review.isVerified,
      isVisible: review.isVisible,
      response: review.response ?? undefined,
      responseAt: review.responseAt?.toISOString(),
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }
}
