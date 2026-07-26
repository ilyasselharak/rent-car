"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Car, PlusCircle, Search, Edit, Trash2, MoreHorizontal,
  Eye, ChevronDown, ArrowUpDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/use-translations";

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800  ",
  RENTED: "bg-blue-100 text-blue-800  ",
  MAINTENANCE: "bg-yellow-100 text-yellow-800  ",
  RESERVED: "bg-purple-100 text-purple-800  ",
  OUT_OF_SERVICE: "bg-red-100 text-red-800  ",
  CLEANING: "bg-gray-100 text-gray-800  ",
};

export default function AgencyVehiclesPage() {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["agency-vehicles", search, page],
    queryFn: () => api.get(`/vehicles/my?page=${page}&limit=10&search=${search}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-vehicles"] });
      toast.success(t("Vehicle deleted"));
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("My Vehicles")}</h2>
          <p className="text-muted-foreground">{t("Manage your fleet")}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/agency/vehicles/new">
            <PlusCircle className="mr-2 h-4 w-4" /> {t("Add Vehicle")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search vehicles...")}
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">{t("Vehicle")}</th>
                    <th className="pb-3 font-medium">{t("Category")}</th>
                    <th className="pb-3 font-medium">{t("Daily Rate")}</th>
                    <th className="pb-3 font-medium">{t("Status")}</th>
                    <th className="pb-3 font-medium">{t("Bookings")}</th>
                    <th className="pb-3 font-medium w-[80px]">{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">{t("No vehicles found")}</td></tr>
                  ) : data?.data?.map((v: any) => (
                    <tr key={v.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Car className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{v.brand} {v.model}</p>
                            <p className="text-xs text-muted-foreground">{v.year} &middot; {v.color} &middot; {v.registrationNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3"><Badge variant="outline">{v.category}</Badge></td>
                      <td className="py-3 font-medium">{formatCurrency(v.dailyRate)}<span className="text-xs text-muted-foreground">{t("/day")}</span></td>
                      <td className="py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[v.status] || ""}`}>
                          {v.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">{v._count?.bookings || 0}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/agency/vehicles/${v.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/agency/vehicles/${v.id}/edit`}><Edit className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(v.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data?.meta && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                {t("Page {n} of {total}", { n: data.meta.page, total: data.meta.totalPages })} ({data.meta.total} {t("vehicles")})
              </p>
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