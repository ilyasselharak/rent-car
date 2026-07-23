"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function AgencyEarningsPage() {
  const { t } = useTranslations();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["agency-dashboard"],
    queryFn: () => api.get("/dashboard/stats"),
    retry: false,
  });

  const summary = dashboard?.summary;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("Earnings")}</h2>
        <p className="text-muted-foreground">{t("Revenue overview")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("Total Revenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-24" /> : (
              <p className="text-2xl font-bold">{formatCurrency(summary?.totalRevenue || 0)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("Active Bookings")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-12" /> : (
              <p className="text-2xl font-bold">{summary?.activeBookings || 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("Completed")}</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-12" /> : (
              <p className="text-2xl font-bold">{summary?.completedBookings || 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("Total Bookings")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-12" /> : (
              <p className="text-2xl font-bold">{summary?.totalBookings || 0}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}