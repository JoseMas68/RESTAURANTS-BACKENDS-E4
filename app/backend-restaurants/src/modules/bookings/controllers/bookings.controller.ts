import { BadRequestException, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingsService } from '../services/bookings.service';
import { QueryBookingsDto } from '../dto/query-bookings.dto';
import { BookingResponseDto } from '../dto/booking-response.dto';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { CancelBookingDto } from '../dto/cancel-booking.dto';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiPaginatedResponse(BookingResponseDto)
  @ApiOperation({ summary: 'List bookings for the current customer' })
  async list(@Query() query: QueryBookingsDto) {
    if (!query.customerId) {
      throw new BadRequestException('customerId is required until auth is implemented');
    }
    return this.bookingsService.listForCustomer(query.customerId, query);
  }

  @Get(':bookingId')
  @ApiOkResponse({ type: BookingResponseDto })
  async findOne(@Param('bookingId') bookingId: string, @Query('customerId') customerId: string) {
    if (!customerId) {
      throw new BadRequestException('customerId is required until auth is implemented');
    }
    return this.bookingsService.findForCustomer(customerId, bookingId);
  }

  @Post()
  @ApiOkResponse({ type: BookingResponseDto })
  async create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Post(':bookingId/cancel')
  @ApiOkResponse({ type: BookingResponseDto })
  async cancel(
    @Param('bookingId') bookingId: string,
    @Query('customerId') customerId: string,
    @Body() dto: CancelBookingDto,
  ) {
    if (!customerId) {
      throw new BadRequestException('customerId is required until auth is implemented');
    }
    return this.bookingsService.cancel(customerId, bookingId, dto);
  }
}
