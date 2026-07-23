"use client";

import Link from "next/link";
import { Car } from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";

export function Footer() {
  const { t } = useTranslations();
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">RentCar</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("Enterprise-grade car rental management platform for modern fleet operations.")}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">{t("Platform")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/vehicles" className="hover:text-foreground transition-colors">{t("Browse Vehicles")}</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">{t("About Us")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">{t("Support")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-foreground transition-colors">{t("Contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">{t("Company")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">{t("About")}</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">{t("Contact Us")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          {t("© {year} RentCar Enterprise. All rights reserved.", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
