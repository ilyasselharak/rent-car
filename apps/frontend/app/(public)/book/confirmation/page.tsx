"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function BookingConfirmationPage() {
  const { t } = useTranslations();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => api.get(`/bookings/${bookingId}`),
    enabled: !!bookingId,
  });

  if (!bookingId) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">{t("Invalid booking")}</h1>
        <Button asChild><Link href="/vehicles">{t("Browse Vehicles")}</Link></Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-20">
        <Skeleton className="h-64 rounded-xl max-w-lg mx-auto" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">{t("Booking not found")}</h1>
        <Button asChild><Link href="/vehicles">{t("Browse Vehicles")}</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-20">
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100  flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 " />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("Booking Confirmed!")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("Your booking has been successfully created.")}
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("Booking #")}</span>
              <span className="font-medium">{booking.bookingNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("Vehicle")}</span>
              <span className="font-medium">{booking.vehicle?.brand} {booking.vehicle?.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("Pickup")}</span>
              <span className="font-medium">{formatDate(booking.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("Return")}</span>
              <span className="font-medium">{formatDate(booking.endDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("Status")}</span>
              <span className="font-medium capitalize">{booking.status?.toLowerCase()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground">{t("Total")}</span>
              <span className="font-bold text-primary">{formatCurrency(Number(booking.finalAmount))}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/dashboard">{t("Go to Dashboard")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/vehicles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("Browse More Vehicles")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
