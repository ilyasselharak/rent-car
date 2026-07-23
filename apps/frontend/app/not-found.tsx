"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function NotFoundPage() {
  const { t } = useTranslations();
  return (
    <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
      <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">{t("Page not found")}</h1>
      <p className="text-muted-foreground mb-6">
        {t("The page you are looking for does not exist.")}
      </p>
      <Button asChild>
        <Link href="/">{t("Go Home")}</Link>
      </Button>
    </div>
  );
}