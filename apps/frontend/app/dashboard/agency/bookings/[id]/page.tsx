"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/use-translations";

const BOOKING_STATUSES = [
  { value: "PENDING", label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { value: "CONFIRMED", label: "Confirmed", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  { value: "ACTIVE", label: "Active", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  { value: "COMPLETED", label: "Completed", color: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  { value: "NO_SHOW", label: "No Show", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  { value: "EXTENDED", label: "Extended", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  { value: "EARLY_RETURN", label: "Early Return", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400" },
];

const statusMap: Record<string, typeof BOOKING_STATUSES[number]> = {};
for (const s of BOOKING_STATUSES) { statusMap[s.value] = s; }

export default function BookingDetailPage() {
  const { t } = useTranslations();
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [open, setOpen] = useState(false);

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => api.get(`/bookings/${id}`),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.patch(`/bookings/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["agency-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["agency-stats"] });
      toast.success(t("Booking status updated"));
      setSelectedStatus("");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!booking) return <p className="text-muted-foreground">{t("Booking not found")}</p>;

  const currentStatus = booking.status as string;
  const current = statusMap[currentStatus];
  const selected = statusMap[selectedStatus];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-2xl font-bold">{t("Booking #")}{booking.bookingNumber}</h2>
            <p className="text-muted-foreground">{t("Created {date}", { date: formatDate(booking.createdAt) })}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${current?.color || ""}`}>
            {current?.label || currentStatus}
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm hover:bg-accent transition-colors min-w-[160px]"
            >
              {selected ? (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${selected.color}`}>
                  {selected.label}
                </span>
              ) : (
                <span className="text-muted-foreground">{t("Change status...")}</span>
              )}
              <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-[220px] rounded-xl border bg-card shadow-xl p-1.5 space-y-0.5">
                  {BOOKING_STATUSES.filter((s) => s.value !== currentStatus).map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => { setSelectedStatus(status.value); setOpen(false); }}
                      className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <Button
            onClick={() => statusMutation.mutate(selectedStatus)}
            disabled={!selectedStatus || selectedStatus === currentStatus || statusMutation.isPending}
            size="sm"
            className="h-9"
          >
            {statusMutation.isPending ? t("Updating...") : t("Update")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>{t("Booking Info")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label={t("Status")} value={current?.label || currentStatus} />
            <Row label={t("Start Date")} value={formatDate(booking.startDate)} />
            <Row label={t("End Date")} value={formatDate(booking.endDate)} />
            <Row label={t("Total")} value={formatCurrency(Number(booking.finalAmount))} />
            <Row label={t("Deposit")} value={formatCurrency(Number(booking.depositAmount))} />
            <Row label={t("Pickup")} value={booking.pickupLocation?.name || "—"} />
            <Row label={t("Return")} value={booking.returnLocation?.name || "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("Customer")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label={t("Name")} value={booking.customer?.user?.name || "—"} />
            <Row label={t("Email")} value={booking.customer?.user?.email || "—"} />
            <Row label={t("Phone")} value={booking.customer?.user?.phone || "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("Vehicle")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {booking.vehicle ? (
              <>
                <Row label={t("Brand")} value={booking.vehicle.brand} />
                <Row label={t("Model")} value={booking.vehicle.model} />
                <Row label={t("Year")} value={booking.vehicle.year} />
                <Row label={t("Rate")} value={formatCurrency(Number(booking.vehicle.dailyRate))} />
              </>
            ) : <p className="text-muted-foreground">{t("Vehicle info unavailable")}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
