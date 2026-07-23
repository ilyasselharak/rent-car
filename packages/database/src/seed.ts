import { prisma } from './client.js';
import { hash } from 'bcryptjs';

async function main() {
  console.log('🌱 Starting database seed...');

  const agencyAdminPassword = await hash('AgencyAdmin123!', 12);
  const agencyAdmin = await prisma.user.upsert({
    where: { email: 'agency@rentcar.com' },
    update: {},
    create: {
      email: 'agency@rentcar.com',
      name: 'Agency Admin',
      password: agencyAdminPassword,
      role: 'AGENCY',
      emailVerified: new Date(),
      phone: '+1-555-0000',
    },
  });

  const agency = await prisma.agencyProfile.upsert({
    where: { userId: agencyAdmin.id },
    update: {},
    create: {
      userId: agencyAdmin.id,
      agencyName: 'Main Headquarters',
      slug: 'main-headquarters',
      description: 'Primary rental location',
      phone: '+1-555-0100',
      city: 'New York',
      address: '123 Main Street, New York, NY 10001',
      ownerName: 'John Doe',
      businessRegNumber: 'BRN-001',
      taxId: 'TAX-001',
    },
  });

  const location = await prisma.location.upsert({
    where: { id: 'main-location' },
    update: {},
    create: {
      id: 'main-location',
      agencyId: agency.id,
      name: 'Downtown Office',
      address: '123 Main Street',
      city: 'New York',
      country: 'USA',
      zipCode: '10001',
      phone: '+1-555-0101',
      email: 'downtown@rentcar.com',
      latitude: 40.7128,
      longitude: -74.006,
    },
  });

  const adminPassword = await hash('SuperAdmin123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@rentcar.com' },
    update: {},
    create: {
      email: 'admin@rentcar.com',
      name: 'Super Administrator',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
      phone: '+1-555-0000',
    },
  });

  const agencyOwnerPassword = await hash('Agency123!', 12);
  const agencyOwner = await prisma.user.upsert({
    where: { email: 'owner@rentcar.com' },
    update: {},
    create: {
      email: 'owner@rentcar.com',
      name: 'Agency Owner',
      password: agencyOwnerPassword,
      role: 'AGENCY',
      emailVerified: new Date(),
      phone: '+1-555-0001',
    },
  });

  await prisma.agencyProfile.upsert({
    where: { userId: agencyOwner.id },
    update: {},
    create: {
      userId: agencyOwner.id,
      agencyName: 'Premium Rentals',
      slug: 'premium-rentals',
      description: 'Premium car rental service',
      phone: '+1-555-0002',
      city: 'New York',
      address: '456 Broadway, New York, NY 10013',
      ownerName: 'Jane Smith',
      businessRegNumber: 'BRN-002',
      taxId: 'TAX-002',
    },
  });

  const vehicles = [
    {
      brand: 'Tesla',
      model: 'Model 3',
      year: 2024,
      vin: '5YJ3E1EA8PF000001',
      registrationNumber: 'NY-2024-001',
      fuelType: 'ELECTRIC' as const,
      transmission: 'AUTOMATIC' as const,
      mileage: 1500,
      seats: 5,
      doors: 4,
      color: 'Pearl White',
      category: 'Sedan',
      description: 'Premium electric sedan with autopilot',
      dailyRate: 89.99,
      weeklyRate: 539.99,
      monthlyRate: 1899.99,
      depositAmount: 500,
      features: ['Autopilot', 'Premium Audio', 'Heated Seats', 'Glass Roof'],
      images: ['/vehicles/tesla-model3-1.jpg'],
      hasGPS: true,
      hasBluetooth: true,
      hasAppleCarPlay: true,
      hasAndroidAuto: true,
    },
    {
      brand: 'BMW',
      model: 'X5',
      year: 2024,
      vin: '5UXCR6C0XP9L00001',
      registrationNumber: 'NY-2024-002',
      fuelType: 'HYBRID' as const,
      transmission: 'AUTOMATIC' as const,
      mileage: 3200,
      seats: 7,
      doors: 5,
      color: 'Jet Black',
      category: 'SUV',
      description: 'Luxury hybrid SUV with panoramic roof',
      dailyRate: 129.99,
      weeklyRate: 779.99,
      monthlyRate: 2799.99,
      depositAmount: 750,
      features: ['Panoramic Roof', 'Massage Seats', 'HUD', 'Air Suspension'],
      images: ['/vehicles/bmw-x5-1.jpg'],
      hasGPS: true,
      hasBluetooth: true,
      hasAppleCarPlay: true,
      hasAndroidAuto: true,
    },
    {
      brand: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2024,
      vin: 'W1KWF8DB0PR000001',
      registrationNumber: 'NY-2024-003',
      fuelType: 'GASOLINE' as const,
      transmission: 'AUTOMATIC' as const,
      mileage: 800,
      seats: 5,
      doors: 4,
      color: 'Selenite Grey',
      category: 'Luxury',
      description: 'Executive luxury sedan',
      dailyRate: 109.99,
      weeklyRate: 659.99,
      monthlyRate: 2299.99,
      depositAmount: 600,
      features: ['MBUX', 'Burmester Audio', 'Ambient Lighting', 'Driver Assist'],
      images: ['/vehicles/mercedes-c-1.jpg'],
      hasGPS: true,
      hasBluetooth: true,
      hasAppleCarPlay: true,
      hasAndroidAuto: true,
    },
    {
      brand: 'Toyota',
      model: 'RAV4',
      year: 2024,
      vin: 'JTMEWRFV7PD000001',
      registrationNumber: 'NY-2024-004',
      fuelType: 'HYBRID' as const,
      transmission: 'AUTOMATIC' as const,
      mileage: 5000,
      seats: 5,
      doors: 5,
      color: 'Super White',
      category: 'SUV',
      description: 'Reliable hybrid SUV with excellent fuel economy',
      dailyRate: 59.99,
      weeklyRate: 359.99,
      monthlyRate: 1199.99,
      depositAmount: 300,
      features: ['AWD', 'Safety Sense', 'Apple CarPlay', 'Wireless Charging'],
      images: ['/vehicles/toyota-rav4-1.jpg'],
      hasGPS: true,
      hasBluetooth: true,
      hasAppleCarPlay: true,
      hasAndroidAuto: true,
    },
    {
      brand: 'Porsche',
      model: '911 Carrera',
      year: 2024,
      vin: 'WP0AA2A90PS200001',
      registrationNumber: 'NY-2024-005',
      fuelType: 'GASOLINE' as const,
      transmission: 'AUTOMATIC' as const,
      mileage: 200,
      seats: 4,
      doors: 2,
      color: 'Racing Yellow',
      category: 'Sports',
      description: 'Iconic sports car experience',
      dailyRate: 299.99,
      weeklyRate: 1799.99,
      monthlyRate: 5999.99,
      depositAmount: 2000,
      features: ['Sport Chrono', 'PASM', 'Sport Exhaust', 'BOSE Audio'],
      images: ['/vehicles/porsche-911-1.jpg'],
      hasGPS: true,
      hasBluetooth: true,
      hasAppleCarPlay: true,
      hasAndroidAuto: false,
    },
    {
      brand: 'Ford',
      model: 'F-150',
      year: 2024,
      vin: '1FTFW1E88PKE00001',
      registrationNumber: 'NY-2024-006',
      fuelType: 'GASOLINE' as const,
      transmission: 'AUTOMATIC' as const,
      mileage: 4500,
      seats: 6,
      doors: 4,
      color: 'Agate Black',
      category: 'Truck',
      description: 'Full-size pickup truck with towing capability',
      dailyRate: 79.99,
      weeklyRate: 479.99,
      monthlyRate: 1599.99,
      depositAmount: 400,
      features: ['Towing Package', 'Pro Power', 'SYNC 4', 'Trailering Tech'],
      images: ['/vehicles/ford-f150-1.jpg'],
      hasGPS: true,
      hasBluetooth: true,
      hasAppleCarPlay: true,
      hasAndroidAuto: true,
    },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { vin: v.vin },
      update: {},
      create: {
        ...v,
        agencyId: agency.id,
        locationId: location.id,
      },
    });
  }

  await prisma.pricingRule.upsert({
    where: { id: 'weekend-surcharge' },
    update: {},
    create: {
      id: 'weekend-surcharge',
      name: 'Weekend Surcharge',
      type: 'WEEKEND',
      adjustmentType: 'PERCENTAGE',
      adjustmentValue: 15,
      dayOfWeek: [0, 6],
      isActive: true,
      priority: 10,
    },
  });

  await prisma.pricingRule.upsert({
    where: { id: 'long-term-discount' },
    update: {},
    create: {
      id: 'long-term-discount',
      name: 'Long Term Discount',
      type: 'LONG_TERM',
      adjustmentType: 'PERCENTAGE',
      adjustmentValue: -10,
      minDays: 30,
      isActive: true,
      priority: 5,
    },
  });

  await prisma.setting.upsert({
    where: { key: 'platform_name' },
    update: {},
    create: {
      key: 'platform_name',
      value: 'RentCar Enterprise',
      category: 'GENERAL',
    },
  });

  await prisma.agencySetting.upsert({
    where: { agencyProfileId: agency.id },
    update: {},
    create: {
      agencyProfileId: agency.id,
      defaultCurrency: 'USD',
      taxRate: 0.08,
      timezone: 'America/New_York',
      workingHours: {
        open: '08:00',
        close: '20:00',
        days: [1, 2, 3, 4, 5, 6],
      },
      gracePeriodMinutes: 60,
      lateReturnFeePerHour: 25,
      minRentalAge: 21,
      maxRentalAge: 80,
      cancellationPolicy: {
        hoursBefore: 24,
        refundPercent: 100,
      },
    },
  });

  console.log('✅ Database seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
