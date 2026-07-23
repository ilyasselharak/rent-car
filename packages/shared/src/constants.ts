export const UserRole = {
  CLIENT: 'CLIENT',
  AGENCY: 'AGENCY',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Permission = {
  // Vehicle permissions
  VEHICLE_READ: 'vehicle:read',
  VEHICLE_CREATE: 'vehicle:create',
  VEHICLE_UPDATE: 'vehicle:update',
  VEHICLE_DELETE: 'vehicle:delete',
  VEHICLE_MANAGE_PRICING: 'vehicle:manage:pricing',
  VEHICLE_MANAGE_AVAILABILITY: 'vehicle:manage:availability',

  // Booking permissions
  BOOKING_READ: 'booking:read',
  BOOKING_CREATE: 'booking:create',
  BOOKING_UPDATE: 'booking:update',
  BOOKING_DELETE: 'booking:delete',
  BOOKING_APPROVE: 'booking:approve',
  BOOKING_CANCEL: 'booking:cancel',
  BOOKING_EXTEND: 'booking:extend',

  // Customer permissions
  CUSTOMER_READ: 'customer:read',
  CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_UPDATE: 'customer:update',
  CUSTOMER_DELETE: 'customer:delete',

  // Payment permissions
  PAYMENT_READ: 'payment:read',
  PAYMENT_CREATE: 'payment:create',
  PAYMENT_REFUND: 'payment:refund',
  PAYMENT_MANAGE: 'payment:manage',

  // Fleet permissions
  FLEET_READ: 'fleet:read',
  FLEET_MANAGE_MAINTENANCE: 'fleet:manage:maintenance',
  FLEET_MANAGE_INSPECTION: 'fleet:manage:inspection',

  // Dashboard permissions
  DASHBOARD_READ: 'dashboard:read',

  // Analytics permissions
  ANALYTICS_READ: 'analytics:read',
  ANALYTICS_EXPORT: 'analytics:export',

  // Settings permissions
  SETTINGS_READ: 'settings:read',
  SETTINGS_MANAGE: 'settings:manage',

  // User management
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Agency permissions
  AGENCY_READ: 'agency:read',
  AGENCY_MANAGE: 'agency:manage',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.CLIENT]: [
    Permission.VEHICLE_READ,
    Permission.BOOKING_READ,
    Permission.BOOKING_CREATE,
    Permission.BOOKING_CANCEL,
    Permission.PAYMENT_READ,
    Permission.PAYMENT_CREATE,
  ],
  [UserRole.AGENCY]: [
    Permission.VEHICLE_READ,
    Permission.VEHICLE_CREATE,
    Permission.VEHICLE_UPDATE,
    Permission.VEHICLE_DELETE,
    Permission.VEHICLE_MANAGE_PRICING,
    Permission.VEHICLE_MANAGE_AVAILABILITY,
    Permission.BOOKING_READ,
    Permission.BOOKING_UPDATE,
    Permission.BOOKING_APPROVE,
    Permission.BOOKING_CANCEL,
    Permission.CUSTOMER_READ,
    Permission.PAYMENT_READ,
    Permission.PAYMENT_REFUND,
    Permission.FLEET_READ,
    Permission.FLEET_MANAGE_MAINTENANCE,
    Permission.FLEET_MANAGE_INSPECTION,
    Permission.DASHBOARD_READ,
    Permission.ANALYTICS_READ,
    Permission.ANALYTICS_EXPORT,
    Permission.SETTINGS_READ,
    Permission.AGENCY_READ,
    Permission.AGENCY_MANAGE,
  ],
  [UserRole.ADMIN]: [
    Permission.DASHBOARD_READ,
    ...Object.values(Permission).filter((p) => p !== Permission.SETTINGS_MANAGE && p !== Permission.USER_DELETE && p !== Permission.DASHBOARD_READ),
  ],
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
};

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
  EXTENDED: 'EXTENDED',
  EARLY_RETURN: 'EARLY_RETURN',
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  APPLE_PAY: 'APPLE_PAY',
  GOOGLE_PAY: 'GOOGLE_PAY',
  PAYPAL: 'PAYPAL',
  CASH: 'CASH',
  WIRE_TRANSFER: 'WIRE_TRANSFER',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const FuelType = {
  GASOLINE: 'GASOLINE',
  DIESEL: 'DIESEL',
  ELECTRIC: 'ELECTRIC',
  HYBRID: 'HYBRID',
  PLUGIN_HYBRID: 'PLUGIN_HYBRID',
  HYDROGEN: 'HYDROGEN',
} as const;

export type FuelType = (typeof FuelType)[keyof typeof FuelType];

export const TransmissionType = {
  MANUAL: 'MANUAL',
  AUTOMATIC: 'AUTOMATIC',
  CVT: 'CVT',
  SEMI_AUTOMATIC: 'SEMI_AUTOMATIC',
} as const;

export type TransmissionType = (typeof TransmissionType)[keyof typeof TransmissionType];

export const VehicleStatus = {
  AVAILABLE: 'AVAILABLE',
  RENTED: 'RENTED',
  MAINTENANCE: 'MAINTENANCE',
  RESERVED: 'RESERVED',
  OUT_OF_SERVICE: 'OUT_OF_SERVICE',
  CLEANING: 'CLEANING',
} as const;

export type VehicleStatus = (typeof VehicleStatus)[keyof typeof VehicleStatus];

export const MaintenanceType = {
  OIL_CHANGE: 'OIL_CHANGE',
  TIRE_ROTATION: 'TIRE_ROTATION',
  BRAKE_CHECK: 'BRAKE_CHECK',
  BATTERY_CHECK: 'BATTERY_CHECK',
  INSPECTION: 'INSPECTION',
  REPAIR: 'REPAIR',
  CLEANING: 'CLEANING',
  INSURANCE_RENEWAL: 'INSURANCE_RENEWAL',
  REGISTRATION_RENEWAL: 'REGISTRATION_RENEWAL',
} as const;

export type MaintenanceType = (typeof MaintenanceType)[keyof typeof MaintenanceType];

export const NotificationChannel = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  WHATSAPP: 'WHATSAPP',
  PUSH: 'PUSH',
  IN_APP: 'IN_APP',
} as const;

export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const DocumentType = {
  RENTAL_CONTRACT: 'RENTAL_CONTRACT',
  INVOICE: 'INVOICE',
  RECEIPT: 'RECEIPT',
  INSPECTION_REPORT: 'INSPECTION_REPORT',
  DELIVERY_FORM: 'DELIVERY_FORM',
  RETURN_FORM: 'RETURN_FORM',
  DAMAGE_REPORT: 'DAMAGE_REPORT',
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];
