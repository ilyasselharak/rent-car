"use client";

import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function AgencyReviewsPage() {
  const { t } = useTranslations();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("Reviews")}</h2>
        <p className="text-muted-foreground">{t("Customer reviews for your vehicles")}</p>
      </div>
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <Star className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">{t("Reviews Coming Soon")}</p>
            <p className="text-sm text-muted-foreground max-w-md">
              {t("The reviews system is being set up. You will be able to see and manage customer reviews here shortly.")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}