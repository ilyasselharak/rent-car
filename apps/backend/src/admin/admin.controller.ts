import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { BookingsService } from '../bookings/bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, BookingStatus } from '@rentcar/shared';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private adminService: AdminService,
    private usersService: UsersService,
    private vehiclesService: VehiclesService,
    private bookingsService: BookingsService,
  ) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('dashboard:read')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('user:read')
  @ApiOperation({ summary: 'List all users (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  async findAllUsers(
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('limit', new DefaultValuePipe(20)) limit: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.usersService.findAll({
      page,
      limit,
      search,
      role,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('users/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('user:read')
  @ApiOperation({ summary: 'Get user by ID (admin)' })
  async findUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch('users/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Update user (admin)' })
  async updateUser(
    @Param('id') id: string,
    @Body() data: { name?: string; phone?: string; role?: string; isActive?: boolean },
  ) {
    return this.usersService.update(id, data);
  }

  @Delete('users/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @RequirePermissions('user:delete')
  @ApiOperation({ summary: 'Delete user (super admin only)' })
  async removeUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Get('vehicles')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('vehicle:read')
  @ApiOperation({ summary: 'List all vehicles (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'brand', required: false })
  async findAllVehicles(
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('limit', new DefaultValuePipe(20)) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string,
  ) {
    return this.vehiclesService.findAll({
      page,
      limit,
      search,
      status: status as any,
      category,
      brand,
    });
  }

  @Get('vehicles/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('vehicle:read')
  @ApiOperation({ summary: 'Get vehicle by ID (admin)' })
  async findVehicle(@Param('id') id: string) {
    return this.vehiclesService.findById(id);
  }

  @Patch('vehicles/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('vehicle:update')
  @ApiOperation({ summary: 'Update vehicle (admin)' })
  async updateVehicle(
    @Param('id') id: string,
    @Body() data: Record<string, unknown>,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.vehiclesService.update(id, data as any, user);
  }

  @Delete('vehicles/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('vehicle:delete')
  @ApiOperation({ summary: 'Delete vehicle (admin)' })
  async removeVehicle(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.vehiclesService.delete(id, user);
  }

  @Get('bookings')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('booking:read')
  @ApiOperation({ summary: 'List all bookings (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAllBookings(
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('limit', new DefaultValuePipe(20)) limit: number,
    @Query('status') status?: string,
  ) {
    return this.bookingsService.findAll({ page, limit, status: status as BookingStatus });
  }

  @Get('bookings/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('booking:read')
  @ApiOperation({ summary: 'Get booking by ID (admin)' })
  async findBooking(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  @Patch('bookings/:id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('booking:update')
  @ApiOperation({ summary: 'Update booking status (admin)' })
  async updateBookingStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.bookingsService.updateStatus(id, status, user.id, user.role);
  }
}
