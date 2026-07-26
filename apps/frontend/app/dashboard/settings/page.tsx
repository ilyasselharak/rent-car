"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { api } from "@/lib/api";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function DashboardSettingsPage() {
  const { t } = useTranslations();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    twoFactorAuth: false,
    loginAlerts: true,
  });

  const saveMutation = useMutation({
    mutationFn: () => api.patch("/users/me/preferences", settings),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("Settings")}</h2>
          <p className="text-muted-foreground">{t("Manage your account and platform preferences")}</p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("Saving...")}</> : <><Save className="mr-2 h-4 w-4" /> {t("Save")}</>}
        </Button>
      </div>

      {saveMutation.isSuccess && <p className="text-sm text-green-600 ">{t("Settings saved successfully.")}</p>}
      {saveMutation.isError && <p className="text-sm text-destructive">{t("Failed to save settings.")}</p>}

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{t("Notifications")}</CardTitle>
            <CardDescription>{t("Configure how you receive notifications")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "emailNotifications" as const, label: t("Email Notifications"), description: t("Receive updates via email") },
              { key: "smsNotifications" as const, label: t("SMS Notifications"), description: t("Receive updates via text message") },
              { key: "pushNotifications" as const, label: t("Push Notifications"), description: t("Receive browser push notifications") },
              { key: "marketingEmails" as const, label: t("Marketing Emails"), description: t("Receive promotional offers and news") },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Switch checked={settings[item.key]} onCheckedChange={(checked) => setSettings({ ...settings, [item.key]: checked })} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Security")}</CardTitle>
            <CardDescription>{t("Manage your security preferences")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "twoFactorAuth" as const, label: t("Two-Factor Authentication"), description: t("Add an extra layer of security") },
              { key: "loginAlerts" as const, label: t("Login Alerts"), description: t("Get notified of new logins") },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Switch checked={settings[item.key]} onCheckedChange={(checked) => setSettings({ ...settings, [item.key]: checked })} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
