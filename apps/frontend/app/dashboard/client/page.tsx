"use client";

import Link from "next/link";
import { Car, CalendarDays, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function ClientDashboardPage() {
  const { t } = useTranslations();
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("Welcome, {name}", { name: user?.name || t("Guest") })}</h2>
        <p className="text-muted-foreground">{t("Manage your rentals and account")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              {t("Browse Vehicles")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{t("Find the perfect vehicle for your next trip")}</p>
            <Button asChild className="w-full">
              <Link href="/vehicles">{t("Browse Fleet")}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              {t("My Bookings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{t("View and manage your current and past bookings")}</p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/dashboard/client/bookings">{t("View Bookings")}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              {t("Reviews")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{t("Leave reviews for completed rentals")}</p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/dashboard/client/reviews">{t("My Reviews")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}