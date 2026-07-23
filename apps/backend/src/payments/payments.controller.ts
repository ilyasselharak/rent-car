import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { UserRole } from '@rentcar/shared';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get('booking/:bookingId')
  @Roles(UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('payment:read')
  @ApiOperation({ summary: 'Get payments for a booking' })
  async findByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentsService.findByBookingId(bookingId);
  }

  @Post()
  @Roles(UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('payment:create')
  @ApiOperation({ summary: 'Create a payment' })
  async create(@Body() data: { bookingId: string; amount: number; method: string }) {
    return this.paymentsService.create(data);
  }

  @Patch(':id/complete')
  @Roles(UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('payment:manage')
  @ApiOperation({ summary: 'Mark payment as completed' })
  async complete(@Param('id') id: string) {
    return this.paymentsService.markAsCompleted(id);
  }

  @Post(':id/refund')
  @Roles(UserRole.AGENCY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('payment:refund')
  @ApiOperation({ summary: 'Process refund' })
  async refund(
    @Param('id') id: string,
    @Body() data: { amount: number; reason: string },
  ) {
    return this.paymentsService.processRefund(id, data.amount, data.reason);
  }
}
