import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@rentcar/shared';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user customer profile' })
  async findMe(@CurrentUser() user: { id: string }) {
    return this.customersService.findByUserId(user.id);
  }

  @Get()
  @Roles(UserRole.CLIENT, UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('customer:read')
  @ApiOperation({ summary: 'List all customers' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isBlacklisted', required: false })
  @ApiQuery({ name: 'loyaltyTier', required: false })
  async findAll(
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('limit', new DefaultValuePipe(20)) limit: number,
    @Query('search') search?: string,
    @Query('isBlacklisted') isBlacklisted?: string,
    @Query('loyaltyTier') loyaltyTier?: string,
  ) {
    return this.customersService.findAll({
      page,
      limit,
      search,
      isBlacklisted: isBlacklisted !== undefined ? isBlacklisted === 'true' : undefined,
      loyaltyTier,
    });
  }

  @Get(':id')
  @Roles(UserRole.CLIENT, UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('customer:read')
  @ApiOperation({ summary: 'Get customer by ID' })
  async findOne(@Param('id') id: string) {
    return this.customersService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('customer:update')
  @ApiOperation({ summary: 'Update customer' })
  async update(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.customersService.update(id, data);
  }

  @Patch(':id/blacklist')
  @Roles(UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('customer:update')
  @ApiOperation({ summary: 'Toggle customer blacklist status' })
  async toggleBlacklist(
    @Param('id') id: string,
    @Body('isBlacklisted') isBlacklisted: boolean,
    @Body('reason') reason?: string,
  ) {
    return this.customersService.toggleBlacklist(id, isBlacklisted, reason);
  }
}
