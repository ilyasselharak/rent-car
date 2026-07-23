"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Fuel,
  Users,
  Gauge,
  Palette,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";

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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {t("Availability Calendar")}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={prevMonth} disabled={!canGoPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {t(MONTHS[viewMonth - 1]!)} {viewYear}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} disabled={!canGoNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_NAMES.map((name) => (
                  <div key={name} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {t(name)}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {days.map((day: { date: string; available: boolean; status: string }) => {
                  const dayNum = new Date(day.date + 'T00:00:00').getDate();
                  const inRange = isInRange(day.date);
                  const selected = isSelected(day.date);
                  return (
                    <button
                      key={day.date}
                      onClick={() => handleDayClick(day)}
                      disabled={day.status !== 'available'}
                      className={cn(
                        "h-9 w-full rounded-md text-sm font-medium transition-colors relative",
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
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded bg-green-100 dark:bg-green-950 border border-green-300" />
                  <span>{t("Available")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded bg-red-100 dark:bg-red-950 border border-red-300" />
                  <span>{t("Booked")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded bg-amber-100 dark:bg-amber-950 border border-amber-300" />
                  <span>{t("Blocked")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded bg-muted" />
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

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => api.get(`/vehicles/${id}`),
  });

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

  const handleBooking = async () => {
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
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-video rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">{t("Vehicle not found")}</h1>
        <p className="text-muted-foreground mb-6">
          {t("The vehicle you are looking for does not exist.")}
        </p>
        <Button asChild>
          <Link href="/vehicles">{t("Browse Vehicles")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/vehicles">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("Back to fleet")}
        </Link>
      </Button>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
            {vehicle.images[0] ? (
              <Image
                src={vehicle.images[0]}
                alt={`${vehicle.brand} ${vehicle.model}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                {t("No Image Available")}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{vehicle.category}</Badge>
                <Badge variant={vehicle.status === "AVAILABLE" ? "success" : "secondary"}>
                  {vehicle.status}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="text-muted-foreground">{vehicle.year}</p>
            </div>

            <p className="text-muted-foreground">{vehicle.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Fuel className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t("Fuel Type")}</div>
                    <div className="font-medium">{vehicle.fuelType}</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Gauge className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t("Transmission")}</div>
                    <div className="font-medium">{vehicle.transmission}</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t("Seats")}</div>
                    <div className="font-medium">{vehicle.seats} {t("People")}</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Palette className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t("Color")}</div>
                    <div className="font-medium">{vehicle.color}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap gap-2">
              {vehicle.features.map((feature: string) => (
                <Badge key={feature} variant="secondary">{feature}</Badge>
              ))}
            </div>

            {vehicle.hasGPS && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{t("GPS Tracking Available")}</span>
              </div>
            )}

            <Separator />

            <CalendarView
              vehicleId={vehicle.id}
              selectedStart={selectedStart}
              selectedEnd={selectedEnd}
              onSelectStart={setSelectedStart}
              onSelectEnd={setSelectedEnd}
            />
          </div>
        </div>

        {/* Right: Booking Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>{t("Book This Vehicle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("Rental Period")}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <div className="text-xs text-muted-foreground">{t("Pick-up")}</div>
                    <div className="font-medium text-sm">
                      {selectedStart
                        ? selectedStart.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : t("Select date")}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <div className="text-xs text-muted-foreground">{t("Return")}</div>
                    <div className="font-medium text-sm">
                      {selectedEnd
                        ? selectedEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : t("Select date")}
                    </div>
                  </div>
                </div>
              </div>

              {selectedStart && selectedEnd && priceBreakdown && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {priceBreakdown.days} {priceBreakdown.days === 1 ? t("day") : t("days")}
                      </span>
                      <span>{formatCurrency(priceBreakdown.subtotal)}</span>
                    </div>
                    {priceBreakdown.weekly && priceBreakdown.days >= 7 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>{t("Weekly discount applied")}</span>
                        <span>✓</span>
                      </div>
                    )}
                    {priceBreakdown.monthly && priceBreakdown.days >= 30 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>{t("Monthly discount applied")}</span>
                        <span>✓</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>{t("Total")}</span>
                      <span>{formatCurrency(priceBreakdown.subtotal)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("Deposit")}: {formatCurrency(Number(vehicle.depositAmount))}
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">{t("Special Requests (optional)")}</Label>
                <Input
                  id="notes"
                  placeholder={t("Any special requirements...")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={!selectedStart || !selectedEnd || bookingMutation.isPending}
                onClick={handleBooking}
              >
                {bookingMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Booking...")}</>
                ) : !user ? (
                  <Link href="/login" className="w-full">{t("Sign in to Book")}</Link>
                ) : !selectedStart || !selectedEnd ? (
                  t("Select dates from calendar")
                ) : (
                  <>{t("Book Now")} - {priceBreakdown ? formatCurrency(priceBreakdown.subtotal) : ""}</>
                )}
              </Button>

              {bookingMutation.isError && (
                <p className="text-sm text-destructive">
                  {bookingMutation.error?.message || t("Failed to create booking")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
