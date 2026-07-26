import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [UsersModule, VehiclesModule, BookingsModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
