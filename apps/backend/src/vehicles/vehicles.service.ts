import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { VehicleStatus } from '@rentcar/shared';
import { FuelType, TransmissionType, Prisma } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  private async getAgencyProfileId(userId: string): Promise<string | null> {
    const profile = await this.prisma.agencyProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    return profile?.id ?? null;
  }

  async findAll(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: VehicleStatus;
      category?: string;
      brand?: string;
      fuelType?: string;
      transmission?: string;
      agencyId?: string;
      locationId?: string;
      minPrice?: number;
      maxPrice?: number;
      seats?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      availableFrom?: Date;
      availableTo?: Date;
    },
    user?: { id: string; role: string },
  ) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      category,
      brand,
      fuelType,
      transmission,
      agencyId,
      locationId,
      minPrice,
      maxPrice,
      seats,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      availableFrom,
      availableTo,
    } = params;

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { registrationNumber: { contains: search, mode: 'insensitive' } },
        { vin: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status as VehicleStatus;
    if (category) where.category = category;
    if (brand) where.brand = { equals: brand, mode: 'insensitive' };
    if (fuelType) where.fuelType = fuelType as FuelType;
    if (transmission) where.transmission = transmission as TransmissionType;
    if (agencyId) where.agencyId = agencyId;
    if (!agencyId && user?.role === 'AGENCY') {
      const profileId = await this.getAgencyProfileId(user.id);
      if (profileId) where.agencyId = profileId;
    }
    if (locationId) where.locationId = locationId;
    if (seats) where.seats = { gte: seats };

    if (minPrice !== undefined && !Number.isNaN(minPrice) || maxPrice !== undefined && !Number.isNaN(maxPrice)) {
      where.dailyRate = {};
      if (minPrice !== undefined && !Number.isNaN(minPrice)) (where.dailyRate as Record<string, unknown>).gte = minPrice;
      if (maxPrice !== undefined && !Number.isNaN(maxPrice)) (where.dailyRate as Record<string, unknown>).lte = maxPrice;
    }

    // Availability filtering
    if (availableFrom && availableTo) {
      const bookedVehicleIds = await this.prisma.booking.findMany({
        where: {
          status: { in: ['CONFIRMED', 'ACTIVE'] },
          OR: [
            { startDate: { lte: availableTo }, endDate: { gte: availableFrom } },
          ],
        },
        select: { vehicleId: true },
      });

      const unavailableIds = bookedVehicleIds.map((b) => b.vehicleId);

      if (unavailableIds.length > 0) {
        where.id = { notIn: unavailableIds };
      }
    }

    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          agencyProfile: { select: { id: true, agencyName: true } },
          location: { select: { id: true, name: true, city: true } },
          _count: {
            select: { bookings: true },
          },
        },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async findById(id: string) {
    try {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id },
        include: {
          agencyProfile: { select: { id: true, agencyName: true } },
          location: { select: { id: true, name: true, address: true, city: true } },
          maintenanceRecords: {
            orderBy: { scheduledDate: 'desc' },
            take: 5,
          },
          insuranceRecords: {
            where: { isActive: true },
          },
          inspectionRecords: {
            where: { isActive: true },
          },
          _count: {
            select: { bookings: true },
          },
        },
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      return vehicle;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        const vehicle = await this.prisma.vehicle.findUnique({
          where: { id },
        });
        if (!vehicle) {
          throw new NotFoundException('Vehicle not found');
        }
        return vehicle;
      }
      throw error;
    }
  }

  async create(
    data: {
      brand: string;
      model: string;
      year: number;
      vin: string;
      registrationNumber: string;
      fuelType: string;
      transmission: string;
      mileage: number;
      seats: number;
      doors: number;
      color: string;
      category: string;
      dailyRate: number;
      weeklyRate?: number;
      monthlyRate?: number;
      depositAmount?: number;
      locationId?: string;
      features?: string[];
      description?: string;
      images?: string[];
    },
    user: { id: string; role: string },
  ) {
    const existing = await this.prisma.vehicle.findFirst({
      where: {
        OR: [{ vin: data.vin }, { registrationNumber: data.registrationNumber }],
      },
    });

    if (existing) {
      throw new BadRequestException('Vehicle with this VIN or registration number already exists');
    }

    let agencyId: string;

    if (user.role === 'AGENCY') {
      const profile = await this.prisma.agencyProfile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      if (!profile) throw new BadRequestException('Agency profile not found');
      agencyId = profile.id;
    } else {
      throw new BadRequestException('Only agencies can create vehicles');
    }

    return this.prisma.vehicle.create({
      data: {
        ...data,
        agencyId,
        fuelType: data.fuelType as FuelType,
        transmission: data.transmission as TransmissionType,
        dailyRate: data.dailyRate,
        weeklyRate: data.weeklyRate ?? null,
        monthlyRate: data.monthlyRate ?? null,
        depositAmount: data.depositAmount ?? 0,
        features: data.features ?? [],
        images: data.images ?? [],
      },
      include: {
        agencyProfile: { select: { id: true, agencyName: true } },
        location: { select: { id: true, name: true } },
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      brand: string;
      model: string;
      year: number;
      registrationNumber: string;
      fuelType: string;
      transmission: string;
      mileage: number;
      seats: number;
      doors: number;
      color: string;
      category: string;
      status: VehicleStatus;
      dailyRate: number;
      weeklyRate: number;
      monthlyRate: number;
      depositAmount: number;
      locationId: string | null;
      features: string[];
      description: string;
      images: string[];
      currentLat: number;
      currentLng: number;
    }>,
    user: { id: string; role: string },
  ) {
    const vehicle = await this.findById(id);

    if (user.role === 'AGENCY') {
      const profileId = await this.getAgencyProfileId(user.id);
      if (!profileId || vehicle.agencyId !== profileId) {
        throw new NotFoundException('Vehicle not found');
      }
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...data,
        fuelType: data.fuelType ? (data.fuelType as FuelType) : undefined,
        transmission: data.transmission ? (data.transmission as TransmissionType) : undefined,
        updatedAt: new Date(),
      },
      include: {
        agencyProfile: { select: { id: true, agencyName: true } },
        location: { select: { id: true, name: true } },
      },
    });
  }

  async delete(id: string, user: { id: string; role: string }) {
    const vehicle = await this.findById(id);

    if (user.role === 'AGENCY') {
      const profileId = await this.getAgencyProfileId(user.id);
      if (!profileId || vehicle.agencyId !== profileId) {
        throw new NotFoundException('Vehicle not found');
      }
    }

    const activeBookings = await this.prisma.booking.count({
      where: {
        vehicleId: id,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
      },
    });

    if (activeBookings > 0) {
      throw new BadRequestException('Cannot delete vehicle with active bookings');
    }

    await this.prisma.vehicle.delete({ where: { id } });
    return { message: 'Vehicle deleted successfully' };
  }

  async getCategories() {
    const categories = await this.prisma.vehicle.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { category: 'asc' },
    });

    return categories.map((c) => ({
      name: c.category,
      count: c._count.category,
    }));
  }

  async getBrands() {
    const brands = await this.prisma.vehicle.groupBy({
      by: ['brand'],
      _count: { brand: true },
      orderBy: { brand: 'asc' },
    });

    return brands.map((b) => ({
      name: b.brand,
      count: b._count.brand,
    }));
  }

  async getCalendar(vehicleId: string, year: number, month: number) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const bookings = await this.prisma.booking.findMany({
      where: {
        vehicleId,
        status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
        startDate: { lte: endOfMonth },
        endDate: { gte: startOfMonth },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        bookingNumber: true,
      },
      orderBy: { startDate: 'asc' },
    });

    const blockedPeriods = await this.prisma.vehicleAvailability.findMany({
      where: {
        vehicleId,
        isAvailable: false,
        startDate: { lte: endOfMonth },
        endDate: { gte: startOfMonth },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        reason: true,
      },
    });

    const daysInMonth = new Date(year, month, 0).getDate();
    const days: { date: string; available: boolean; status: 'available' | 'booked' | 'blocked' | 'past' }[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split('T')[0]!;

      if (date < today) {
        days.push({ date: dateStr, available: false, status: 'past' });
        continue;
      }

      const isBooked = bookings.some(
        (b) => date >= new Date(b.startDate) && date <= new Date(b.endDate),
      );

      const isBlocked = blockedPeriods.some(
        (bp) => date >= new Date(bp.startDate) && date <= new Date(bp.endDate),
      );

      if (isBooked || isBlocked) {
        days.push({ date: dateStr, available: false, status: isBlocked ? 'blocked' : 'booked' });
      } else {
        days.push({ date: dateStr, available: true, status: 'available' });
      }
    }

    return {
      year,
      month,
      days,
      bookings: bookings.map((b) => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        startDate: b.startDate,
        endDate: b.endDate,
        status: b.status,
      })),
      blockedPeriods: blockedPeriods.map((bp) => ({
        id: bp.id,
        startDate: bp.startDate,
        endDate: bp.endDate,
        reason: bp.reason,
      })),
    };
  }

  async checkAvailability(vehicleId: string, startDate: Date, endDate: Date) {
    const conflictingBookings = await this.prisma.booking.findFirst({
      where: {
        vehicleId,
        status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    const blockedPeriod = await this.prisma.vehicleAvailability.findFirst({
      where: {
        vehicleId,
        isAvailable: false,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    return {
      available: !conflictingBookings && !blockedPeriod,
      conflictingBooking: conflictingBookings
        ? {
            id: conflictingBookings.id,
            startDate: conflictingBookings.startDate,
            endDate: conflictingBookings.endDate,
            status: conflictingBookings.status,
          }
        : null,
      blockedPeriod: blockedPeriod
        ? {
            startDate: blockedPeriod.startDate,
            endDate: blockedPeriod.endDate,
            reason: blockedPeriod.reason,
          }
        : null,
    };
  }
}
