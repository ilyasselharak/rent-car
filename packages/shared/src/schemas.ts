import { z } from 'zod';
import {
  UserRole,
  BookingStatus,
  PaymentMethod,
  FuelType,
  TransmissionType,
  VehicleStatus,
  MaintenanceType,
  NotificationChannel,
  DocumentType,
} from './constants.js';

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(8).max(100),
  role: z.enum(Object.values(UserRole) as [string, ...string[]]).default('CLIENT'),
  phone: z.string().optional(),
  agencyId: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export const createVehicleSchema = z.object({
  brand: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  vin: z.string().length(17),
  registrationNumber: z.string().min(1).max(50),
  fuelType: z.enum(Object.values(FuelType) as [string, ...string[]]),
  transmission: z.enum(Object.values(TransmissionType) as [string, ...string[]]),
  mileage: z.number().int().min(0),
  seats: z.number().int().min(1).max(50),
  doors: z.number().int().min(1).max(10),
  color: z.string().min(1).max(50),
  category: z.string().min(1).max(50),
  dailyRate: z.number().positive(),
  weeklyRate: z.number().positive().optional(),
  monthlyRate: z.number().positive().optional(),
  depositAmount: z.number().nonnegative().default(0),
  agencyId: z.string().min(1),
  locationId: z.string().optional(),
  features: z.array(z.string()).default([]),
  description: z.string().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const createBookingSchema = z.object({
  customerId: z.string().min(1),
  vehicleId: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  pickupLocationId: z.string().min(1),
  returnLocationId: z.string().min(1),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
  insuranceId: z.string().optional(),
  additionalDriverIds: z.array(z.string()).optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum(Object.values(BookingStatus) as [string, ...string[]]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  actualStartDate: z.coerce.date().optional(),
  actualEndDate: z.coerce.date().optional(),
  pickupLocationId: z.string().optional(),
  returnLocationId: z.string().optional(),
  notes: z.string().optional(),
});

export const createPaymentSchema = z.object({
  bookingId: z.string().min(1),
  amount: z.number().positive(),
  method: z.enum(Object.values(PaymentMethod) as [string, ...string[]]),
});

export const createCustomerSchema = z.object({
  userId: z.string().min(1),
  dateOfBirth: z.coerce.date().optional(),
  nationality: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.coerce.date().optional(),
  licenseCountry: z.string().optional(),
  passportNumber: z.string().optional(),
  idNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
});

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().min(1),
  type: z.enum(Object.values(MaintenanceType) as [string, ...string[]]),
  scheduledDate: z.coerce.date(),
  description: z.string().min(1),
  cost: z.number().nonnegative().optional(),
  performedBy: z.string().optional(),
  mileageAtService: z.number().int().min(0).optional(),
});

export const createNotificationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  channel: z.enum(Object.values(NotificationChannel) as [string, ...string[]]),
  metadata: z.record(z.unknown()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(8).max(100),
  phone: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(50),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().positive(),
  minBookingAmount: z.number().nonnegative().default(0),
  maxDiscount: z.number().positive().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  usageLimit: z.number().int().positive().optional(),
  applicableCategories: z.array(z.string()).optional(),
  applicableVehicles: z.array(z.string()).optional(),
});

export type PaginationParams = z.infer<typeof paginationSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
