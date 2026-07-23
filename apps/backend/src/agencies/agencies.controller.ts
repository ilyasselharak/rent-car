import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Agencies')
@Controller('agencies')
export class AgenciesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all agencies' })
  async findAll() {
    return this.prisma.agencyProfile.findMany({
      select: { id: true, agencyName: true, slug: true },
      orderBy: { agencyName: 'asc' },
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current agency profile' })
  async findMe(@CurrentUser() user: { id: string }) {
    return this.prisma.agencyProfile.findUnique({
      where: { userId: user.id },
      include: { settings: true },
    });
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current agency profile' })
  async updateMe(
    @CurrentUser() user: { id: string },
    @Body() data: Record<string, unknown>,
  ) {
    const profile = await this.prisma.agencyProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) throw new Error('Agency profile not found');

    return this.prisma.agencyProfile.update({
      where: { userId: user.id },
      data: {
        agencyName: data.agencyName as string | undefined,
        ownerName: data.ownerName as string | undefined,
        phone: data.phone as string | undefined,
        city: data.city as string | undefined,
        address: data.address as string | undefined,
        description: data.description as string | undefined,
        businessRegNumber: data.businessRegNumber as string | undefined,
        taxId: data.taxId as string | undefined,
        logo: data.logo as string | undefined,
      },
    });
  }

  @Get('me/locations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get agency locations' })
  async findLocations(@CurrentUser() user: { id: string }) {
    const profile = await this.prisma.agencyProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) throw new Error('Agency profile not found');

    return this.prisma.location.findMany({
      where: { agencyId: profile.id },
      select: { id: true, name: true, city: true, address: true },
    });
  }

  @Patch('me/settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update agency settings' })
  async updateSettings(
    @CurrentUser() user: { id: string },
    @Body() data: Record<string, unknown>,
  ) {
    const profile = await this.prisma.agencyProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) throw new Error('Agency profile not found');

    return this.prisma.agencySetting.upsert({
      where: { agencyProfileId: profile.id },
      update: {
        defaultCurrency: data.defaultCurrency as string | undefined,
        taxRate: data.taxRate as number | undefined,
        timezone: data.timezone as string | undefined,
        gracePeriodMinutes: data.gracePeriodMinutes as number | undefined,
        lateReturnFeePerHour: data.lateReturnFeePerHour as number | undefined,
        minRentalAge: data.minRentalAge as number | undefined,
        maxRentalAge: data.maxRentalAge as number | undefined,
        cancellationPolicy: data.cancellationPolicy as any,
        workingHours: data.workingHours as any,
      },
      create: {
        agencyProfileId: profile.id,
        defaultCurrency: (data.defaultCurrency as string) || 'USD',
        taxRate: (data.taxRate as number) || 0,
        timezone: (data.timezone as string) || 'UTC',
        gracePeriodMinutes: (data.gracePeriodMinutes as number) || 60,
        lateReturnFeePerHour: (data.lateReturnFeePerHour as number) || 0,
        minRentalAge: (data.minRentalAge as number) || 21,
        maxRentalAge: (data.maxRentalAge as number) || 80,
        cancellationPolicy: data.cancellationPolicy || { hoursBefore: 24, refundPercent: 100 },
        workingHours: data.workingHours || { open: '09:00', close: '18:00', days: [1, 2, 3, 4, 5] },
      },
    });
  }
}