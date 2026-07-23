import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get documents for a booking' })
  async findByBooking(@Param('bookingId') bookingId: string) {
    return this.documentsService.findByBooking(bookingId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a document' })
  async create(@Body() data: {
    bookingId?: string;
    type: string;
    fileUrl: string;
    fileName: string;
    fileSize?: number;
    mimeType?: string;
  }) {
    return this.documentsService.create(data);
  }

  @Patch(':id/sign')
  @ApiOperation({ summary: 'Mark document as signed' })
  async markAsSigned(@Param('id') id: string) {
    return this.documentsService.markAsSigned(id);
  }
}
