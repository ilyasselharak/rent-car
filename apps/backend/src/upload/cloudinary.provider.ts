import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryProvider {
  private readonly logger = new Logger(CloudinaryProvider.name);

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    this.logger.log(`Cloudinary config loaded: cloud_name="${cloudName}", api_key="${apiKey?.slice(0, 4)}...", has_secret=${!!apiSecret}`);

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.error('Cloudinary credentials are missing! Check your .env file.');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  get instance() {
    return cloudinary;
  }
}