"use client";

import { use, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays,
  Heart,
  Share2,
  MapPin,
  Star,
  ChevronDown,
  ChevronUp,
  Fuel,
  Users,
  Gauge,
  Palette,
  Calendar,
  Car,
  Bluetooth,
  Smartphone,
  Wifi,
  Wind,
  Box,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";
import { VehicleGallery } from "@/components/vehicle-gallery";
import { BookingCard } from "@/components/booking-card";
import { SpecificationsGrid } from "@/components/specifications-grid";
import { ReviewsSection } from "@/components/reviews-section";
import { RelatedVehicles } from "@/components/related-vehicles";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarView({
  vehicleId,
  selectedStart,
  selectedEnd,
  onSelectStart,
  onSelectEnd,
}: {
  vehicleId: string;
  selectedStart: Date | null;
  selectedEnd: Date | null;
  onSelectStart: (d: Date | null) => void;
  onSelectEnd: (d: Date | null) => void;
}) {
  const { t } = useTranslations();
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);

  const { data: calendar, isLoading } = useQuery({
    queryKey: ["vehicle-calendar", vehicleId, viewYear, viewMonth],
    queryFn: () => api.get(`/vehicles/${vehicleId}/calendar?year=${viewYear}&month=${viewMonth}`),
  });

  const days: { date: string; available: boolean; status: string }[] = calendar?.days || [];
  const firstDayOfMonth = new Date(viewYear, viewMonth - 1, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(viewYear - 1); setViewMonth(12); }
    else { setViewMonth(viewMonth - 1); }
  };

  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear(viewYear + 1); setViewMonth(1); }
    else { setViewMonth(viewMonth + 1); }
  };

  const today = new Date();
  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth() + 1);
  const canGoNext = viewYear < today.getFullYear() + 1 || (viewYear === today.getFullYear() + 1 && viewMonth <= today.getMonth() + 1);

  const handleDayClick = (day: { date: string; available: boolean; status: string }) => {
    if (day.status !== 'available') return;
    const clicked = new Date(day.date + 'T00:00:00');

    if (!selectedStart || (selectedStart && selectedEnd)) {
      onSelectStart(clicked);
      onSelectEnd(null);
    } else if (clicked > selectedStart) {
      onSelectEnd(clicked);
    } else if (clicked < selectedStart) {
      onSelectStart(clicked);
      onSelectEnd(null);
    }
  };

  const isInRange = (dateStr: string) => {
    if (!selectedStart || !selectedEnd) return false;
    const d = new Date(dateStr + 'T00:00:00');
    return d > selectedStart && d < selectedEnd;
  };

  const isSelected = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return (selectedStart && d.getTime() === selectedStart.getTime()) ||
           (selectedEnd && d.getTime() === selectedEnd.getTime());
  };

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            {t("Availability Calendar")}
          </CardTitle>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button variant="ghost" size="icon" onClick={prevMonth} disabled={!canGoPrev} className="h-7 w-7 sm:h-8 sm:w-8">
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <span className="text-xs sm:text-sm font-medium min-w-[120px] sm:min-w-[140px] text-center">
              {t(MONTHS[viewMonth - 1]!)} {viewYear}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} disabled={!canGoNext} className="h-7 w-7 sm:h-8 sm:w-8">
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[260px] sm:h-[300px] w-full" />
        ) : (
          <>
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
              {DAY_NAMES.map((name) => (
                <div key={name} className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground py-1">
                  {t(name)}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day: { date: string; available: boolean; status: string }) => {
                const inRange = isInRange(day.date);
                const selected = isSelected(day.date);
                return (
                  <button
                    key={day.date}
                    onClick={() => handleDayClick(day)}
                    disabled={day.status !== 'available'}
                    className={cn(
                      "h-8 sm:h-9 w-full rounded text-xs sm:text-sm font-medium transition-colors relative",
                      day.status === 'past' && "text-muted-foreground/30 cursor-not-allowed",
                      day.status === 'booked' && "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 cursor-not-allowed line-through",
                      day.status === 'blocked' && "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 cursor-not-allowed line-through",
                      day.status === 'available' && "hover:bg-primary/10 cursor-pointer text-foreground",
                      isInRange(day.date) && "bg-primary/20",
                      isSelected(day.date) && "bg-primary text-primary-foreground hover:bg-primary",
                    )}
                  >
                    {new Date(day.date + 'T00:00:00').getDate()}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700" />
                <span>{t("Available")}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700" />
                <span>{t("Booked")}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700" />
                <span>{t("Blocked")}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded bg-muted" />
                <span>{t("Past")}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useTranslations();
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [descExpanded, setDescExpanded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => api.get(`/vehicles/${id}`),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["vehicle-reviews", id],
    queryFn: () => api.get(`/reviews?vehicleId=${id}`).catch(() => null),
    retry: false,
    enabled: !!vehicle,
  });

  const { data: relatedData } = useQuery({
    queryKey: ["related-vehicles", vehicle?.category],
    queryFn: () => api.get(`/vehicles?category=${vehicle.category}&limit=6&status=AVAILABLE`),
    enabled: !!vehicle?.category,
  });

  const reviews = Array.isArray(reviewsData) ? reviewsData : [];
  const averageRating = reviews.length
    ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
    : 0;

  const relatedVehicles = relatedData?.data?.filter((v: { id: string }) => v.id !== id)?.slice(0, 6) || [];

  const bookingMutation = useMutation({
    mutationFn: (data: {
      customerId: string;
      vehicleId: string;
      startDate: string;
      endDate: string;
      pickupLocationId: string;
      returnLocationId: string;
      agencyId: string;
      notes?: string;
    }) => api.post("/bookings", data),
    onSuccess: (data) => {
      router.push(`/book/confirmation?id=${data.id}`);
    },
  });

  const days = useMemo(() => {
    if (!selectedStart || !selectedEnd) return 0;
    const diff = selectedEnd.getTime() - selectedStart.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [selectedStart, selectedEnd]);

  const priceBreakdown = useMemo(() => {
    if (!vehicle || !days) return null;
    const daily = Number(vehicle.dailyRate);
    const weekly = vehicle.weeklyRate ? Number(vehicle.weeklyRate) : null;
    const monthly = vehicle.monthlyRate ? Number(vehicle.monthlyRate) : null;

    let subtotal = 0;
    let remaining = days;

    if (monthly && remaining >= 30) {
      const months = Math.floor(remaining / 30);
      subtotal += months * monthly;
      remaining %= 30;
    }
    if (weekly && remaining >= 7) {
      const weeks = Math.floor(remaining / 7);
      subtotal += weeks * weekly;
      remaining %= 7;
    }
    subtotal += remaining * Number(vehicle.dailyRate);

    return { subtotal, daily: Number(vehicle.dailyRate), weekly, monthly, days };
  }, [vehicle, days]);

  const handleBooking = useCallback(async () => {
    if (!selectedStart || !selectedEnd || !vehicle || !user) return;

    const customer = await api.get("/customers/me");
    if (!customer?.id) {
      router.push("/login");
      return;
    }

    const pickupId = vehicle.location?.id || vehicle.locationId;
    const returnId = vehicle.location?.id || vehicle.locationId;

    bookingMutation.mutate({
      customerId: customer.id,
      vehicleId: vehicle.id,
      startDate: selectedStart.toISOString(),
      endDate: selectedEnd.toISOString(),
      pickupLocationId: pickupId,
      returnLocationId: returnId,
      agencyId: vehicle.agencyProfile?.id || vehicle.agencyId,
      notes,
    });
  }, [selectedStart, selectedEnd, vehicle, user, notes, bookingMutation, router]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${vehicle?.brand} ${vehicle?.model}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  }, [vehicle]);

  const specs = useMemo(() => {
    if (!vehicle) return [];
    const featureSet = new Set((vehicle.features || []).map((f: string) => f.toLowerCase()));
    const list: { icon: any; label: string; value: string }[] = [];

    list.push({ icon: Gauge, label: t("Transmission"), value: vehicle.transmission });
    list.push({ icon: Fuel, label: t("Fuel Type"), value: vehicle.fuelType });
    list.push({ icon: Users, label: t("Seats"), value: `${vehicle.seats} ${t("People")}` });
    list.push({ icon: Car, label: t("Doors"), value: `${vehicle.doors}` });
    list.push({ icon: Gauge, label: t("Mileage"), value: `${Number(vehicle.mileage).toLocaleString()} km` });
    list.push({ icon: Palette, label: t("Color"), value: vehicle.color });
    list.push({ icon: Calendar, label: t("Year"), value: String(vehicle.year) });
    list.push({ icon: Box, label: t("Category"), value: vehicle.category });

    if (vehicle.hasGPS) list.push({ icon: MapPin, label: t("GPS"), value: t("Available") });
    if (vehicle.hasBluetooth) list.push({ icon: Bluetooth, label: t("Bluetooth"), value: t("Available") });
    if (vehicle.hasAppleCarPlay) list.push({ icon: Smartphone, label: "Apple CarPlay", value: t("Available") });
    if (vehicle.hasAndroidAuto) list.push({ icon: Wifi, label: "Android Auto", value: t("Available") });

    const acKeywords = ["air conditioning", "ac", "air condition", "climate"];
    if (featureSet.has("air conditioning") || featureSet.has("ac") || featureSet.has("climate control")) {
      list.push({ icon: Wind, label: t("Air Conditioning"), value: t("Available") });
    }

    return list;
  }, [vehicle, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 animate-pulse">
          <Skeleton className="h-5 w-28 mb-4 sm:mb-6 lg:mb-8" />
          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
            <div className="lg:col-span-3 space-y-6">
              <Skeleton className="aspect-[16/10] sm:aspect-[16/9] rounded-xl" />
              <Skeleton className="h-8 sm:h-10 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 sm:h-20 rounded-xl" />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 sm:h-8 w-20 sm:w-24 rounded-full" />
                ))}
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-2">
              <Skeleton className="h-[550px] rounded-xl sticky top-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle || error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Car className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t("Vehicle not found")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("The vehicle you are looking for does not exist.")}
          </p>
          <Button asChild>
            <Link href="/vehicles">{t("Browse Vehicles")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 sm:pb-32 lg:pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        <Button variant="ghost" size="sm" asChild className="mb-3 sm:mb-4 lg:mb-6 hover:bg-muted/80 transition-colors">
          <Link href="/vehicles" className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t("Back to fleet")}
          </Link>
        </Button>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Left Column: Gallery + Details */}
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            {/* Gallery */}
            <VehicleGallery
              images={vehicle.images}
              alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
            />

            {/* Hero Info (mobile + shared) */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[10px] sm:text-xs">{vehicle.category}</Badge>
                <Badge variant={vehicle.status === "AVAILABLE" ? "success" : "secondary"} className="text-[10px] sm:text-xs">
                  {vehicle.status}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                    {vehicle.brand} {vehicle.model}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-muted-foreground">
                    {vehicle.location && (
                      <span className="flex items-center gap-1 sm:gap-1.5">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {vehicle.location.city || vehicle.location.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1 sm:gap-1.5">
                      <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-400 text-amber-400" />
                      {averageRating > 0 ? averageRating.toFixed(1) : "—"}
                      <span>({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
                    </span>
                    <span className="text-base sm:text-lg font-semibold text-primary">
                      {formatCurrency(Number(vehicle.dailyRate))}
                      <span className="text-xs sm:text-sm text-muted-foreground font-normal">/{t("day")}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "rounded-full h-9 w-9 sm:h-10 sm:w-10 transition-all duration-200",
                      isFavorited && "border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800"
                    )}
                    onClick={() => setIsFavorited(!isFavorited)}
                    aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                        isFavorited ? "fill-red-500 text-red-500" : ""
                      )}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-9 w-9 sm:h-10 sm:w-10"
                    onClick={handleShare}
                    aria-label="Share vehicle"
                  >
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Description */}
            {vehicle.description && (
              <section className="space-y-2 sm:space-y-3">
                <p
                  className={cn(
                    "text-sm sm:text-base text-muted-foreground leading-relaxed",
                    !descExpanded && "line-clamp-3"
                  )}
                >
                  {vehicle.description}
                </p>
                {vehicle.description.length > 200 && (
                  <button
                    onClick={() => setDescExpanded(!descExpanded)}
                    className="flex items-center gap-1 text-xs sm:text-sm text-primary font-medium hover:underline"
                  >
                    {descExpanded ? (
                      <>Show less <ChevronUp className="h-3.5 w-3.5" /></>
                    ) : (
                      <>Read more <ChevronDown className="h-3.5 w-3.5" /></>
                    )}
                  </button>
                )}
              </section>
            )}

            {/* Calendar (mobile only - above specs) */}
            <section className="lg:hidden space-y-3 sm:space-y-4">
              <CalendarView
                vehicleId={vehicle.id}
                selectedStart={selectedStart}
                selectedEnd={selectedEnd}
                onSelectStart={setSelectedStart}
                onSelectEnd={setSelectedEnd}
              />
            </section>

            <Separator />

            {/* Specifications */}
            <section className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight flex items-center gap-2">
                <Gauge className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Specifications
              </h2>
              <SpecificationsGrid specs={specs} />
            </section>

            {vehicle.features && vehicle.features.length > 0 && (
              <>
                <Separator />
                <section className="space-y-3 sm:space-y-4">
                  <h2 className="text-lg sm:text-xl font-semibold tracking-tight flex items-center gap-2">
                    <Box className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Features & Amenities
                  </h2>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {vehicle.features.map((feature: string) => (
                      <Badge
                        key={feature}
                        variant="secondary"
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full border transition-all duration-200 hover:border-primary/30 hover:bg-primary/5"
                      >
                        {feature}
                      </Badge>
                    ))}
                    {vehicle.hasGPS && !vehicle.features.some((f: string) => f.toLowerCase().includes("gps")) && (
                      <Badge variant="secondary" className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full border">GPS</Badge>
                    )}
                    {vehicle.hasBluetooth && !vehicle.features.some((f: string) => f.toLowerCase().includes("bluetooth")) && (
                      <Badge variant="secondary" className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full border">Bluetooth</Badge>
                    )}
                    {vehicle.hasAppleCarPlay && (
                      <Badge variant="secondary" className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full border">Apple CarPlay</Badge>
                    )}
                    {vehicle.hasAndroidAuto && (
                      <Badge variant="secondary" className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full border">Android Auto</Badge>
                    )}
                  </div>
                </section>
              </>
            )}

            <Separator />

            {/* Reviews */}
            <ReviewsSection
              reviews={reviews}
              averageRating={averageRating}
              totalReviews={reviews.length}
            />
          </div>

          {/* Right Column: Calendar + Booking Card (desktop) */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="top-24 space-y-6">
              <CalendarView
                vehicleId={vehicle.id}
                selectedStart={selectedStart}
                selectedEnd={selectedEnd}
                onSelectStart={setSelectedStart}
                onSelectEnd={setSelectedEnd}
              />
              <BookingCard
                dailyRate={Number(vehicle.dailyRate)}
                depositAmount={Number(vehicle.depositAmount)}
                selectedStart={selectedStart}
                selectedEnd={selectedEnd}
                days={days}
                priceBreakdown={priceBreakdown}
                notes={notes}
                onNotesChange={setNotes}
                isAuthenticated={isAuthenticated}
                isBookingPending={bookingMutation.isPending}
                bookingError={bookingMutation.error?.message || null}
                onBook={handleBooking}
              />
            </div>
          </div>
        </div>

        {/* Related Vehicles - Full Width */}
        <div className="mt-6 sm:mt-8">
          <RelatedVehicles vehicles={relatedVehicles} />
        </div>
      </div>

      {/* Mobile Bottom CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-xl px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold">{formatCurrency(Number(vehicle.dailyRate))}</span>
              <span className="text-muted-foreground text-xs sm:text-sm">/{t("day")}</span>
            </div>
            {vehicle.location && (
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                {vehicle.location.city || vehicle.location.name}
              </div>
            )}
          </div>
          {selectedStart && selectedEnd && priceBreakdown && (
            <div className="text-right">
              <div className="text-[10px] sm:text-xs text-muted-foreground">{t("Total")}</div>
              <div className="font-bold text-base sm:text-lg">{formatCurrency(priceBreakdown.subtotal)}</div>
            </div>
          )}
        </div>
        <Button
          size="lg"
          className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg"
          disabled={!selectedStart || !selectedEnd || bookingMutation.isPending}
          onClick={handleBooking}
        >
          {bookingMutation.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> {t("Booking...")}</>
          ) : !isAuthenticated ? (
            <Link href="/login" className="w-full">{t("Sign in to Book")}</Link>
          ) : !selectedStart || !selectedEnd ? (
            t("Select dates from calendar")
          ) : (
            <span className="flex items-center gap-2">
              {t("Book Now")} — {formatCurrency(priceBreakdown!.subtotal)}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
