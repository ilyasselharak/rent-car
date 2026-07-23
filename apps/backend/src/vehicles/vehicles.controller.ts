import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, VehicleStatus } from '@rentcar/shared';

@ApiTags('Vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'List all vehicles' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'brand', required: false })
  @ApiQuery({ name: 'fuelType', required: false })
  @ApiQuery({ name: 'transmission', required: false })
  @ApiQuery({ name: 'agencyId', required: false })
  @ApiQuery({ name: 'locationId', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'seats', required: false })
  @ApiQuery({ name: 'availableFrom', required: false })
  @ApiQuery({ name: 'availableTo', required: false })
  async findAll(
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('limit', new DefaultValuePipe(20)) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string,
    @Query('fuelType') fuelType?: string,
    @Query('transmission') transmission?: string,
    @Query('agencyId') agencyId?: string,
    @Query('locationId') locationId?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('seats') seats?: number,
    @Query('availableFrom') availableFrom?: string,
    @Query('availableTo') availableTo?: string,
  ) {
    return this.vehiclesService.findAll({
      page,
      limit,
      search,
      status: status as VehicleStatus,
      category,
      brand,
      fuelType,
      transmission,
      agencyId,
      locationId,
      minPrice,
      maxPrice,
      seats,
      availableFrom: availableFrom ? new Date(availableFrom) : undefined,
      availableTo: availableTo ? new Date(availableTo) : undefined,
    });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my agency vehicles' })
  async findMy(
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('limit', new DefaultValuePipe(20)) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @CurrentUser() user?: { id: string; role: string },
  ) {
    return this.vehiclesService.findAll({
      page, limit, search, status: status as VehicleStatus,
    }, user);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get vehicle categories' })
  async getCategories() {
    return this.vehiclesService.getCategories();
  }

  @Get('brands')
  @ApiOperation({ summary: 'Get vehicle brands' })
  async getBrands() {
    return this.vehiclesService.getBrands();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  async findOne(@Param('id') id: string) {
    return this.vehiclesService.findById(id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Check vehicle availability' })
  async checkAvailability(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.vehiclesService.checkAvailability(id, new Date(startDate), new Date(endDate));
  }

  @Get(':id/calendar')
  @ApiOperation({ summary: 'Get vehicle calendar with availability' })
  async getCalendar(
    @Param('id') id: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.vehiclesService.getCalendar(id, parseInt(year), parseInt(month));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('vehicle:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new vehicle' })
  async create(
    @Body() data: {
      brand: string;
      model: string;
      year: number;
      vin: string;
      registrationNumber: string;
      fuelType: string;
      transmission: string;
      mileage: number;
      seats: number;
      doors: number;
      color: string;
      category: string;
      dailyRate: number;
      weeklyRate?: number;
      monthlyRate?: number;
      depositAmount?: number;
      locationId?: string;
      features?: string[];
      description?: string;
      images?: string[];
    },
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.vehiclesService.create(data, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('vehicle:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update vehicle' })
  async update(
    @Param('id') id: string,
    @Body() data: Record<string, unknown>,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.vehiclesService.update(id, data as any, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('vehicle:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete vehicle' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.vehiclesService.delete(id, user);
  }
}
