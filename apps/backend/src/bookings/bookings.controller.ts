import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, BookingStatus } from '@rentcar/shared';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.CLIENT, UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('booking:read')
  @ApiOperation({ summary: 'List all bookings' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'vehicleId', required: false })
  @ApiQuery({ name: 'agencyId', required: false })
  async findAll(
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('limit', new DefaultValuePipe(20)) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('agencyId') agencyId?: string,
  ) {
    return this.bookingsService.findAll({ page, limit, search, status: status as BookingStatus, customerId, vehicleId, agencyId });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my bookings (for clients)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findMy(
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('limit', new DefaultValuePipe(20)) limit: number,
    @Query('status') status?: string,
    @CurrentUser() user?: { id: string; role: string },
  ) {
    return this.bookingsService.findMyBookings(user!.id, { page, limit, status: status as BookingStatus });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.bookingsService.findById(id, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT)
  @RequirePermissions('booking:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new booking' })
  async create(
    @Body() data: {
      customerId: string;
      vehicleId: string;
      startDate: string;
      endDate: string;
      pickupLocationId: string;
      returnLocationId: string;
      notes?: string;
      couponCode?: string;
      agencyId: string;
    },
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.bookingsService.create({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      createdById: user.id,
    });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('booking:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update booking status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.bookingsService.updateStatus(id, status, user.id, user.role);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel booking' })
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.bookingsService.cancel(id, reason, user.id, user.role);
  }
}
