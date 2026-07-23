import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { UserRole } from '@rentcar/shared';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('revenue')
  @Roles(UserRole.CLIENT, UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('analytics:read')
  @ApiOperation({ summary: 'Get revenue analytics' })
  async getRevenue(
    @Query('agencyId') agencyId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getRevenueAnalytics(
      agencyId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('customers')
  @Roles(UserRole.CLIENT, UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('analytics:read')
  @ApiOperation({ summary: 'Get customer analytics' })
  async getCustomers() {
    return this.analyticsService.getCustomerAnalytics();
  }

  @Get('vehicles')
  @Roles(UserRole.CLIENT, UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('analytics:read')
  @ApiOperation({ summary: 'Get vehicle analytics' })
  @ApiQuery({ name: 'agencyId', required: false })
  async getVehicles(@Query('agencyId') agencyId?: string) {
    return this.analyticsService.getVehicleAnalytics(agencyId);
  }
}
