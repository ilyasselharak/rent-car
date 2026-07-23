"use client";

import { t } from "./translations";

export function useTranslations() {
  return { t, locale: "fr" as const, setLocale: () => {} };
}