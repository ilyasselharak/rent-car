"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, Car, CalendarDays, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api.get("/admin/dashboard"),
    retry: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage your platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{formatNumber(stats?.users?.total || 0)}</p>}
            {!isLoading && (
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-emerald-500">{formatNumber(stats?.users?.agencies || 0)}</span> agencies &middot;
                <span className="text-blue-500"> {formatNumber(stats?.users?.admins || 0)}</span> admins
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{formatNumber(stats?.vehicles?.total || 0)}</p>}
            {!isLoading && (
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-emerald-500">{formatNumber(stats?.vehicles?.available || 0)}</span> available &middot;
                <span className="text-blue-500">{formatNumber(stats?.vehicles?.rented || 0)}</span> rented
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bookings</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{formatNumber(stats?.bookings?.total || 0)}</p>}
            {!isLoading && (
              <p className="text-xs text-muted-foreground mt-1">
                <Badge variant="success" className="text-[10px] px-1.5 py-0">{formatNumber(stats?.bookings?.active || 0)} active</Badge>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">{formatNumber(stats?.bookings?.completed || 0)} completed</Badge>
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{formatCurrency(stats?.revenue?.total || 0)}</p>}
            {!isLoading && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(stats?.revenue?.today || 0)} today
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
