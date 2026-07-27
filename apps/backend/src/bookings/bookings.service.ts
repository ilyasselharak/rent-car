import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { generateBookingNumber, calculateRentalDays, calculateRentalPrice, applyDiscount } from '@rentcar/shared';
import { BookingStatus, UserRole } from '@rentcar/shared';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findMyBookings(userId: string, params: { page?: number; limit?: number; status?: BookingStatus }) {
    const { page = 1, limit = 20, status } = params;
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) throw new NotFoundException('Customer profile not found');

    return this.findAll({ page, limit, status, customerId: customer.id });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: BookingStatus;
    customerId?: string;
    vehicleId?: string;
    agencyId?: string;
    startDateFrom?: Date;
    startDateTo?: Date;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page = 1, limit = 20, search, status, customerId, vehicleId, agencyId, startDateFrom, startDateTo, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { bookingNumber: { contains: search, mode: 'insensitive' } },
        { customer: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { customer: { user: { email: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    if (status) where.status = status as BookingStatus;
    if (customerId) where.customerId = customerId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (agencyId) where.agencyId = agencyId;

    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) (where.startDate as Record<string, unknown>).gte = startDateFrom;
      if (startDateTo) (where.startDate as Record<string, unknown>).lte = startDateTo;
    }

    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          customer: {
            select: {
              id: true,
              user: { select: { id: true, name: true, email: true, phone: true } },
            },
          },
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              images: true,
              registrationNumber: true,
            },
          },
          agencyProfile: { select: { id: true, agencyName: true } },
          pickupLocation: { select: { id: true, name: true, address: true } },
          returnLocation: { select: { id: true, name: true, address: true } },
          payments: {
            select: { id: true, amount: true, status: true, method: true },
          },
          _count: {
            select: { additionalDrivers: true, documents: true },
          },
        },
      }),
      this.prisma.booking.count({ where }),
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

  async findById(id: string, user?: { id: string; role: string }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
        vehicle: {
          include: {
            agencyProfile: { select: { id: true, agencyName: true } },
            location: { select: { id: true, name: true } },
          },
        },
        agencyProfile: { select: { id: true, agencyName: true } },
        pickupLocation: true,
        returnLocation: true,
        payments: true,
        documents: true,
        additionalDrivers: true,
        damageReports: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (user && user.role === 'CLIENT') {
      const customer = await this.prisma.customer.findUnique({ where: { userId: user.id } });
      if (!customer || booking.customerId !== customer.id) {
        throw new ForbiddenException('Access denied');
      }
    }

    return booking;
  }

  async create(data: {
    customerId: string;
    vehicleId: string;
    startDate: Date;
    endDate: Date;
    pickupLocationId: string;
    returnLocationId: string;
    notes?: string;
    couponCode?: string;
    createdById?: string;
    agencyId: string;
  }) {
    const { customerId, vehicleId, startDate, endDate, pickupLocationId, returnLocationId, notes, couponCode, createdById, agencyId } = data;

    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.status === 'OUT_OF_SERVICE' || vehicle.status === 'MAINTENANCE') {
      throw new BadRequestException('Vehicle is not available for booking');
    }

    const resolvedAgencyId = agencyId || vehicle.agencyId;
    let resolvedPickupId = pickupLocationId || vehicle.locationId;
    let resolvedReturnId = returnLocationId || vehicle.locationId;

    if (!resolvedPickupId || !resolvedReturnId) {
      let defaultLocation = await this.prisma.location.findFirst({
        where: { agencyId: resolvedAgencyId, isActive: true },
      });
      if (!defaultLocation) {
        const agency = await this.prisma.agencyProfile.findUnique({
          where: { id: resolvedAgencyId },
          select: { agencyName: true, address: true, city: true },
        });
        defaultLocation = await this.prisma.location.create({
          data: {
            agencyId: resolvedAgencyId,
            name: agency?.agencyName || 'Main Office',
            address: agency?.address || 'Main Address',
            city: agency?.city || 'Main City',
            country: 'Morocco',
            isActive: true,
          },
        });
      }
      resolvedPickupId = resolvedPickupId || defaultLocation.id;
      resolvedReturnId = resolvedReturnId || defaultLocation.id;
    }

    // Check availability
    const conflicting = await this.prisma.booking.findFirst({
      where: {
        vehicleId,
        status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    if (conflicting) {
      throw new BadRequestException('Vehicle is not available for the selected dates');
    }

    const days = calculateRentalDays(new Date(startDate), new Date(endDate));
    const subtotal = calculateRentalPrice({
      dailyRate: Number(vehicle.dailyRate),
      weeklyRate: vehicle.weeklyRate ? Number(vehicle.weeklyRate) : null,
      monthlyRate: vehicle.monthlyRate ? Number(vehicle.monthlyRate) : null,
      days,
    });

    let discountAmount = 0;
    let couponId: string | undefined;

    if (couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        if (coupon.startDate <= now && coupon.endDate >= now) {
          if (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) {
            if (Number(coupon.minBookingAmount) <= subtotal) {
              discountAmount = applyDiscount({
                amount: subtotal,
                discountType: coupon.type as 'PERCENTAGE' | 'FIXED',
                discountValue: Number(coupon.value),
                maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined,
              });
              couponId = coupon.id;
            }
          }
        }
      }
    }

    const agencySetting = await this.prisma.agencySetting.findUnique({
      where: { agencyProfileId: resolvedAgencyId },
    });

    const taxRate = agencySetting ? Number(agencySetting.taxRate) : 0;
    const taxAmount = Math.round((subtotal - discountAmount) * taxRate * 100) / 100;
    const finalAmount = Math.round((subtotal - discountAmount + taxAmount) * 100) / 100;

    const booking = await this.prisma.booking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        customerId,
        vehicleId,
        agencyId: resolvedAgencyId,
        createdById,
        startDate,
        endDate,
        pickupLocationId: resolvedPickupId,
        returnLocationId: resolvedReturnId,
        dailyRate: Number(vehicle.dailyRate),
        totalDays: days,
        subtotal,
        discountAmount,
        taxAmount,
        depositAmount: Number(vehicle.depositAmount),
        finalAmount,
        paidAmount: 0,
        notes,
      },
      include: {
        customer: {
          select: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        vehicle: {
          select: { brand: true, model: true, year: true, images: true },
        },
      },
    });

    if (couponId) {
      await this.prisma.coupon.update({
        where: { id: couponId },
        data: { usageCount: { increment: 1 } },
      });

      await this.prisma.couponUsage.create({
        data: {
          couponId,
          bookingId: booking.id,
          customerId,
          discountAmount,
        },
      });
    }

    // Update vehicle status
    await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'RESERVED' },
    });

    return booking;
  }

  async updateStatus(id: string, status: string, userId: string, userRole: string) {
    const booking = await this.findById(id);
    const newStatus = status as BookingStatus;

    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED', 'ACTIVE', 'NO_SHOW'],
      CONFIRMED: ['ACTIVE', 'CANCELLED', 'NO_SHOW'],
      ACTIVE: ['COMPLETED', 'EXTENDED', 'EARLY_RETURN', 'CANCELLED'],
      EXTENDED: ['COMPLETED', 'ACTIVE', 'CANCELLED'],
      EARLY_RETURN: ['COMPLETED', 'ACTIVE', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
      NO_SHOW: [],
    };

    const allowed = validTransitions[booking.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${booking.status} to ${status}`,
      );
    }

    const updateData: Record<string, unknown> = { status: newStatus };

    if (newStatus === 'CONFIRMED') {
      updateData.approvedById = userId;
      updateData.approvedAt = new Date();
    }

    if (newStatus === 'ACTIVE') {
      updateData.actualStartDate = new Date();
      await this.prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: 'RENTED' },
      });
    }

    if (newStatus === 'COMPLETED') {
      updateData.actualEndDate = new Date();
      await this.prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: 'AVAILABLE' },
      });
      await this.createRentalHistory(booking);
    }

    if (newStatus === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancelledById = userId;
      await this.prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: 'AVAILABLE' },
      });
    }

    return this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: {
            user: { select: { name: true, email: true } },
          },
        },
        vehicle: {
          select: { brand: true, model: true },
        },
      },
    });
  }

  async cancel(id: string, reason: string, userId: string, userRole?: string) {
    if (!userRole || userRole === 'CLIENT') {
      const booking = await this.prisma.booking.findUnique({ where: { id }, select: { id: true, customer: { select: { userId: true } } } });
      if (!booking) throw new NotFoundException('Booking not found');
      const customer = await this.prisma.customer.findUnique({ where: { userId } });
      if (!customer || booking.customer.userId !== userId) {
        throw new ForbiddenException('You can only cancel your own bookings');
      }
    }
    return this.updateStatus(id, 'CANCELLED', userId, '');
  }

  private async createRentalHistory(booking: {
    id: string;
    vehicleId: string;
    customerId: string;
    startDate: Date;
    endDate: Date;
  }) {
    await this.prisma.rentalHistory.create({
      data: {
        vehicleId: booking.vehicleId,
        bookingId: booking.id,
        customerId: booking.customerId,
        startDate: booking.startDate,
        endDate: booking.endDate,
      },
    });
  }
}
