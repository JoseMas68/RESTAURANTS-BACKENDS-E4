import { Module } from '@nestjs/common';
import { BookingsController } from './controllers/bookings.controller';
import { RestaurantBookingsController } from './controllers/restaurant-bookings.controller';
import { BookingsService } from './services/bookings.service';
import { AvailabilityService } from './services/availability.service';
import { BookingsRepository } from './bookings.repository';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BookingsController, RestaurantBookingsController],
  providers: [BookingsService, AvailabilityService, BookingsRepository],
})
export class BookingsModule {}
