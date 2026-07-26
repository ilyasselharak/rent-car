"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, MoreHorizontal, Edit3, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, ApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const statusBadge: Record<string, { variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline"; label: string }> = {
  AVAILABLE: { variant: "success", label: "Available" },
  RENTED: { variant: "default", label: "Rented" },
  MAINTENANCE: { variant: "warning", label: "Maintenance" },
  RESERVED: { variant: "secondary", label: "Reserved" },
  OUT_OF_SERVICE: { variant: "destructive", label: "Out of Service" },
  CLEANING: { variant: "outline", label: "Cleaning" },
};

export default function AdminVehiclesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-vehicles", page, search, statusFilter],
    queryFn: () => api.get(`/admin/vehicles?page=${page}&limit=20${search ? `&search=${search}` : ""}${statusFilter ? `&status=${statusFilter}` : ""}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vehicles"] });
      toast.success("Vehicle deleted");
    },
    onError: (err: ApiError) => {
      toast.error(err.message);
    },
  });

  const vehicles = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Vehicles</h2>
        <p className="text-muted-foreground">Manage all vehicles across agencies</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles..."
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="RENTED">Rented</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="RESERVED">Reserved</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
              <option value="CLEANING">Cleaning</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : vehicles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No vehicles found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Vehicle</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Agency</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Daily Rate</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Bookings</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v: {
                    id: string; brand: string; model: string; year: number; status: string;
                    dailyRate: number; category: string; registrationNumber: string;
                    agencyProfile: { agencyName: string } | null;
                    _count: { bookings: number };
                  }) => (
                    <tr key={v.id} className="border-b last:border-0">
                      <td className="py-3 pr-3">
                        <p className="text-sm font-medium">{v.brand} {v.model}</p>
                        <p className="text-xs text-muted-foreground">{v.year} &middot; {v.registrationNumber}</p>
                      </td>
                      <td className="py-3 pr-3 text-sm text-muted-foreground">{v.agencyProfile?.agencyName || "—"}</td>
                      <td className="py-3 pr-3">
                        <Badge variant={statusBadge[v.status]?.variant || "secondary"}>{statusBadge[v.status]?.label || v.status}</Badge>
                      </td>
                      <td className="py-3 pr-3 text-sm">{formatCurrency(Number(v.dailyRate))}<span className="text-xs text-muted-foreground">/day</span></td>
                      <td className="py-3 pr-3 text-sm text-muted-foreground">{v.category}</td>
                      <td className="py-3 pr-3 text-sm text-muted-foreground">{v._count?.bookings || 0}</td>
                      <td className="py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onClick={() => window.open(`/vehicles/${v.id}`, "_blank")}>
                              <Edit3 className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => { if (confirm("Delete this vehicle?")) deleteMutation.mutate(v.id); }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!meta.hasPrevPage}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={!meta.hasNextPage}>
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
