"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, DollarSign, Users, Car, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function AgencyAnalyticsPage() {
  const { t } = useTranslations();

  const { data: revenue, isLoading: loading1 } = useQuery({
    queryKey: ["analytics-revenue"],
    queryFn: () => api.get("/analytics/revenue"),
    retry: false,
  });

  const { data: customers, isLoading: loading2 } = useQuery({
    queryKey: ["analytics-customers"],
    queryFn: () => api.get("/analytics/customers"),
    retry: false,
  });

  const { data: vehicles, isLoading: loading3 } = useQuery({
    queryKey: ["analytics-vehicles"],
    queryFn: () => api.get("/analytics/vehicles"),
    retry: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("Analytics")}</h2>
        <p className="text-muted-foreground">{t("Performance metrics and insights")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title={t("Total Revenue")} value={formatCurrency(revenue?.totalRevenue || 0)} icon={DollarSign}
          trend={revenue?.trend} loading={loading1} />
        <MetricCard title={t("Total Customers")} value={formatNumber(customers?.totalCustomers || 0)} icon={Users}
          trend={null} loading={loading2} />
        <MetricCard title={t("Active Vehicles")} value={formatNumber(vehicles?.activeVehicles || 0)} icon={Car}
          trend={null} loading={loading3} />
        <MetricCard title={t("Avg. Revenue/Vehicle")} value={formatCurrency(vehicles?.avgRevenuePerVehicle || 0)} icon={BarChart3}
          trend={null} loading={loading3} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t("Monthly Revenue")}</CardTitle></CardHeader>
          <CardContent>
            {loading1 ? <Skeleton className="h-48 w-full" /> : (
              <div className="space-y-3">
                {(revenue?.monthly || []).map((m: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{m.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((m.amount / (revenue?.maxMonthly || 1)) * 100, 100)}%`, maxWidth: "200px" }} />
                      <span className="text-sm font-medium w-20 text-right">{formatCurrency(m.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("Top Vehicles")}</CardTitle></CardHeader>
          <CardContent>
            {loading3 ? <Skeleton className="h-48 w-full" /> : (
              <div className="space-y-3">
                {(vehicles?.topVehicles || []).map((v: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{v.brand} {v.model}</span>
                    <span className="text-sm font-medium">{v.bookingCount} bookings</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, loading }: any) {
  const { t } = useTranslations();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-20" /> : (
          <>
            <p className="text-2xl font-bold">{value}</p>
            {trend !== null && trend !== undefined && (
              <p className={`flex items-center text-xs mt-1 ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {t("{value}% vs last period", { value: Math.abs(trend).toFixed(1) })}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}