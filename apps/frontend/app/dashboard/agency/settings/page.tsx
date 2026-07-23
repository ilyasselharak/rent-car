"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Settings as SettingsIcon, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function AgencySettingsPage() {
  const { t } = useTranslations();
  const [form, setForm] = useState({
    defaultCurrency: "USD",
    taxRate: 8,
    timezone: "America/New_York",
    gracePeriodMinutes: 60,
    lateReturnFeePerHour: 25,
    minRentalAge: 21,
    maxRentalAge: 80,
    minLicenseYears: 2,
    cancellationHoursBefore: 24,
    cancellationRefundPercent: 100,
    workingHoursOpen: "08:00",
    workingHoursClose: "20:00",
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.patch("/agencies/me/settings", data),
    onSuccess: () => toast.success(t("Settings saved")),
    onError: (err: ApiError) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      defaultCurrency: form.defaultCurrency,
      taxRate: form.taxRate / 100,
      timezone: form.timezone,
      gracePeriodMinutes: form.gracePeriodMinutes,
      lateReturnFeePerHour: form.lateReturnFeePerHour,
      minRentalAge: form.minRentalAge,
      maxRentalAge: form.maxRentalAge,
      minLicenseYears: form.minLicenseYears,
      cancellationPolicy: {
        hoursBefore: form.cancellationHoursBefore,
        refundPercent: form.cancellationRefundPercent,
      },
      workingHours: {
        open: form.workingHoursOpen,
        close: form.workingHoursClose,
        days: [1, 2, 3, 4, 5, 6],
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("Settings")}</h2>
        <p className="text-muted-foreground">{t("Configure your agency preferences")}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader><CardTitle>{t("General")}</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Field label={t("Default Currency")} value={form.defaultCurrency} onChange={(v: string) => setForm(f => ({ ...f, defaultCurrency: v }))} />
              <Field label={t("Tax Rate (%)")} type="number" value={form.taxRate} onChange={(v: string) => setForm(f => ({ ...f, taxRate: parseFloat(v) }))} />
              <Field label={t("Timezone")} value={form.timezone} onChange={(v: string) => setForm(f => ({ ...f, timezone: v }))} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("Working Hours")}</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Field label={t("Open Time")} value={form.workingHoursOpen} onChange={(v: string) => setForm(f => ({ ...f, workingHoursOpen: v }))} />
              <Field label={t("Close Time")} value={form.workingHoursClose} onChange={(v: string) => setForm(f => ({ ...f, workingHoursClose: v }))} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("Rental Policy")}</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Field label={t("Min Rental Age")} type="number" value={form.minRentalAge} onChange={(v: string) => setForm(f => ({ ...f, minRentalAge: parseInt(v) }))} />
              <Field label={t("Max Rental Age")} type="number" value={form.maxRentalAge} onChange={(v: string) => setForm(f => ({ ...f, maxRentalAge: parseInt(v) }))} />
              <Field label={t("Min License Years")} type="number" value={form.minLicenseYears} onChange={(v: string) => setForm(f => ({ ...f, minLicenseYears: parseInt(v) }))} />
              <Field label={t("Grace Period (min)")} type="number" value={form.gracePeriodMinutes} onChange={(v: string) => setForm(f => ({ ...f, gracePeriodMinutes: parseInt(v) }))} />
              <Field label={t("Late Fee ($/hr)")} type="number" value={form.lateReturnFeePerHour} onChange={(v: string) => setForm(f => ({ ...f, lateReturnFeePerHour: parseFloat(v) }))} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("Cancellation Policy")}</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Field label={t("Cancel Before (hours)")} type="number" value={form.cancellationHoursBefore} onChange={(v: string) => setForm(f => ({ ...f, cancellationHoursBefore: parseInt(v) }))} />
              <Field label={t("Refund %")} type="number" value={form.cancellationRefundPercent} onChange={(v: string) => setForm(f => ({ ...f, cancellationRefundPercent: parseInt(v) }))} />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("Save Settings")}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, type = "text", value, onChange }: { label: string; type?: string; value: string | number; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} />
    </div>
  );
}