"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function AgencyProfilePage() {
  const { t } = useTranslations();
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    agencyName: "", ownerName: "", phone: "", city: "", address: "",
    description: "", businessRegNumber: "", taxId: "",
    logo: "",
  });

  const { refetch: refetchUser } = useQuery({
    queryKey: ["auth-me"],
    queryFn: () => api.get("/auth/me"),
    enabled: false,
  });

  const profile = user?.agencyProfile as Record<string, any> | null;

  useEffect(() => {
    if (profile) {
      setForm({
        agencyName: profile.agencyName || "",
        ownerName: profile.ownerName || "",
        phone: profile.phone || "",
        city: profile.city || "",
        address: profile.address || "",
        description: profile.description || "",
        businessRegNumber: profile.businessRegNumber || "",
        taxId: profile.taxId || "",
        logo: profile.logo || "",
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: (data: any) => api.patch("/agencies/me", data),
    onSuccess: () => {
      toast.success(t("Profile updated"));
      refetchUser();
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (!profile) return <Skeleton className="h-64 w-full" />;

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("Agency Profile")}</h2>
        <p className="text-muted-foreground">{t("Manage your agency information")}</p>
      </div>

      <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="text-lg font-semibold">{profile.agencyName}</p>
          <p className="text-sm text-muted-foreground">
            {profile.verified ? t("Verified: Yes") : t("Verified: No")} &middot; {t("Rating: {value}", { value: Number(profile.rating || 0).toFixed(1) })}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>{t("General Information")}</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <Field label={t("Agency Name")} value={form.agencyName} onChange={(v: string) => update("agencyName", v)} />
            <Field label={t("Owner Name")} value={form.ownerName} onChange={(v: string) => update("ownerName", v)} />
            <Field label={t("Phone")} value={form.phone} onChange={(v: string) => update("phone", v)} />
            <Field label={t("City")} value={form.city} onChange={(v: string) => update("city", v)} />
            <Field label={t("Address")} value={form.address} onChange={(v: string) => update("address", v)} className="md:col-span-2" />
            <Field label={t("Business Reg. Number")} value={form.businessRegNumber} onChange={(v: string) => update("businessRegNumber", v)} />
            <Field label={t("Tax ID")} value={form.taxId} onChange={(v: string) => update("taxId", v)} />
            <div className="md:col-span-2 space-y-2">
              <Label>{t("Description")}</Label>
              <textarea value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update("description", e.target.value)}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm min-h-[100px]" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("Save Changes")}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, className }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={`space-y-2 ${className || ""}`}>
      <Label>{label}</Label>
      <Input value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} />
    </div>
  );
}