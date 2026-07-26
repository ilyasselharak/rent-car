"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Car, CalendarDays, DollarSign, Star, PlusCircle, Clock, CheckCircle2, XCircle, Ban, Fuel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const s = stats?.summary;

  const bookingStatuses = [
    { label: "Pending", value: s?.pendingBookings, icon: Clock, color: "text-amber-600", badge: "warning" as const },
    { label: "Confirmed", value: s?.confirmedBookings, icon: CheckCircle2, color: "text-blue-600", badge: "default" as const },
    { label: "Active", value: s?.activeBookings, icon: CalendarDays, color: "text-emerald-600", badge: "success" as const },
    { label: "Completed", value: s?.totalBookings ? Math.round((s?.completionRate || 0) * (s?.totalBookings || 0) / 100) : 0, icon: Ban, color: "text-gray-600", badge: "secondary" as const },
    { label: "Cancelled", value: s?.totalBookings ? Math.round((s?.cancellationRate || 0) * (s?.totalBookings || 0) / 100) : 0, icon: XCircle, color: "text-red-600", badge: "destructive" as const },
  ];

  const completedCount = s?.totalBookings ? Math.round((s?.completionRate || 0) * (s?.totalBookings || 0) / 100) : 0;
  const cancelledCount = s?.totalBookings ? Math.round((s?.cancellationRate || 0) * (s?.totalBookings || 0) / 100) : 0;

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
            {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{formatNumber(s?.totalVehicles || 0)}</p>}
            {!isLoading && <p className="text-xs text-muted-foreground mt-1">{formatNumber(s?.availableVehicles || 0)} available &middot; {formatNumber(s?.rentedVehicles || 0)} rented</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("Total Bookings")}</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{formatNumber(s?.totalBookings || 0)}</p>}
            {!isLoading && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatNumber(s?.pendingBookings || 0)} pending &middot; {formatNumber(s?.confirmedBookings || 0)} confirmed
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("Revenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{formatCurrency(s?.totalRevenue || 0)}</p>}
            {!isLoading && <p className="text-xs text-muted-foreground mt-1">{formatCurrency(s?.todayRevenue || 0)} today</p>}
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

      <div>
        <h3 className="text-lg font-semibold mb-3">{t("Booking Status")}</h3>
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{formatNumber(s?.pendingBookings || 0)}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{formatNumber(s?.confirmedBookings || 0)}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              <CalendarDays className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{formatNumber(s?.activeBookings || 0)}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{formatNumber(completedCount)}</p>}
              {!isLoading && <p className="text-xs text-muted-foreground mt-1">{s?.completionRate || 0}% rate</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{formatNumber(cancelledCount)}</p>}
              {!isLoading && <p className="text-xs text-muted-foreground mt-1">{s?.cancellationRate || 0}% rate</p>}
            </CardContent>
          </Card>
        </div>
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
        <Card>
          <CardHeader>
            <CardTitle>{t("Fleet Overview")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s?.totalVehicles ? ((s?.availableVehicles || 0) / s?.totalVehicles) * 100 : 0}%` }} />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{formatNumber(s?.availableVehicles || 0)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Rented</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s?.totalVehicles ? ((s?.rentedVehicles || 0) / s?.totalVehicles) * 100 : 0}%` }} />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{formatNumber(s?.rentedVehicles || 0)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">Occupancy Rate</span>
                  <span className="text-sm font-bold">{s?.occupancyRate || 0}%</span>
                </div>
              </>
            )}
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
