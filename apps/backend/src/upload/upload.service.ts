import { Injectable, BadRequestException } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';

@Injectable()
export class UploadService {
  constructor(private cloudinaryProvider: CloudinaryProvider) {}

  async uploadImage(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WebP and AVIF images are allowed');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataUri = `data:${file.mimetype};base64,${b64}`;

    try {
      const result = await this.cloudinaryProvider.instance.uploader.upload(dataUri, {
        folder: 'rentcar/vehicles',
        resource_type: 'image',
      });
      return { url: result.secure_url, publicId: result.public_id };
    } catch (error: unknown) {
      console.error('[UploadService] Cloudinary upload error:', error);
      const message = error instanceof Error ? error.message : 'Upload failed';
      throw new BadRequestException(`Cloudinary upload failed: ${message}`);
    }
  }

  async uploadMultiple(files: Express.Multer.File[]): Promise<{ url: string; publicId: string }[]> {
    return Promise.all(files.map((file) => this.uploadImage(file)));
  }
}