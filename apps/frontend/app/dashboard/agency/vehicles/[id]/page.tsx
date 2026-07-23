"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Car, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function VehicleDetailPage() {
  const { t } = useTranslations();
  const { id } = useParams();
  const router = useRouter();

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => api.get(`/vehicles/${id}`),
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-48 w-full" /></div>;
  if (!vehicle) return <p className="text-muted-foreground">{t("Vehicle not found")}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-2xl font-bold">{vehicle.brand} {vehicle.model}</h2>
            <p className="text-muted-foreground">{vehicle.year} &middot; {vehicle.registrationNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href={`/dashboard/agency/vehicles/${id}/edit`}><Edit className="mr-2 h-4 w-4" /> {t("Edit")}</Link></Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>{t("Details")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label={t("Brand")} value={vehicle.brand} />
            <Row label={t("Model")} value={vehicle.model} />
            <Row label={t("Year")} value={vehicle.year} />
            <Row label={t("VIN")} value={vehicle.vin} />
            <Row label={t("Registration")} value={vehicle.registrationNumber} />
            <Row label={t("Color")} value={vehicle.color} />
            <Row label={t("Category")} value={vehicle.category} />
            <Row label={t("Status")} value={vehicle.status?.replace(/_/g, " ")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("Specifications")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label={t("Fuel Type")} value={vehicle.fuelType?.replace(/_/g, " ")} />
            <Row label={t("Transmission")} value={vehicle.transmission?.replace(/_/g, " ")} />
            <Row label={t("Mileage")} value={`${vehicle.mileage?.toLocaleString()} km`} />
            <Row label={t("Seats")} value={vehicle.seats} />
            <Row label={t("Doors")} value={vehicle.doors} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("Pricing")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label={t("Daily Rate")} value={formatCurrency(vehicle.dailyRate)} />
            {vehicle.weeklyRate && <Row label={t("Weekly Rate")} value={formatCurrency(vehicle.weeklyRate)} />}
            {vehicle.monthlyRate && <Row label={t("Monthly Rate")} value={formatCurrency(vehicle.monthlyRate)} />}
            <Row label={t("Deposit")} value={formatCurrency(vehicle.depositAmount)} />
          </CardContent>
        </Card>
      </div>

      {vehicle.description && (
        <Card>
          <CardHeader><CardTitle>{t("Description")}</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">{vehicle.description}</p></CardContent>
        </Card>
      )}

      {vehicle.features?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>{t("Features")}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {vehicle.features.map((f: string) => <Badge key={f} variant="secondary">{f}</Badge>)}
            </div>
          </CardContent>
        </Card>
      )}

      {vehicle.location && (
        <Card>
          <CardHeader><CardTitle>{t("Location")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{vehicle.location.name} &middot; {vehicle.location.city}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}