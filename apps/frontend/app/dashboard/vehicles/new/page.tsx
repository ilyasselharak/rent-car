"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/use-translations";

const fuelTypes = ["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID"];
const transmissions = ["MANUAL", "AUTOMATIC", "CVT", "SEMI_AUTOMATIC"];
const categories = ["Sedan", "SUV", "Luxury", "Sports", "Truck", "Van", "Convertible"];

export default function NewVehiclePage() {
  const { t } = useTranslations();
  const router = useRouter();
  const [form, setForm] = useState({
    brand: "", model: "", year: new Date().getFullYear(), vin: "", registrationNumber: "",
    fuelType: "GASOLINE", transmission: "AUTOMATIC", mileage: 0, seats: 5, doors: 4,
    color: "", category: "Sedan", dailyRate: 0, weeklyRate: 0, monthlyRate: 0,
    depositAmount: 0, description: "", agencyId: "", locationId: "",
  });
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");

  const { data: agencies } = useQuery({
    queryKey: ["agencies"],
    queryFn: () => api.get("/agencies"),
  });

  const agencyList = Array.isArray(agencies?.data) ? agencies.data : Array.isArray(agencies) ? agencies : [];

  const createMutation = useMutation({
    mutationFn: () => api.post("/vehicles", { ...form, features }),
    onSuccess: () => router.push("/dashboard/vehicles"),
  });

  const addFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/vehicles"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("Add Vehicle")}</h2>
          <p className="text-muted-foreground">{t("Add a new vehicle to your fleet")}</p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{t("Basic Information")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Brand")}</label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Model")}</label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Year")}</label>
                <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 2024 })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Color")}</label>
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("VIN")}</label>
                <Input value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Registration #")}</label>
                <Input value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Description")}</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-md border border-input bg-transparent text-sm resize-none" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("Specifications")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Category")}</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Fuel Type")}</label>
                <select value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm">
                  {fuelTypes.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Transmission")}</label>
                <select value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm">
                  {transmissions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Seats")}</label>
                <Input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: parseInt(e.target.value) || 5 })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Doors")}</label>
                <Input type="number" value={form.doors} onChange={(e) => setForm({ ...form, doors: parseInt(e.target.value) || 4 })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Mileage")}</label>
                <Input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: parseInt(e.target.value) || 0 })} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Features")}</label>
              <div className="flex gap-2">
                <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} placeholder={t("Add a feature...")} />
                <Button type="button" variant="outline" onClick={addFeature}><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {features.map((f) => (
                  <span key={f} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-secondary">
                    {f}
                    <button type="button" onClick={() => setFeatures(features.filter((x) => x !== f))}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("Pricing")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Daily Rate ($)")}</label>
                <Input type="number" step="0.01" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: parseFloat(e.target.value) || 0 })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Weekly Rate ($)")}</label>
                <Input type="number" step="0.01" value={form.weeklyRate} onChange={(e) => setForm({ ...form, weeklyRate: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Monthly Rate ($)")}</label>
                <Input type="number" step="0.01" value={form.monthlyRate} onChange={(e) => setForm({ ...form, monthlyRate: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Deposit ($)")}</label>
                <Input type="number" step="0.01" value={form.depositAmount} onChange={(e) => setForm({ ...form, depositAmount: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("Assignment")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Agency")}</label>
              <select value={form.agencyId} onChange={(e) => setForm({ ...form, agencyId: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm" required>
                <option value="">{t("Select agency...")}</option>
                {agencyList.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Location")}</label>
              <Input value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })} placeholder={t("Location ID")} />
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 flex justify-end gap-4">
          <Button type="button" variant="outline" asChild><Link href="/dashboard/vehicles">{t("Cancel")}</Link></Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Creating...")}</> : t("Create Vehicle")}
          </Button>
        </div>
      </form>

      {createMutation.isError && (
        <p className="text-destructive text-sm">{(createMutation.error as Error)?.message || t("Failed to create vehicle")}</p>
      )}
    </div>
  );
}
