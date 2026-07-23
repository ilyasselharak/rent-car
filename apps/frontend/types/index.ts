export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  registrationNumber: string;
  fuelType: string;
  transmission: string;
  mileage: number;
  seats: number;
  doors: number;
  color: string;
  category: string;
  description: string | null;
  status: string;
  dailyRate: number;
  weeklyRate: number | null;
  monthlyRate: number | null;
  depositAmount: number;
  features: string[];
  images: string[];
  hasGPS: boolean;
  hasBluetooth: boolean;
  hasAppleCarPlay: boolean;
  hasAndroidAuto: boolean;
  agency: { id: string; name: string };
  location: { id: string; name: string; city: string } | null;
  _count?: { bookings: number };
}

export interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  startDate: string;
  endDate: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  depositAmount: number;
  finalAmount: number;
  paidAmount: number;
  totalDays: number;
  source: string;
  notes: string | null;
  customer: {
    id: string;
    user: { id: string; name: string | null; email: string; phone: string | null };
  };
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    images: string[];
    registrationNumber: string;
  };
  agency: { id: string; name: string };
  pickupLocation: { id: string; name: string; address: string };
  returnLocation: { id: string; name: string; address: string };
  payments: { id: string; amount: number; status: string; method: string }[];
}

export interface Customer {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    avatar: string | null;
    isActive: boolean;
    createdAt: string;
  };
  dateOfBirth: string | null;
  nationality: string | null;
  licenseNumber: string | null;
  licenseExpiry: string | null;
  passportNumber: string | null;
  loyaltyPoints: number;
  loyaltyTier: string;
  totalRentals: number;
  totalSpent: number;
  isBlacklisted: boolean;
  internalNotes: string | null;
  _count?: { bookings: number; documents: number };
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

export interface DashboardStats {
  summary: {
    totalRevenue: number;
    totalBookings: number;
    activeBookings: number;
    totalVehicles: number;
    availableVehicles: number;
    occupancyRate: number;
    totalCustomers: number;
    newCustomers: number;
    completionRate: number;
    cancellationRate: number;
    pendingBookings: number;
  };
  dailyRevenue: { date: string; amount: number; count: number }[];
  topVehicles: { id: string; brand: string; model: string; images: string[]; bookingCount: number }[];
}
