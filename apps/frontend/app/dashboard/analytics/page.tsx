"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Users, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/use-translations";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function DashboardAnalyticsPage() {
  const { t } = useTranslations();

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ["analytics-revenue"],
    queryFn: () => api.get("/analytics/revenue"),
  });

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["analytics-customers"],
    queryFn: () => api.get("/analytics/customers"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("Analytics")}</h2>
        <p className="text-muted-foreground">{t("Business insights and performance metrics")}</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        {revenueLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("Total Revenue")}</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(Number(revenue?.totalRevenue || 0))}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("Transactions")}</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(revenue?.totalTransactions || 0)}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("Total Customers")}</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(customers?.totalCustomers || 0)}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-violet-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("Revenue by Payment Method")}</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : revenue?.revenueByMethod?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenue.revenueByMethod}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="amount"
                    nameKey="method"
                  >
                    {revenue.revenueByMethod.map((_entry: unknown, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">{t("No revenue data")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Customer Tiers")}</CardTitle>
          </CardHeader>
          <CardContent>
            {customersLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : customers?.tierBreakdown?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customers.tierBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tier" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">{t("No customer data")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
