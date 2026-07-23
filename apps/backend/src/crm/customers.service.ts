import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    isBlacklisted?: boolean;
    loyaltyTier?: string;
  }) {
    const { page = 1, limit = 20, search, isBlacklisted, loyaltyTier } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
        { passportNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isBlacklisted !== undefined) where.isBlacklisted = isBlacklisted;
    if (loyaltyTier) where.loyaltyTier = loyaltyTier;

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              avatar: true,
              isActive: true,
              createdAt: true,
            },
          },
          _count: {
            select: { bookings: true, documents: true },
          },
        },
      }),
      this.prisma.customer.count({ where }),
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
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        user: true,
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            vehicle: { select: { brand: true, model: true, year: true, images: true } },
          },
        },
        documents: true,
        rentalHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, data: Record<string, unknown>) {
    const customer = await this.findById(id);

    return this.prisma.customer.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findByUserId(userId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            vehicle: { select: { brand: true, model: true, images: true } },
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    return customer;
  }

  async toggleBlacklist(id: string, isBlacklisted: boolean, reason?: string) {
    return this.prisma.customer.update({
      where: { id },
      data: {
        isBlacklisted,
        blacklistReason: isBlacklisted ? reason : null,
        blacklistedAt: isBlacklisted ? new Date() : null,
      },
    });
  }
}
