import { Module } from '@nestjs/common';
import { ReviewsController } from './controllers/reviews.controller';
import { RestaurantReviewsController } from './controllers/restaurant-reviews.controller';
import { ReviewsService } from './services/reviews.service';
import { ReviewsRepository } from './reviews.repository';
import { DatabaseModule } from '@database/database.module';
import { RestaurantsModule } from '@modules/restaurants/restaurants.module';

@Module({
  imports: [DatabaseModule, RestaurantsModule],
  controllers: [ReviewsController, RestaurantReviewsController],
  providers: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}
