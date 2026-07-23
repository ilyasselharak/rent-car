import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { MaintenanceType } from '@prisma/client';

@Injectable()
export class FleetService {
  constructor(private prisma: PrismaService) {}

  async getMaintenanceRecords(params: {
    page?: number;
    limit?: number;
    vehicleId?: string;
    status?: string;
    type?: string;
    upcoming?: boolean;
  }) {
    const { page = 1, limit = 20, vehicleId, status, type, upcoming } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (upcoming) {
      where.scheduledDate = { gte: new Date() };
      where.status = { in: ['SCHEDULED', 'IN_PROGRESS'] };
    }

    const [data, total] = await Promise.all([
      this.prisma.maintenanceRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledDate: 'asc' },
        include: {
          vehicle: { select: { brand: true, model: true, registrationNumber: true } },
        },
      }),
      this.prisma.maintenanceRecord.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  async createMaintenanceRecord(data: {
    vehicleId: string;
    type: string;
    scheduledDate: Date;
    description: string;
    cost?: number;
    performedBy?: string;
    mileageAtService?: number;
  }) {
    return this.prisma.maintenanceRecord.create({
      data: {
        ...data,
        type: data.type as MaintenanceType,
        cost: data.cost ?? null,
      },
      include: {
        vehicle: { select: { brand: true, model: true } },
      },
    });
  }

  async updateMaintenanceRecord(id: string, data: Record<string, unknown>) {
    const record = await this.prisma.maintenanceRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Maintenance record not found');

    return this.prisma.maintenanceRecord.update({
      where: { id },
      data,
    });
  }

  async getDamageReports(params: { page?: number; limit?: number; vehicleId?: string; status?: string }) {
    const { page = 1, limit = 20, vehicleId, status } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.damageReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: { select: { brand: true, model: true, registrationNumber: true } },
        },
      }),
      this.prisma.damageReport.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  async getFleetOverview(agencyId?: string) {
    const where: Record<string, unknown> = {};
    if (agencyId) where.agencyId = agencyId;

    const [
      totalVehicles,
      statusBreakdown,
      upcomingMaintenance,
      activeDamageReports,
      avgMileage,
    ] = await Promise.all([
      this.prisma.vehicle.count({ where }),
      this.prisma.vehicle.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      this.prisma.maintenanceRecord.count({
        where: {
          vehicle: where,
          scheduledDate: { gte: new Date() },
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        },
      }),
      this.prisma.damageReport.count({
        where: {
          vehicle: where,
          status: { not: 'COMPLETED' },
        },
      }),
      this.prisma.vehicle.aggregate({
        where,
        _avg: { mileage: true },
      }),
    ]);

    return {
      totalVehicles,
      statusBreakdown: statusBreakdown.reduce((acc, s) => {
        acc[s.status] = s._count.status;
        return acc;
      }, {} as Record<string, number>),
      upcomingMaintenance,
      activeDamageReports,
      avgMileage: avgMileage._avg.mileage || 0,
    };
  }
}
