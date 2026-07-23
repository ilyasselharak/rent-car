import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { CustomersModule } from './crm/customers.module';
import { FleetModule } from './fleet/fleet.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DocumentsModule } from './documents/documents.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AgenciesModule } from './agencies/agencies.module';
import { UploadModule } from './upload/upload.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
    CommonModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    BookingsModule,
    PaymentsModule,
    CustomersModule,
    FleetModule,
    NotificationsModule,
    DocumentsModule,
    DashboardModule,
    AnalyticsModule,
    AgenciesModule,
    UploadModule,
  ],
})
export class AppModule {}
