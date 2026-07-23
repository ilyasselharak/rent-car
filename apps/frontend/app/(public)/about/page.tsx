"use client";

import { Shield, Clock, Award, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function AboutPage() {
  const { t } = useTranslations();

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">{t("About RentCar Enterprise")}</h1>
        <p className="text-lg text-muted-foreground">
          {t("We are building the future of mobility management. Our platform powers car rental businesses of all sizes with enterprise-grade tools, real-time analytics, and seamless customer experiences.")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { icon: Shield, title: t("Enterprise Security"), description: t("Bank-grade encryption and RBAC") },
          { icon: Clock, title: t("24/7 Operations"), description: t("Real-time fleet monitoring") },
          { icon: Award, title: t("Industry Leading"), description: t("Trusted by 50+ enterprises") },
          { icon: Globe, title: t("Global Scale"), description: t("Multi-location support") },
        ].map((item) => (
          <Card key={item.title} className="text-center">
            <CardContent className="p-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">{t("Our Mission")}</h2>
        <p className="text-muted-foreground mb-6">
          {t("To democratize access to enterprise-grade fleet management technology, enabling rental businesses of all sizes to operate more efficiently, serve customers better, and grow their revenue through data-driven decision making.")}
        </p>
        <h2 className="text-2xl font-bold mb-4">{t("Our Values")}</h2>
        <ul className="space-y-3 text-muted-foreground">
          <li><strong>{t("Innovation")}</strong> - {t("We constantly push boundaries to deliver cutting-edge solutions.")}</li>
          <li><strong>{t("Reliability")}</strong> - {t("Our platform is built for 99.9% uptime and enterprise scale.")}</li>
          <li><strong>{t("Customer First")}</strong> - {t("Every feature is designed with the end user in mind.")}</li>
          <li><strong>{t("Transparency")}</strong> - {t("Fair pricing, clear terms, and open communication.")}</li>
        </ul>
      </div>
    </div>
  );
}
