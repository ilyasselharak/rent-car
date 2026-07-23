"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Eye, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/use-translations";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  COMPLETED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  NO_SHOW: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  EXTENDED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  EARLY_RETURN: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
};

export default function AgencyBookingsPage() {
  const { t } = useTranslations();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", "10");
  if (search) params.set("search", search);
  if (status) params.set("status", status);

  const { data, isLoading } = useQuery({
    queryKey: ["agency-bookings", search, status, page],
    queryFn: () => api.get(`/bookings?${params}`),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("Bookings")}</h2>
        <p className="text-muted-foreground">{t("Manage customer bookings")}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("Search bookings...")} className="pl-9" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
              <option value="">{t("All Status")}</option>
              <option value="PENDING">{t("Pending")}</option>
              <option value="CONFIRMED">{t("Confirmed")}</option>
              <option value="ACTIVE">{t("Active")}</option>
              <option value="COMPLETED">{t("Completed")}</option>
              <option value="CANCELLED">{t("Cancelled")}</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">{t("Booking #")}</th>
                    <th className="pb-3 font-medium">{t("Customer")}</th>
                    <th className="pb-3 font-medium">{t("Vehicle")}</th>
                    <th className="pb-3 font-medium">{t("Dates")}</th>
                    <th className="pb-3 font-medium">{t("Total")}</th>
                    <th className="pb-3 font-medium">{t("Status")}</th>
                    <th className="pb-3 font-medium w-[60px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">{t("No bookings found")}</td></tr>
                  ) : data?.data?.map((b: any) => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 font-mono text-sm">{b.bookingNumber}</td>
                      <td className="py-3">{b.customer?.user?.name || b.customerId?.slice(0, 8)}</td>
                      <td className="py-3">{b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : "—"}</td>
                      <td className="py-3 text-sm">
                        {formatDate(b.startDate)} — {formatDate(b.endDate)}
                      </td>
                      <td className="py-3 font-medium">{formatCurrency(b.totalAmount || b.total)}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[b.status] || ""}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/agency/bookings/${b.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data?.meta && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">{t("Page {n} of {total}", { n: data.meta.page, total: data.meta.totalPages })}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={!data.meta.hasPrevPage} onClick={() => setPage(p => p - 1)}>{t("Previous")}</Button>
                <Button variant="outline" size="sm" disabled={!data.meta.hasNextPage} onClick={() => setPage(p => p + 1)}>{t("Next")}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}