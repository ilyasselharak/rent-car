import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalAgencies,
      totalAdmins,
      totalVehicles,
      availableVehicles,
      rentedVehicles,
      totalBookings,
      activeBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      todayRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'AGENCY' } }),
      this.prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      this.prisma.vehicle.count(),
      this.prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      this.prisma.vehicle.count({ where: { status: 'RENTED' } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'ACTIVE' } }),
      this.prisma.booking.count({ where: { status: 'COMPLETED' } }),
      this.prisma.booking.count({ where: { status: 'CANCELLED' } }),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          paidAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      users: { total: totalUsers, agencies: totalAgencies, admins: totalAdmins },
      vehicles: { total: totalVehicles, available: availableVehicles, rented: rentedVehicles },
      bookings: { total: totalBookings, active: activeBookings, completed: completedBookings, cancelled: cancelledBookings },
      revenue: {
        total: Number(totalRevenue._sum.amount || 0),
        today: Number(todayRevenue._sum.amount || 0),
      },
    };
  }
}
