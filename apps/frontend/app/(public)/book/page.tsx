"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CalendarDays, Fuel, Users, Gauge, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/use-translations";

function calculateDays(start: Date, end: Date): number {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function BookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("vehicle");
  const { isAuthenticated, user } = useAuthStore();
  const { t } = useTranslations();

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");
  const [notes, setNotes] = useState("");

  const { data: vehicle, isLoading: vehicleLoading } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => api.get(`/vehicles/${vehicleId}`),
    enabled: !!vehicleId,
  });

  const { data: profile } = useQuery({
    queryKey: ["my-customer-profile"],
    queryFn: () => api.get(`/customers/me`),
    enabled: isAuthenticated,
  });

  const today = new Date().toISOString().split("T")[0];
  const startDate = pickupDate ? new Date(`${pickupDate}T${pickupTime}`) : null;
  const endDate = returnDate ? new Date(`${returnDate}T${returnTime}`) : null;
  const days = startDate && endDate ? calculateDays(startDate, endDate) : 0;
  const isValidDates = startDate && endDate && endDate > startDate;

  const dailyRate = vehicle ? Number(vehicle.dailyRate) : 0;
  const weeklyRate = vehicle ? Number(vehicle.weeklyRate) : null;
  const monthlyRate = vehicle ? Number(vehicle.monthlyRate) : null;

  let subtotal = 0;
  if (isValidDates && dailyRate > 0) {
    const weeklyDiscount = weeklyRate ? weeklyRate / 7 : dailyRate;
    const monthlyDiscount = monthlyRate ? monthlyRate / 30 : dailyRate;
    if (days >= 30) {
      subtotal = Math.round(monthlyRate! * Math.ceil(days / 30) * 100) / 100;
    } else if (days >= 7) {
      subtotal = Math.round(weeklyRate! * (days / 7) * 100) / 100;
    } else {
      subtotal = Math.round(dailyRate * days * 100) / 100;
    }
  }

  const depositAmount = vehicle ? Number(vehicle.depositAmount) : 0;
  const taxRate = 0.08;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const finalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!vehicle || !startDate || !endDate || !profile) throw new Error("Missing data");
      return api.post("/bookings", {
        vehicleId: vehicle.id,
        customerId: profile.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        pickupLocationId: vehicle.locationId || "main-location",
        returnLocationId: vehicle.locationId || "main-location",
        agencyId: vehicle.agencyId,
        notes: notes || undefined,
      });
    },
    onSuccess: (data: any) => {
      router.push(`/book/confirmation?id=${data.id}`);
    },
  });

  if (!vehicleId) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">{t("No vehicle selected")}</h1>
        <p className="text-muted-foreground mb-6">{t("Please select a vehicle to book.")}</p>
        <Button asChild><Link href="/vehicles">{t("Browse Vehicles")}</Link></Button>
      </div>
    );
  }

  if (vehicleLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">{t("Vehicle not found")}</h1>
        <Button asChild><Link href="/vehicles">{t("Browse Vehicles")}</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href={`/vehicles/${vehicle.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("Back to vehicle")}
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight mb-8">{t("Book a Vehicle")}</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="relative w-32 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {vehicle.images[0] ? (
                    <Image src={vehicle.images[0]} alt={`${vehicle.brand} ${vehicle.model}`} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{t("No Image")}</div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{vehicle.brand} {vehicle.model}</h2>
                  <p className="text-muted-foreground">{vehicle.year} &middot; {vehicle.category}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" />{vehicle.fuelType}</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{vehicle.seats} {t("seats")}</span>
                    <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />{vehicle.transmission}</span>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-2xl font-bold text-primary">{formatCurrency(dailyRate)}</div>
                  <div className="text-xs text-muted-foreground">{t("/day")}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
              <h3 className="font-semibold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                {t("Rental Period")}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("Pickup Date")}</label>
                  <input
                    type="date"
                    value={pickupDate}
                    min={today}
                    onChange={(e) => {
                      setPickupDate(e.target.value);
                      if (returnDate && e.target.value >= returnDate) setReturnDate("");
                    }}
                    className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("Pickup Time")}</label>
                  <select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm">
                    {["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("Return Date")}</label>
                  <input
                    type="date"
                    value={returnDate}
                    min={pickupDate || today}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("Return Time")}</label>
                  <select value={returnTime} onChange={(e) => setReturnTime(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm">
                    {["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {isValidDates && (
                <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("Pickup")}</span>
                    <span className="font-medium">{formatDate(startDate)} {t("at")} {pickupTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("Return")}</span>
                    <span className="font-medium">{formatDate(endDate)} {t("at")} {returnTime}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t">
                    <span className="text-muted-foreground">{t("Duration")}</span>
                    <span className="font-medium">{days} {days === 1 ? t("day") : t("days")}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">{t("Additional Notes")}</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or requirements..."
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent text-sm resize-none"
              />
            </CardContent>
          </Card>

          {!isAuthenticated && (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">{t("You need to sign in to complete your booking.")}</p>
                <Button asChild><Link href={`/login?redirect=/book?vehicle=${vehicleId}`}>{t("Sign In")}</Link></Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">{t("Booking Summary")}</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("Daily Rate")}</span>
                  <span>{formatCurrency(dailyRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("Duration")}</span>
                  <span>{days > 0 ? `${days} ${days === 1 ? t("day") : t("days")}` : "-"}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>{t("Subtotal")}</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("Tax")} (8%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("Deposit")}</span>
                  <span>{formatCurrency(depositAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t text-lg font-bold">
                  <span>{t("Total")}</span>
                  <span className="text-primary">{formatCurrency(finalAmount)}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={!isValidDates || !isAuthenticated || bookingMutation.isPending || days < 1}
                onClick={() => bookingMutation.mutate()}
              >
                {bookingMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Processing...")}</>
                ) : (
                  t("Confirm Booking")
                )}
              </Button>

              {bookingMutation.isError && (
                <p className="text-sm text-destructive">{(bookingMutation.error as Error)?.message || t("Booking failed. Please try again.")}</p>
              )}

              {!isValidDates && pickupDate && (
                <p className="text-xs text-muted-foreground">{t("Please select a valid return date after the pickup date.")}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
