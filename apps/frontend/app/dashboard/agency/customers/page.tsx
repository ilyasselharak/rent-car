"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function AgencyCustomersPage() {
  const { t } = useTranslations();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", "10");
  if (search) params.set("search", search);

  const { data, isLoading } = useQuery({
    queryKey: ["agency-customers", search, page],
    queryFn: () => api.get(`/customers?${params}`),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("Customers")}</h2>
        <p className="text-muted-foreground">{t("View your customers")}</p>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("Search customers...")} className="pl-9" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">{t("Name")}</th>
                    <th className="pb-3 font-medium">{t("Email")}</th>
                    <th className="pb-3 font-medium">{t("Phone")}</th>
                    <th className="pb-3 font-medium">{t("Tier")}</th>
                    <th className="pb-3 font-medium">{t("Rentals")}</th>
                    <th className="pb-3 font-medium">{t("Spent")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">{t("No customers found")}</td></tr>
                  ) : data?.data?.map((c: any) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium">{c.user?.name || "—"}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm">{c.user?.email || "—"}</td>
                      <td className="py-3 text-sm">{c.user?.phone || "—"}</td>
                      <td className="py-3">
                        <Badge variant={c.loyaltyTier === "GOLD" || c.loyaltyTier === "PLATINUM" ? "default" : "secondary"}>
                          {c.loyaltyTier || "BRONZE"}
                        </Badge>
                      </td>
                      <td className="py-3">{c.totalRentals || 0}</td>
                      <td className="py-3 font-medium">{formatCurrency(Number(c.totalSpent || 0))}</td>
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