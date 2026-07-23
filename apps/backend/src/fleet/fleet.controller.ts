import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FleetService } from './fleet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { UserRole } from '@rentcar/shared';

@ApiTags('Fleet')
@Controller('fleet')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class FleetController {
  constructor(private fleetService: FleetService) {}

  @Get('overview')
  @Roles(UserRole.CLIENT, UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('fleet:read')
  @ApiOperation({ summary: 'Get fleet overview' })
  async getOverview(@Query('agencyId') agencyId?: string) {
    return this.fleetService.getFleetOverview(agencyId);
  }

  @Get('maintenance')
  @Roles(UserRole.CLIENT, UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('fleet:read')
  @ApiOperation({ summary: 'List maintenance records' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'vehicleId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'upcoming', required: false })
  async getMaintenance(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('vehicleId') vehicleId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.fleetService.getMaintenanceRecords({ page, limit, vehicleId, status, type, upcoming: upcoming === 'true' });
  }

  @Post('maintenance')
  @Roles(UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('fleet:manage:maintenance')
  @ApiOperation({ summary: 'Create maintenance record' })
  async createMaintenance(
    @Body() data: {
      vehicleId: string;
      type: string;
      scheduledDate: string;
      description: string;
      cost?: number;
      performedBy?: string;
      mileageAtService?: number;
    },
  ) {
    return this.fleetService.createMaintenanceRecord({
      ...data,
      scheduledDate: new Date(data.scheduledDate),
    });
  }

  @Patch('maintenance/:id')
  @Roles(UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('fleet:manage:maintenance')
  @ApiOperation({ summary: 'Update maintenance record' })
  async updateMaintenance(
    @Param('id') id: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.fleetService.updateMaintenanceRecord(id, data);
  }

  @Get('damage-reports')
  @Roles(UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('fleet:read')
  @ApiOperation({ summary: 'List damage reports' })
  async getDamageReports(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('vehicleId') vehicleId?: string,
    @Query('status') status?: string,
  ) {
    return this.fleetService.getDamageReports({ page, limit, vehicleId, status });
  }
}
