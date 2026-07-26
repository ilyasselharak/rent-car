"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusBadge: Record<string, { variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline"; label: string }> = {
  PENDING: { variant: "warning", label: "Pending" },
  CONFIRMED: { variant: "default", label: "Confirmed" },
  ACTIVE: { variant: "success", label: "Active" },
  COMPLETED: { variant: "secondary", label: "Completed" },
  CANCELLED: { variant: "destructive", label: "Cancelled" },
};

export default function ClientBookingsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", "10");
  if (statusFilter) params.set("status", statusFilter);

  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings", page, statusFilter],
    queryFn: () => api.get(`/bookings/my?${params}`),
  });

  const bookings = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Bookings</h2>
        <p className="text-muted-foreground">View and manage your rentals</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : bookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No bookings found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Booking #</th>
                    <th className="pb-3 font-medium">Vehicle</th>
                    <th className="pb-3 font-medium">Dates</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium w-[60px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b: any) => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 font-mono text-sm">{b.bookingNumber}</td>
                      <td className="py-3 text-sm">{b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : "—"}</td>
                      <td className="py-3 text-sm">
                        {formatDate(b.startDate)} — {formatDate(b.endDate)}
                      </td>
                      <td className="py-3 font-medium text-sm">{formatCurrency(b.finalAmount || b.totalAmount || 0)}</td>
                      <td className="py-3">
                        <Badge variant={statusBadge[b.status]?.variant || "secondary"}>
                          {statusBadge[b.status]?.label || b.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`/vehicles/${b.vehicleId}`, "_blank")}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">Page {meta.page} of {meta.totalPages} ({meta.total} total)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={!meta.hasPrevPage} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={!meta.hasNextPage} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
