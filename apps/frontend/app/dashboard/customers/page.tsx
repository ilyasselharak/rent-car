"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UserX, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { formatCurrency, getInitials } from "@/lib/utils";
import type { Customer } from "@/types";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function DashboardCustomersPage() {
  const { t } = useTranslations();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-customers", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("limit", "50");
      return api.get(`/customers?${params.toString()}`);
    },
  });

  const customers = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("Customers")}</h2>
        <p className="text-muted-foreground">{t("Manage customer profiles and loyalty")}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("Search by name, email, license...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <h3 className="text-lg font-medium mb-2">{t("No customers found")}</h3>
          <p className="text-muted-foreground">{t("Try adjusting your search.")}</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {customers.map((customer: Customer) => (
            <Card key={customer.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={customer.user.avatar || ""} />
                      <AvatarFallback>{getInitials(customer.user.name || "U")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {customer.user.name || customer.user.email}
                        </span>
                        {customer.isBlacklisted && (
                          <Badge variant="destructive" className="text-xs">
                            <UserX className="h-3 w-3 mr-1" />
                            {t("Blacklisted")}
                          </Badge>
                        )}
                        {!customer.isBlacklisted && (
                          <Badge variant="success" className="text-xs">
                            <UserCheck className="h-3 w-3 mr-1" />
                            {t("Active")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{customer.user.email}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{t("Tier:")} {customer.loyaltyTier}</span>
                        <span>·</span>
                        <span>{customer.totalRentals} {t("rentals")}</span>
                        <span>·</span>
                        <span>{formatCurrency(Number(customer.totalSpent))} {t("spent")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium">{customer.loyaltyPoints} {t("pts")}</div>
                    <div className="text-xs text-muted-foreground">{t("Loyalty Points")}</div>
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
