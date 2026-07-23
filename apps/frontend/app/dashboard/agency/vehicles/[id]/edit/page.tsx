"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/image-upload";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/use-translations";

const FUEL_TYPES = ["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID", "PLUGIN_HYBRID", "HYDROGEN"];
const TRANSMISSIONS = ["MANUAL", "AUTOMATIC", "CVT", "SEMI_AUTOMATIC"];

export default function EditVehiclePage() {
  const { t } = useTranslations();
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState<any>(null);

  const { data: vehicle, isLoading: loadingVehicle } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => api.get(`/vehicles/${id}`),
  });

  useEffect(() => {
    if (vehicle) {
      setForm({
        brand: vehicle.brand || "", model: vehicle.model || "", year: vehicle.year || new Date().getFullYear(),
        vin: vehicle.vin || "", registrationNumber: vehicle.registrationNumber || "",
        fuelType: vehicle.fuelType || "GASOLINE", transmission: vehicle.transmission || "AUTOMATIC",
        mileage: vehicle.mileage || 0, seats: vehicle.seats || 5, doors: vehicle.doors || 4,
        color: vehicle.color || "", category: vehicle.category || "Sedan",
        dailyRate: vehicle.dailyRate || 0, weeklyRate: vehicle.weeklyRate || 0,
        monthlyRate: vehicle.monthlyRate || 0, depositAmount: vehicle.depositAmount || 0,
        description: vehicle.description || "",
        features: (vehicle.features || []).join(", "),
        images: vehicle.images || [],
      });
    }
  }, [vehicle]);

  const mutation = useMutation({
    mutationFn: (data: any) => api.patch(`/vehicles/${id}`, data),
    onSuccess: () => {
      toast.success(t("Vehicle updated"));
      router.push(`/dashboard/agency/vehicles/${id}`);
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    mutation.mutate({
      ...form,
      features: typeof form.features === "string" ? form.features.split(",").map((s: string) => s.trim()).filter(Boolean) : form.features || [],
      weeklyRate: form.weeklyRate || undefined,
      monthlyRate: form.monthlyRate || undefined,
      depositAmount: form.depositAmount || undefined,
    });
  };

  const update = (field: string, value: any) => setForm((f: any) => ({ ...f, [field]: value }));

  if (loadingVehicle || !form) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-bold">{t("Edit Vehicle")}</h2>
          <p className="text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader><CardTitle>{t("Basic Information")}</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <Field label={t("Brand")} id="brand" value={form.brand} onChange={v => update("brand", v)} required />
              <Field label={t("Model")} id="model" value={form.model} onChange={v => update("model", v)} required />
              <Field label={t("Year")} id="year" type="number" value={form.year} onChange={v => update("year", parseInt(v))} required />
              <Field label={t("VIN")} id="vin" value={form.vin} onChange={v => update("vin", v)} required />
              <Field label={t("Registration")} id="registrationNumber" value={form.registrationNumber} onChange={v => update("registrationNumber", v)} required />
              <Field label={t("Color")} id="color" value={form.color} onChange={v => update("color", v)} required />
              <Field label={t("Category")} id="category" value={form.category} onChange={v => update("category", v)} required />
              <SelectField label={t("Fuel Type")} id="fuelType" value={form.fuelType} onChange={v => update("fuelType", v)} options={FUEL_TYPES} />
              <SelectField label={t("Transmission")} id="transmission" value={form.transmission} onChange={v => update("transmission", v)} options={TRANSMISSIONS} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("Specifications")}</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <Field label={t("Mileage (km)")} id="mileage" type="number" value={form.mileage} onChange={v => update("mileage", parseInt(v))} required />
              <Field label={t("Seats")} id="seats" type="number" value={form.seats} onChange={v => update("seats", parseInt(v))} required />
              <Field label={t("Doors")} id="doors" type="number" value={form.doors} onChange={v => update("doors", parseInt(v))} required />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("Pricing")}</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-4 gap-4">
              <Field label={t("Daily Rate ($)")} id="dailyRate" type="number" step="0.01" value={form.dailyRate} onChange={v => update("dailyRate", parseFloat(v))} required />
              <Field label={t("Weekly Rate ($)")} id="weeklyRate" type="number" step="0.01" value={form.weeklyRate} onChange={v => update("weeklyRate", parseFloat(v))} />
              <Field label={t("Monthly Rate ($)")} id="monthlyRate" type="number" step="0.01" value={form.monthlyRate} onChange={v => update("monthlyRate", parseFloat(v))} />
              <Field label={t("Deposit ($)")} id="depositAmount" type="number" step="0.01" value={form.depositAmount} onChange={v => update("depositAmount", parseFloat(v))} />
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
              <Field label={t("Features (comma-separated)")} id="features" value={form.features} onChange={v => update("features", v)} />
              <div className="space-y-2">
                <Label>{t("Vehicle Images")}</Label>
                <ImageUpload value={form.images} onChange={(urls: string[]) => update("images", urls)} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => router.back()}>{t("Cancel")}</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("Save Changes")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, id, type = "text", step, value, onChange, required }: { label: string; id: string; type?: string; step?: string; value: string | number; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} step={step} required={required} value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({ label, id, value, onChange, options }: { label: string; id: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select id={id} required value={value} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
        {options.map((o: string) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
      </select>
    </div>
  );
}