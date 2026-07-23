import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findByBookingId(bookingId: string) {
    return this.prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    bookingId: string;
    amount: number;
    method: string;
    stripePaymentIntentId?: string;
    paypalOrderId?: string;
  }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: data.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.payment.create({
      data: {
        ...data,
        method: data.method as PaymentMethod,
        amount: data.amount,
        status: 'PENDING' as PaymentStatus,
      },
    });
  }

  async markAsCompleted(id: string) {
    return this.prisma.payment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
      },
    });
  }

  async processRefund(id: string, amount: number, reason: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        status: amount >= Number(payment.amount) ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        refundAmount: amount,
        refundReason: reason,
        refundedAt: new Date(),
      },
    });
  }
}
