"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { api, ApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/use-translations";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800  ",
  CONFIRMED: "bg-blue-100 text-blue-800  ",
  ACTIVE: "bg-green-100 text-green-800  ",
  COMPLETED: "bg-gray-100 text-gray-800  ",
  CANCELLED: "bg-red-100 text-red-800  ",
  NO_SHOW: "bg-red-100 text-red-800  ",
};

export default function BookingDetailPage() {
  const { t } = useTranslations();
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => api.get(`/bookings/${id}`),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.patch(`/bookings/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["agency-bookings"] });
      toast.success(t("Booking status updated"));
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!booking) return <p className="text-muted-foreground">{t("Booking not found")}</p>;

  const canConfirm = booking.status === "PENDING";
  const canCancel = ["PENDING", "CONFIRMED"].includes(booking.status);
  const canComplete = booking.status === "ACTIVE";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-2xl font-bold">{t("Booking #")}{booking.bookingNumber}</h2>
            <p className="text-muted-foreground">{t("Created {date}", { date: formatDate(booking.createdAt) })}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canConfirm && (
            <Button onClick={() => statusMutation.mutate("CONFIRMED")} disabled={statusMutation.isPending}>
              <CheckCircle className="mr-2 h-4 w-4" /> {t("Confirm")}
            </Button>
          )}
          {canComplete && (
            <Button onClick={() => statusMutation.mutate("COMPLETED")} disabled={statusMutation.isPending}>
              <CheckCircle className="mr-2 h-4 w-4" /> {t("Complete")}
            </Button>
          )}
          {canCancel && (
            <Button variant="destructive" onClick={() => statusMutation.mutate("CANCELLED")} disabled={statusMutation.isPending}>
              <XCircle className="mr-2 h-4 w-4" /> {t("Cancel")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>{t("Booking Info")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label={t("Status")} value={<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[booking.status] || ""}`}>{booking.status}</span>} />
            <Row label={t("Start Date")} value={formatDate(booking.startDate)} />
            <Row label={t("End Date")} value={formatDate(booking.endDate)} />
            <Row label={t("Total")} value={formatCurrency(booking.totalAmount || booking.total)} />
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
                <Row label={t("Rate")} value={formatCurrency(booking.vehicle.dailyRate)} />
              </>
            ) : <p className="text-muted-foreground">{t("Vehicle info unavailable")}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}