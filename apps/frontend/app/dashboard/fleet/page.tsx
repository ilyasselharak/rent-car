"use client";

import { useQuery } from "@tanstack/react-query";
import { Wrench, AlertTriangle, CheckCircle, Clock, Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function DashboardFleetPage() {
  const { t } = useTranslations();

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["fleet-overview"],
    queryFn: () => api.get("/fleet/overview"),
  });

  const { data: maintenance, isLoading: maintenanceLoading } = useQuery({
    queryKey: ["fleet-maintenance"],
    queryFn: () => api.get("/fleet/maintenance?upcoming=true"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("Fleet Management")}</h2>
        <p className="text-muted-foreground">{t("Monitor maintenance and vehicle health")}</p>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {overviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("Total Vehicles")}</p>
                    <p className="text-2xl font-bold">{overview?.totalVehicles || 0}</p>
                  </div>
                  <Car className="h-8 w-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("Available")}</p>
                    <p className="text-2xl font-bold text-emerald-500">
                      {overview?.statusBreakdown?.AVAILABLE || 0}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-500/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("Upcoming Maintenance")}</p>
                    <p className="text-2xl font-bold text-amber-500">
                      {overview?.upcomingMaintenance || 0}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-500/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("Active Damages")}</p>
                    <p className="text-2xl font-bold text-red-500">
                      {overview?.activeDamageReports || 0}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500/50" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Upcoming Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {t("Upcoming Maintenance")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {maintenanceLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : maintenance?.data?.length ? (
            <div className="space-y-3">
              {maintenance.data.map((record: { id: string; type: string; scheduledDate: string; description: string; vehicle: { brand: string; model: string; registrationNumber: string }; status: string }) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {record.vehicle.brand} {record.vehicle.model}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {record.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{record.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(record.scheduledDate).toLocaleDateString()}
                    </p>
                    <Badge
                      variant={
                        record.status === "SCHEDULED"
                          ? "warning"
                          : record.status === "IN_PROGRESS"
                          ? "default"
                          : "success"
                      }
                      className="text-xs"
                    >
                      {record.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">{t("No upcoming maintenance")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
