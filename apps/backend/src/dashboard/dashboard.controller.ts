import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../common/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { UserRole } from '@rentcar/shared';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(
    private dashboardService: DashboardService,
    private prisma: PrismaService,
  ) {}

  @Get('stats')
  @Roles(UserRole.CLIENT, UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('dashboard:read')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiQuery({ name: 'agencyId', required: false })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'year'] })
  async getStats(
    @Req() req: any,
    @Query('agencyId') agencyId?: string,
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
  ) {
    if (req.user.role === UserRole.AGENCY) {
      const profile = await this.prisma.agencyProfile.findUnique({ where: { userId: req.user.id } });
      if (!profile) throw new UnauthorizedException('No agency profile found');
      agencyId = profile.id;
    }
    return this.dashboardService.getStats(agencyId, period);
  }
}
