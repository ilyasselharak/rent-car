"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/image-upload";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/use-translations";

const FUEL_TYPES = ["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID", "PLUGIN_HYBRID", "HYDROGEN"];
const TRANSMISSIONS = ["MANUAL", "AUTOMATIC", "CVT", "SEMI_AUTOMATIC"];

export default function NewVehiclePage() {
  const { t } = useTranslations();
  const router = useRouter();
  const [form, setForm] = useState({
    brand: "", model: "", year: new Date().getFullYear(), vin: "",
    registrationNumber: "", fuelType: "GASOLINE", transmission: "AUTOMATIC",
    mileage: 0, seats: 5, doors: 4, color: "", category: "Sedan",
    dailyRate: 0, weeklyRate: 0, monthlyRate: 0, depositAmount: 0,
    description: "", features: "", images: [] as string[],
  });

  const { data: locations } = useQuery({
    queryKey: ["agency-locations"],
    queryFn: () => api.get("/agencies/me/locations"),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/vehicles", data),
    onSuccess: () => {
      toast.success(t("Vehicle created successfully"));
      router.push("/dashboard/agency/vehicles");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      features: form.features ? form.features.split(",").map(s => s.trim()).filter(Boolean) : [],
      weeklyRate: form.weeklyRate || undefined,
      monthlyRate: form.monthlyRate || undefined,
      depositAmount: form.depositAmount || undefined,
    });
  };

  const update = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{t("Add Vehicle")}</h2>
          <p className="text-muted-foreground">{t("Add a new vehicle to your fleet")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader><CardTitle>{t("Basic Information")}</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">{t("Brand")} *</Label>
                <Input id="brand" required value={form.brand} onChange={e => update("brand", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">{t("Model")} *</Label>
                <Input id="model" required value={form.model} onChange={e => update("model", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">{t("Year")} *</Label>
                <Input id="year" type="number" required value={form.year} onChange={e => update("year", parseInt(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">{t("VIN")} *</Label>
                <Input id="vin" required value={form.vin} onChange={e => update("vin", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">{t("Registration")} *</Label>
                <Input id="registrationNumber" required value={form.registrationNumber} onChange={e => update("registrationNumber", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">{t("Color")} *</Label>
                <Input id="color" required value={form.color} onChange={e => update("color", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t("Category")} *</Label>
                <Input id="category" required value={form.category} onChange={e => update("category", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuelType">{t("Fuel Type")} *</Label>
                <select id="fuelType" required value={form.fuelType} onChange={e => update("fuelType", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                  {FUEL_TYPES.map(ft => <option key={ft} value={ft}>{ft.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">{t("Transmission")} *</Label>
                <select id="transmission" required value={form.transmission} onChange={e => update("transmission", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                  {TRANSMISSIONS.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("Specifications")}</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mileage">{t("Mileage (km)")} *</Label>
                <Input id="mileage" type="number" required value={form.mileage} onChange={e => update("mileage", parseInt(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seats">{t("Seats")} *</Label>
                <Input id="seats" type="number" required value={form.seats} onChange={e => update("seats", parseInt(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doors">{t("Doors")} *</Label>
                <Input id="doors" type="number" required value={form.doors} onChange={e => update("doors", parseInt(e.target.value))} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("Pricing")}</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyRate">{t("Daily Rate ($)")} *</Label>
                <Input id="dailyRate" type="number" step="0.01" required value={form.dailyRate} onChange={e => update("dailyRate", parseFloat(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyRate">{t("Weekly Rate ($)")}</Label>
                <Input id="weeklyRate" type="number" step="0.01" value={form.weeklyRate} onChange={e => update("weeklyRate", parseFloat(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyRate">{t("Monthly Rate ($)")}</Label>
                <Input id="monthlyRate" type="number" step="0.01" value={form.monthlyRate} onChange={e => update("monthlyRate", parseFloat(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depositAmount">{t("Deposit ($)")}</Label>
                <Input id="depositAmount" type="number" step="0.01" value={form.depositAmount} onChange={e => update("depositAmount", parseFloat(e.target.value))} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("Additional Details")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">{t("Description")}</Label>
                <textarea id="description" value={form.description} onChange={e => update("description", e.target.value)}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm min-h-[100px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">{t("Features (comma-separated)")}</Label>
                <Input id="features" value={form.features} onChange={e => update("features", e.target.value)} placeholder={t("GPS, Bluetooth, Apple CarPlay")} />
              </div>
              <div className="space-y-2">
                <Label>{t("Vehicle Images")}</Label>
                <ImageUpload value={form.images} onChange={(urls) => update("images", urls)} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => router.back()}>{t("Cancel")}</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("Create Vehicle")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}