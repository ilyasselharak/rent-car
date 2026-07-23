"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Car, CalendarDays, DollarSign, Star, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function AgencyDashboardPage() {
  const { t } = useTranslations();
  const { user } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["agency-dashboard"],
    queryFn: () => api.get("/dashboard/stats"),
    retry: false,
  });

  const summary = stats?.summary;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{user?.agencyProfile?.agencyName || t("Agency Dashboard")}</h2>
          <p className="text-muted-foreground">{t("Manage your fleet and bookings")}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/agency/vehicles/new">
            <PlusCircle className="mr-2 h-4 w-4" /> {t("Add Vehicle")}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("Total Vehicles")}</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{formatNumber(summary?.totalVehicles || 0)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("Active Bookings")}</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{formatNumber(summary?.activeBookings || 0)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("Revenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{formatCurrency(summary?.totalRevenue || 0)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("Avg. Rating")}</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{user?.agencyProfile?.rating?.toFixed(1) || "0.0"}</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("Quick Actions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/agency/vehicles"><Car className="mr-2 h-4 w-4" /> {t("Manage Vehicles")}</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/agency/bookings"><CalendarDays className="mr-2 h-4 w-4" /> {t("View Bookings")}</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/agency/analytics"><BarChart3Icon className="mr-2 h-4 w-4" /> {t("View Analytics")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BarChart3Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}