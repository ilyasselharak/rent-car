import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getRevenueAnalytics(agencyId?: string, startDate?: Date, endDate?: Date) {
    const where: Record<string, unknown> = { status: 'COMPLETED' };
    if (agencyId) {
      where.booking = { agencyId };
    }
    if (startDate || endDate) {
      where.paidAt = {};
      if (startDate) (where.paidAt as Record<string, unknown>).gte = startDate;
      if (endDate) (where.paidAt as Record<string, unknown>).lte = endDate;
    }

    const [totalRevenue, revenueByMethod] = await Promise.all([
      this.prisma.payment.aggregate({ where, _sum: { amount: true }, _count: { id: true } }),
      this.prisma.payment.groupBy({ by: ['method'], where, _sum: { amount: true }, _count: { id: true } }),
    ]);

    let revenueByMonth: Array<{ date: Date; amount: number }> = [];

    const monthWhere = agencyId ? { booking: { agencyId }, status: 'COMPLETED' as const } : { status: 'COMPLETED' as const };

    if (agencyId) {
      const raw = await this.prisma.$queryRaw<Array<{ month: string; amount: number }>>(
        Prisma.sql`
          SELECT TO_CHAR("paidAt", 'YYYY-MM') as month, COALESCE(SUM(amount), 0) as amount
          FROM payments
          WHERE status = 'COMPLETED'
            AND "bookingId" IN (SELECT id FROM bookings WHERE "agencyId" = ${agencyId})
          GROUP BY TO_CHAR("paidAt", 'YYYY-MM') ORDER BY month ASC
        `
      );
      revenueByMonth = raw.map((r) => ({ date: new Date(r.month + '-01'), amount: Number(r.amount) }));
    } else {
      const raw = await this.prisma.$queryRaw<Array<{ month: string; amount: number }>>(
        Prisma.sql`
          SELECT TO_CHAR("paidAt", 'YYYY-MM') as month, COALESCE(SUM(amount), 0) as amount
          FROM payments
          WHERE status = 'COMPLETED'
          GROUP BY TO_CHAR("paidAt", 'YYYY-MM') ORDER BY month ASC
        `
      );
      revenueByMonth = raw.map((r) => ({ date: new Date(r.month + '-01'), amount: Number(r.amount) }));
    }

    return {
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      totalTransactions: totalRevenue._count.id,
      revenueByMethod: revenueByMethod.map((r) => ({
        method: r.method,
        amount: Number(r._sum.amount || 0),
        count: r._count.id,
      })),
      revenueByMonth,
    };
  }

  async getCustomerAnalytics() {
    const [totalCustomers, newThisMonth, tierBreakdown, topCustomers] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
      this.prisma.customer.groupBy({ by: ['loyaltyTier'], _count: { loyaltyTier: true } }),
      this.prisma.customer.findMany({
        orderBy: { totalSpent: 'desc' },
        take: 10,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    return {
      totalCustomers,
      newThisMonth,
      tierBreakdown: tierBreakdown.map((t) => ({
        tier: t.loyaltyTier,
        count: t._count.loyaltyTier,
      })),
      topCustomers: topCustomers.map((c) => ({
        id: c.id,
        name: c.user.name,
        email: c.user.email,
        totalSpent: Number(c.totalSpent),
        totalRentals: c.totalRentals,
        loyaltyTier: c.loyaltyTier,
      })),
    };
  }

  async getVehicleAnalytics(agencyId?: string) {
    const agencyWhere = agencyId ? { agencyId } : {};
    const bookingAgencyWhere = agencyId ? { booking: { agencyId } } : {};

    const [totalVehicles, vehicleStats, revenueByVehicle, revenueByCategory, revenueByBrand, bookingTrends] = await Promise.all([
      this.prisma.vehicle.count({ where: agencyId ? { agencyId } : {} }),
      this.prisma.vehicle.groupBy({
        by: ['status'],
        where: agencyId ? { agencyId } : {},
        _count: { id: true },
      }),
      this.prisma.booking.groupBy({
        by: ['vehicleId'],
        where: { ...agencyWhere, status: { in: ['COMPLETED', 'ACTIVE'] } },
        _count: { id: true },
        _sum: { finalAmount: true },
        orderBy: { _sum: { finalAmount: 'desc' } },
        take: 10,
      }),
      this.prisma.booking.groupBy({
        by: ['vehicleId'],
        where: { ...agencyWhere, status: { in: ['COMPLETED', 'ACTIVE'] } },
        _count: { id: true },
        _sum: { finalAmount: true },
      }),
      this.prisma.booking.groupBy({
        by: ['vehicleId'],
        where: { ...agencyWhere, status: { in: ['COMPLETED', 'ACTIVE'] } },
        _count: { id: true },
        _sum: { finalAmount: true },
      }),
      this.prisma.booking.groupBy({
        by: ['status'],
        where: agencyWhere,
        _count: { id: true },
      }),
    ]);

    const vehicleIds = revenueByVehicle.map((r) => r.vehicleId);
    const vehicles = vehicleIds.length > 0
      ? await this.prisma.vehicle.findMany({
          where: { id: { in: vehicleIds } },
          select: { id: true, brand: true, model: true, category: true, dailyRate: true },
        })
      : [];

    const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
    const categoryRevenueMap = new Map<string, number>();
    const brandRevenueMap = new Map<string, number>();

    for (const r of revenueByVehicle) {
      const v = vehicleMap.get(r.vehicleId);
      if (v) {
        const amount = Number(r._sum.finalAmount || 0);
        categoryRevenueMap.set(v.category, (categoryRevenueMap.get(v.category) || 0) + amount);
        brandRevenueMap.set(v.brand, (brandRevenueMap.get(v.brand) || 0) + amount);
      }
    }

    return {
      totalVehicles,
      vehicleStats: vehicleStats.map((s) => ({ status: s.status, count: s._count.id })),
      topVehicles: revenueByVehicle.map((r) => {
        const v = vehicleMap.get(r.vehicleId);
        return {
          id: r.vehicleId,
          brand: v?.brand ?? 'Unknown',
          model: v?.model ?? 'Unknown',
          category: v?.category ?? 'Unknown',
          rentalCount: r._count.id,
          revenue: Number(r._sum.finalAmount || 0),
        };
      }),
      revenueByCategory: Array.from(categoryRevenueMap.entries()).map(([category, amount]) => ({ category, amount })),
      revenueByBrand: Array.from(brandRevenueMap.entries()).map(([brand, amount]) => ({ brand, amount })),
      bookingTrends: bookingTrends.map((t) => ({ status: t.status, count: t._count.id })),
    };
  }
}
