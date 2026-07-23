"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { Vehicle } from "@/types";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function DashboardVehiclesPage() {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-vehicles", search, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status) params.append("status", status);
      params.append("limit", "50");
      return api.get(`/vehicles?${params.toString()}`);
    },
  });

  const vehicles = data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vehicles/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-vehicles"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("Vehicles")}</h2>
          <p className="text-muted-foreground">{t("Manage your fleet inventory")}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/vehicles/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("Add Vehicle")}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("Search vehicles...")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="">{t("All Statuses")}</option>
          <option value="AVAILABLE">{t("Available")}</option>
          <option value="RENTED">{t("Rented")}</option>
          <option value="MAINTENANCE">{t("Maintenance")}</option>
          <option value="RESERVED">{t("Reserved")}</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : vehicles.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <h3 className="text-lg font-medium mb-2">{t("No vehicles found")}</h3>
          <p className="text-muted-foreground">{t("Add your first vehicle to get started.")}</p>
          <Button asChild className="mt-4"><Link href="/dashboard/vehicles/new"><Plus className="mr-2 h-4 w-4" />{t("Add Vehicle")}</Link></Button>
        </CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle: Vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden group">
              <div className="relative aspect-[16/9] bg-muted">
                {vehicle.images[0] ? (
                  <Image src={vehicle.images[0]} alt={`${vehicle.brand} ${vehicle.model}`} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">{t("No Image")}</div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="icon" className="h-8 w-8" asChild>
                    <Link href={`/dashboard/vehicles/${vehicle.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                  </Button>
                  <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => { if (confirm(t("Delete this vehicle?"))) deleteMutation.mutate(vehicle.id); }} disabled={deleteMutation.isPending}>
                    {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{vehicle.brand} {vehicle.model}</h3>
                    <p className="text-sm text-muted-foreground">{vehicle.year} &middot; {vehicle.registrationNumber}</p>
                  </div>
                  <Badge variant={vehicle.status === "AVAILABLE" ? "default" : vehicle.status === "RENTED" ? "default" : "secondary"}>{vehicle.status}</Badge>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="text-sm text-muted-foreground">{vehicle.mileage.toLocaleString()} km</div>
                  <div className="font-semibold text-primary">{formatCurrency(Number(vehicle.dailyRate))}/day</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
