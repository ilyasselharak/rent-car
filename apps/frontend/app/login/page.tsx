"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function LoginPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await api.post("/auth/login", { email, password });
      setUser(result.user);
      setTokens(result.accessToken, result.refreshToken);
      localStorage.setItem("accessToken", result.accessToken);
      document.cookie = `accessToken=${result.accessToken}; path=/; max-age=86400; SameSite=Lax`;

      const profile = await api.get("/auth/me").catch(() => null);
      if (profile) setUser(profile);

      toast.success(t("Welcome back!"));
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("Login failed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Car className="h-6 w-6 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{t("Welcome back")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("Enter your credentials to access your account")}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("Email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("name@company.com")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("Password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("Enter your password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("Signing in...")}
              </>
            ) : (
              t("Sign in")
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">{t("Don't have an account?")} </span>
          <Link href="/register" className="font-medium text-primary hover:underline">
            {t("Create one")}
          </Link>
        </div>
      </div>
    </div>
  );
}