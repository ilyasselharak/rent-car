"use client";

import Link from "next/link";
import { Loader2, Shield, CreditCard, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatCurrency } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/use-translations";

interface PriceBreakdown {
  subtotal: number;
  daily: number;
  weekly: number | null;
  monthly: number | null;
  days: number;
}

interface BookingCardProps {
  dailyRate: number;
  depositAmount: number;
  selectedStart: Date | null;
  selectedEnd: Date | null;
  days: number;
  priceBreakdown: PriceBreakdown | null;
  notes: string;
  onNotesChange: (notes: string) => void;
  isAuthenticated: boolean;
  isBookingPending: boolean;
  bookingError: string | null;
  onBook: () => void;
  className?: string;
}

export function BookingCard({
  dailyRate,
  depositAmount,
  selectedStart,
  selectedEnd,
  days,
  priceBreakdown,
  notes,
  onNotesChange,
  isAuthenticated,
  isBookingPending,
  bookingError,
  onBook,
  className,
}: BookingCardProps) {
  const { t } = useTranslations();

  return (
    <>
      <Card
        className={cn(
          "sticky top-24 border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm",
          className
        )}
      >
        <CardContent className="p-6 space-y-5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-bold tracking-tight">
                {formatCurrency(Number(dailyRate))}
              </span>
              <span className="text-muted-foreground text-sm ml-1">
                /{t("day")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl border bg-muted/40 transition-colors hover:bg-muted/60">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {t("Pick-up")}
              </div>
              <div className="font-semibold text-sm flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                {selectedStart
                  ? selectedStart.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </div>
            </div>
            <div className="p-3 rounded-xl border bg-muted/40 transition-colors hover:bg-muted/60">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {t("Return")}
              </div>
              <div className="font-semibold text-sm flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                {selectedEnd
                  ? selectedEnd.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </div>
            </div>
          </div>

          {priceBreakdown && (
            <>
              <div className="rounded-xl bg-primary/5 p-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {priceBreakdown.daily} MAD × {days} {days === 1 ? t("day") : t("days")}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(priceBreakdown.daily * days)}
                  </span>
                </div>
                {priceBreakdown.weekly && days >= 7 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>{t("Weekly discount")}</span>
                    <span className="font-medium">-{formatCurrency(priceBreakdown.daily * days - priceBreakdown.subtotal)}</span>
                  </div>
                )}
                {priceBreakdown.monthly && days >= 30 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>{t("Monthly discount")}</span>
                    <span className="font-medium">-{formatCurrency(priceBreakdown.daily * days - priceBreakdown.subtotal)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">{t("Total")}</span>
                <span className="text-2xl font-bold tracking-tight">
                  {formatCurrency(priceBreakdown.subtotal)}
                </span>
              </div>
            </>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-3 py-2.5">
            <Shield className="h-4 w-4 text-primary shrink-0" />
            <span>
              {t("Deposit")}: {formatCurrency(Number(depositAmount))}
              {" — "}{t("Fully refundable")}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="booking-notes" className="text-xs text-muted-foreground">
              {t("Special Requests")}
            </Label>
            <Input
              id="booking-notes"
              placeholder={t("Any special requirements...")}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <Button
            size="lg"
            className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
            disabled={!selectedStart || !selectedEnd || isBookingPending}
            onClick={onBook}
          >
            {isBookingPending ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("Booking...")}</>
            ) : !isAuthenticated ? (
              <Link href="/login" className="w-full">{t("Sign in to Book")}</Link>
            ) : !selectedStart || !selectedEnd ? (
              t("Select dates from calendar")
            ) : (
              <span className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t("Book Now")}
                {priceBreakdown && ` — ${formatCurrency(priceBreakdown.subtotal)}`}
              </span>
            )}
          </Button>

          {bookingError && (
            <p className="text-sm text-destructive text-center">
              {bookingError}
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
