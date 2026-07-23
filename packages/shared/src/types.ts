import type { UserRole, BookingStatus, PaymentStatus, PaymentMethod, FuelType, TransmissionType, VehicleStatus, MaintenanceType, NotificationChannel, DocumentType } from './constants.js';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  password?: string | null;
  name: string | null;
  avatar: string | null;
  role: UserRole;
  emailVerified: Date | null;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
}

export interface Vehicle extends BaseEntity {
  brand: string;
  model: string;
  year: number;
  vin: string;
  registrationNumber: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  mileage: number;
  seats: number;
  doors: number;
  color: string;
  category: string;
  status: VehicleStatus;
  dailyRate: number;
  weeklyRate: number | null;
  monthlyRate: number | null;
  depositAmount: number;
  agencyId: string;
  locationId: string | null;
  currentLocation: { lat: number; lng: number } | null;
  features: string[];
  images: string[];
  description: string | null;
}

export interface Booking extends BaseEntity {
  bookingNumber: string;
  customerId: string;
  vehicleId: string;
  agencyId: string;
  createdById: string | null;
  startDate: Date;
  endDate: Date;
  actualStartDate: Date | null;
  actualEndDate: Date | null;
  pickupLocationId: string;
  returnLocationId: string;
  dailyRate: number;
  totalDays: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  depositAmount: number;
  finalAmount: number;
  paidAmount: number;
  notes: string | null;
  status: BookingStatus;
  source: 'WEB' | 'PHONE' | 'WHATSAPP' | 'AGENCY' | 'WALK_IN';
  approvedById: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  cancellationReason: string | null;
  cancelledAt: Date | null;
  cancelledById: string | null;
}

export interface Payment extends BaseEntity {
  bookingId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  stripePaymentIntentId: string | null;
  paypalOrderId: string | null;
  paidAt: Date | null;
  refundedAt: Date | null;
  refundAmount: number | null;
  metadata: Record<string, unknown> | null;
}

export interface Customer extends BaseEntity {
  userId: string;
  dateOfBirth: Date | null;
  nationality: string | null;
  licenseNumber: string | null;
  licenseExpiry: Date | null;
  licenseCountry: string | null;
  passportNumber: string | null;
  idNumber: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  zipCode: string | null;
  loyaltyPoints: number;
  loyaltyTier: string;
  isBlacklisted: boolean;
  blacklistReason: string | null;
  internalNotes: string | null;
}

export interface MaintenanceRecord extends BaseEntity {
  vehicleId: string;
  type: MaintenanceType;
  scheduledDate: Date;
  completedDate: Date | null;
  cost: number | null;
  description: string;
  performedBy: string | null;
  nextDueDate: Date | null;
  mileageAtService: number | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface Notification extends BaseEntity {
  userId: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  isRead: boolean;
  sentAt: Date | null;
  metadata: Record<string, unknown> | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface FilterParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  [key: string]: string | number | boolean | undefined;
}
