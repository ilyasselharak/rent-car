import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(agencyId?: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const agencyWhere = agencyId ? { agencyId } : {};
    const bookingAgencyWhere = agencyId ? { booking: { agencyId } } : {};

    const [
      totalRevenue,
      totalBookings,
      activeBookings,
      totalVehicles,
      availableVehicles,
      totalCustomers,
      newCustomers,
      completedBookings,
      cancelledBookings,
      pendingBookings,
      confirmedBookings,
      todayRevenue,
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED', paidAt: { gte: startDate }, ...bookingAgencyWhere },
        _sum: { amount: true },
      }),
      this.prisma.booking.count({ where: { ...agencyWhere, createdAt: { gte: startDate } } }),
      this.prisma.booking.count({ where: { ...agencyWhere, status: 'ACTIVE' } }),
      this.prisma.vehicle.count({ where: agencyId ? { agencyId } : {} }),
      this.prisma.vehicle.count({ where: { status: 'AVAILABLE', ...(agencyId ? { agencyId } : {}) } }),
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.booking.count({ where: { ...agencyWhere, status: 'COMPLETED', createdAt: { gte: startDate } } }),
      this.prisma.booking.count({ where: { ...agencyWhere, status: 'CANCELLED', createdAt: { gte: startDate } } }),
      this.prisma.booking.count({ where: { ...agencyWhere, status: 'PENDING' } }),
      this.prisma.booking.count({ where: { ...agencyWhere, status: 'CONFIRMED' } }),
      this.prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          paidAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
          ...bookingAgencyWhere,
        },
        _sum: { amount: true },
      }),
    ]);

    let dailyRevenue: Array<{ date: Date; amount: number; count: number }> = [];

    if (agencyId) {
      const raw = await this.prisma.$queryRaw<Array<{ date: Date; amount: number; count: bigint }>>(
        Prisma.sql`
          SELECT DATE(paid_at) as date, COALESCE(SUM(amount), 0) as amount, COUNT(id) as count
          FROM payments
          WHERE status = 'COMPLETED' AND paid_at >= ${startDate}
            AND booking_id IN (SELECT id FROM bookings WHERE agency_id = ${agencyId})
          GROUP BY DATE(paid_at) ORDER BY date ASC
        `
      );
      dailyRevenue = raw.map((d) => ({ date: new Date(d.date), amount: Number(d.amount), count: Number(d.count) }));
    } else {
      const raw = await this.prisma.$queryRaw<Array<{ date: Date; amount: number; count: bigint }>>(
        Prisma.sql`
          SELECT DATE(paid_at) as date, COALESCE(SUM(amount), 0) as amount, COUNT(id) as count
          FROM payments
          WHERE status = 'COMPLETED' AND paid_at >= ${startDate}
          GROUP BY DATE(paid_at) ORDER BY date ASC
        `
      );
      dailyRevenue = raw.map((d) => ({ date: new Date(d.date), amount: Number(d.amount), count: Number(d.count) }));
    }

    const topVehicles = await this.prisma.booking.groupBy({
      by: ['vehicleId'],
      where: { ...agencyWhere, status: { in: ['COMPLETED', 'ACTIVE'] } },
      _count: { vehicleId: true },
      orderBy: { _count: { vehicleId: 'desc' } },
      take: 5,
    });

    const vehicleIds = topVehicles.map((v) => v.vehicleId);
    const vehicleDetails = vehicleIds.length > 0
      ? await this.prisma.vehicle.findMany({
          where: { id: { in: vehicleIds } },
          select: { id: true, brand: true, model: true, images: true },
        })
      : [];

    const rentedVehicles = await this.prisma.vehicle.count({ where: { status: 'RENTED', ...(agencyId ? { agencyId } : {}) } });

    return {
      summary: {
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        totalBookings,
        activeBookings,
        confirmedBookings,
        totalVehicles,
        availableVehicles,
        rentedVehicles,
        occupancyRate: totalVehicles > 0 ? Math.round(((totalVehicles - availableVehicles) / totalVehicles) * 100) : 0,
        totalCustomers,
        newCustomers,
        completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
        cancellationRate: totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0,
        pendingBookings,
        todayRevenue: Number(todayRevenue._sum.amount || 0),
      },
      dailyRevenue,
      topVehicles: topVehicles.map((v) => ({
        ...vehicleDetails.find((vd) => vd.id === v.vehicleId),
        bookingCount: v._count.vehicleId,
      })),
    };
  }
}
