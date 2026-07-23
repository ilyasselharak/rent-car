"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Booking } from "@/types";
import { useTranslations } from "@/lib/i18n/use-translations";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  CONFIRMED: "default",
  ACTIVE: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

export default function DashboardBookingsPage() {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-bookings", search, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status) params.append("status", status);
      params.append("limit", "50");
      return api.get(`/bookings?${params.toString()}`);
    },
  });

  const bookings = data?.data || [];

  const statusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: string }) =>
      api.patch(`/bookings/${id}/status`, { status: newStatus }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-bookings"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("Bookings")}</h2>
        <p className="text-muted-foreground">{t("Manage reservations and rentals")}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("Search by booking number, customer...")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="">{t("All Statuses")}</option>
          <option value="PENDING">{t("Pending")}</option>
          <option value="CONFIRMED">{t("Confirmed")}</option>
          <option value="ACTIVE">{t("Active")}</option>
          <option value="COMPLETED">{t("Completed")}</option>
          <option value="CANCELLED">{t("Cancelled")}</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : bookings.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <h3 className="text-lg font-medium mb-2">{t("No bookings found")}</h3>
          <p className="text-muted-foreground">{t("Try adjusting your search filters.")}</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking: Booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">{booking.bookingNumber.slice(-4)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{booking.bookingNumber}</span>
                        <Badge variant={statusColors[booking.status] || "outline"}>{booking.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.customer?.user?.name || booking.customer?.user?.email || t("N/A")} &middot;{" "}
                        {booking.vehicle?.brand} {booking.vehicle?.model}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(booking.startDate)} &mdash; {formatDate(booking.endDate)} &middot; {booking.totalDays} {t("days")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(Number(booking.finalAmount))}</div>
                      <div className="text-xs text-muted-foreground">{t("Paid:")} {formatCurrency(Number(booking.paidAmount))}</div>
                    </div>
                    <div className="flex gap-1">
                      {statusMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {booking.status === "PENDING" && (
                            <>
                              <Button variant="ghost" size="icon" className="text-emerald-500" onClick={() => statusMutation.mutate({ id: booking.id, newStatus: "CONFIRMED" })} title={t("Confirm")}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => statusMutation.mutate({ id: booking.id, newStatus: "CANCELLED" })} title={t("Cancel")}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {booking.status === "CONFIRMED" && (
                            <Button variant="ghost" size="icon" className="text-blue-500" onClick={() => statusMutation.mutate({ id: booking.id, newStatus: "ACTIVE" })} title={t("Start Rental")}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {booking.status === "ACTIVE" && (
                            <Button variant="ghost" size="icon" className="text-emerald-500" onClick={() => statusMutation.mutate({ id: booking.id, newStatus: "COMPLETED" })} title={t("Complete")}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
