import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingsService } from '../services/bookings.service';
import { QueryBookingsDto } from '../dto/query-bookings.dto';
import { BookingResponseDto } from '../dto/booking-response.dto';
import { ConfirmBookingDto } from '../dto/confirm-booking.dto';
import { UpdateBookingStatusDto } from '../dto/update-booking-status.dto';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';
import { QueryAvailabilityDto } from '../dto/query-availability.dto';
import { AvailabilityResponseDto } from '../dto/availability-response.dto';

@ApiTags('Restaurant Bookings')
@Controller('restaurants/:restaurantId/bookings')
export class RestaurantBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiPaginatedResponse(BookingResponseDto)
  async list(@Param('restaurantId') restaurantId: string, @Query() query: QueryBookingsDto) {
    return this.bookingsService.listForRestaurant(restaurantId, query);
  }

  @Get(':bookingId')
  @ApiOkResponse({ type: BookingResponseDto })
  async findOne(@Param('restaurantId') restaurantId: string, @Param('bookingId') bookingId: string) {
    return this.bookingsService.findForRestaurant(restaurantId, bookingId);
  }

  @Post(':bookingId/confirm')
  @ApiOkResponse({ type: BookingResponseDto })
  async confirm(
    @Param('restaurantId') restaurantId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: ConfirmBookingDto,
  ) {
    return this.bookingsService.confirm(restaurantId, bookingId, dto);
  }

  @Post(':bookingId/status')
  @ApiOkResponse({ type: BookingResponseDto })
  async updateStatus(
    @Param('restaurantId') restaurantId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(restaurantId, bookingId, dto);
  }

  @Get('availability')
  @ApiOperation({ summary: 'Check availability for a specific slot' })
  @ApiOkResponse({ type: AvailabilityResponseDto })
  async checkAvailability(
    @Param('restaurantId') restaurantId: string,
    @Query() query: QueryAvailabilityDto,
  ) {
    return this.bookingsService.checkAvailability(restaurantId, query);
  }
}
