import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { DocumentType } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async findByBooking(bookingId: string) {
    return this.prisma.document.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    bookingId?: string;
    type: string;
    fileUrl: string;
    fileName: string;
    fileSize?: number;
    mimeType?: string;
    generatedData?: Record<string, unknown>;
  }) {
    const { bookingId, type, generatedData, ...rest } = data;
    return this.prisma.document.create({
      data: {
        ...rest,
        type: type as DocumentType,
        ...(bookingId ? { bookingId } : {}),
        ...(generatedData ? { generatedData: generatedData as any } : {}),
      },
    });
  }

  async markAsSigned(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');

    return this.prisma.document.update({
      where: { id },
      data: { isSigned: true, signedAt: new Date() },
    });
  }
}
