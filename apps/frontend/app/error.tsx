"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslations();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
      <h1 className="text-2xl font-bold mb-2">{t("Something went wrong")}</h1>
      <p className="text-muted-foreground mb-6">
        {t("An unexpected error occurred. Please try again.")}
      </p>
      <Button onClick={reset}>{t("Try Again")}</Button>
    </div>
  );
}
