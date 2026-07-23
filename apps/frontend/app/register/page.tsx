"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, Building2, User, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function RegisterPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [step, setStep] = useState<"select" | "form">("select");
  const [role, setRole] = useState<"CLIENT" | "AGENCY" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    agencyName: "",
    ownerName: "",
    city: "",
    address: "",
    businessRegNumber: "",
    taxId: "",
  });

  const selectRole = (r: "CLIENT" | "AGENCY") => {
    setRole(r);
    setStep("form");
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        role,
        ...(role === "AGENCY" && {
          agencyName: form.agencyName,
          ownerName: form.ownerName || form.name,
          city: form.city,
          address: form.address,
          businessRegNumber: form.businessRegNumber || undefined,
          taxId: form.taxId || undefined,
        }),
      };

      const result = await api.post("/auth/register", payload);
      setUser(result.user);
      setTokens(result.accessToken, result.refreshToken);
      localStorage.setItem("accessToken", result.accessToken);
      document.cookie = `accessToken=${result.accessToken}; path=/; max-age=900; SameSite=Lax`;
      toast.success(t("Account created successfully!"));
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("Registration failed"));
    } finally {
      setIsLoading(false);
    }
  }

  if (step === "select") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Car className="h-6 w-6 text-primary-foreground" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">{t("Create your account")}</h1>
            <p className="text-muted-foreground">{t("What type of account would you like to create?")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className={cn(
                "relative overflow-hidden cursor-pointer border-2 transition-all hover:border-primary hover:shadow-lg p-8 text-center space-y-4",
                role === "CLIENT" && "border-primary"
              )}
              onClick={() => selectRole("CLIENT")}
            >
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold">{t("Rent a Vehicle")}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("Browse and book vehicles for your personal or business needs")}
                </p>
              </div>
              <ul className="text-sm text-left space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">✓ {t("Browse our vehicle fleet")}</li>
                <li className="flex items-center gap-2">✓ {t("Book online instantly")}</li>
                <li className="flex items-center gap-2">✓ {t("Manage your rentals")}</li>
              </ul>
              <Button className="w-full" variant="default">
                {t("Continue as Client")}
              </Button>
            </Card>

            <Card
              className={cn(
                "relative overflow-hidden cursor-pointer border-2 transition-all hover:border-primary hover:shadow-lg p-8 text-center space-y-4",
                role === "AGENCY" && "border-primary"
              )}
              onClick={() => selectRole("AGENCY")}
            >
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-emerald-500" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold">{t("List My Cars")}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("Register as an agency and start listing your vehicles for rent")}
                </p>
              </div>
              <ul className="text-sm text-left space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">✓ {t("List unlimited vehicles")}</li>
                <li className="flex items-center gap-2">✓ {t("Manage bookings & earnings")}</li>
                <li className="flex items-center gap-2">✓ {t("Get analytics & insights")}</li>
              </ul>
              <Button className="w-full" variant="default">
                {t("Continue as Agency")}
              </Button>
            </Card>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">{t("Already have an account?")} </span>
            <Link href="/login" className="font-medium text-primary hover:underline">{t("Sign in")}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Car className="h-6 w-6 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            {role === "AGENCY" ? t("Register Your Agency") : t("Create Your Account")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {role === "AGENCY"
              ? t("Fill in your agency details to get started")
              : t("Fill in your details to start renting")}
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={() => { setStep("select"); setRole(null); }}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("Back to account type")}
        </Button>

        <form onSubmit={onSubmit} className="space-y-4">
          {role === "AGENCY" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="agencyName">{t("Agency Name")}</Label>
                <Input id="agencyName" placeholder="Premium Rentals Co." value={form.agencyName} onChange={(e) => updateField("agencyName", e.target.value)} required disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">{t("Owner Name")}</Label>
                <Input id="ownerName" placeholder="John Doe" value={form.ownerName} onChange={(e) => updateField("ownerName", e.target.value)} disabled={isLoading} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t("City")}</Label>
                  <Input id="city" placeholder="New York" value={form.city} onChange={(e) => updateField("city", e.target.value)} required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{t("Address")}</Label>
                  <Input id="address" placeholder="123 Main St" value={form.address} onChange={(e) => updateField("address", e.target.value)} required disabled={isLoading} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessRegNumber">{t("Business Reg. Number")} (optional)</Label>
                  <Input id="businessRegNumber" placeholder="BRN-2024-001" value={form.businessRegNumber} onChange={(e) => updateField("businessRegNumber", e.target.value)} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">{t("Tax ID")} (optional)</Label>
                  <Input id="taxId" placeholder="TAX-12345" value={form.taxId} onChange={(e) => updateField("taxId", e.target.value)} disabled={isLoading} />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{role === "AGENCY" ? t("Contact Name") : t("Full Name")}</Label>
            <Input id="name" placeholder="John Doe" value={form.name} onChange={(e) => updateField("name", e.target.value)} required disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("Email")}</Label>
            <Input id="email" type="email" placeholder="name@company.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} required disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t("Phone")}</Label>
            <Input id="phone" type="tel" placeholder="+1 234 567 890" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} required disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("Password")}</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={(e) => updateField("password", e.target.value)} required minLength={8} disabled={isLoading} className="pr-10" />
              <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Creating account...")}</>
            ) : (
              role === "AGENCY" ? t("Register Agency") : t("Create Account")
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">{t("Already have an account?")} </span>
          <Link href="/login" className="font-medium text-primary hover:underline">{t("Sign in")}</Link>
        </div>
      </div>
    </div>
  );
}