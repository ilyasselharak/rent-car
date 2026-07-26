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
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

const roleBadge: Record<string, { variant: "default" | "secondary" | "success" | "warning" | "destructive"; label: string }> = {
  SUPER_ADMIN: { variant: "destructive", label: "Super Admin" },
  ADMIN: { variant: "warning", label: "Admin" },
  AGENCY: { variant: "default", label: "Agency" },
  CLIENT: { variant: "secondary", label: "Client" },
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; phone: string; role: string; isActive: boolean }>({ name: "", phone: "", role: "CLIENT", isActive: true });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () => api.get(`/admin/users?page=${page}&limit=20${search ? `&search=${search}` : ""}`),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; phone?: string; role?: string; isActive?: boolean }) =>
      api.patch(`/admin/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingUserId(null);
      toast.success("User updated");
    },
    onError: (err: ApiError) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted");
    },
    onError: (err: ApiError) => {
      toast.error(err.message);
    },
  });

  const users = data?.data ?? [];
  const meta = data?.meta;

  const handleEdit = (user: { id: string; name: string | null; phone: string | null; role: string; isActive: boolean }) => {
    setEditingUserId(user.id);
    setEditForm({ name: user.name || "", phone: user.phone || "", role: user.role, isActive: user.isActive });
  };

  const handleSave = (id: string) => {
    updateMutation.mutate({ id, ...editForm });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Users</h2>
          <p className="text-muted-foreground">Manage all platform users</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
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
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Joined</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: { id: string; name: string | null; email: string; role: string; isActive: boolean; phone: string | null; createdAt: string }) => (
                    <tr key={user.id} className="border-b last:border-0">
                      {editingUserId === user.id ? (
                        <>
                          <td className="py-3 pr-3">
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                              className="h-8 text-sm"
                            />
                          </td>
                          <td className="py-3 pr-3 text-sm">{user.email}</td>
                          <td className="py-3 pr-3">
                            <select
                              value={editForm.role}
                              onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))}
                              className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                            >
                              <option value="CLIENT">CLIENT</option>
                              <option value="AGENCY">AGENCY</option>
                              <option value="ADMIN">ADMIN</option>
                              {currentUser?.role === "SUPER_ADMIN" && <option value="SUPER_ADMIN">SUPER_ADMIN</option>}
                            </select>
                          </td>
                          <td className="py-3 pr-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editForm.isActive}
                                onChange={(e) => setEditForm(f => ({ ...f, isActive: e.target.checked }))}
                                className="rounded"
                              />
                              <span className="text-sm">{editForm.isActive ? "Active" : "Inactive"}</span>
                            </label>
                          </td>
                          <td className="py-3 pr-3 text-sm text-muted-foreground">{formatDate(user.createdAt)}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleSave(user.id)} disabled={updateMutation.isPending}>Save</Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingUserId(null)}>Cancel</Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 pr-3">
                            <p className="text-sm font-medium">{user.name || "—"}</p>
                          </td>
                          <td className="py-3 pr-3 text-sm text-muted-foreground">{user.email}</td>
                          <td className="py-3 pr-3">
                            <Badge variant={roleBadge[user.role]?.variant || "secondary"}>{roleBadge[user.role]?.label || user.role}</Badge>
                          </td>
                          <td className="py-3 pr-3">
                            <Badge variant={user.isActive ? "success" : "destructive"}>{user.isActive ? "Active" : "Inactive"}</Badge>
                          </td>
                          <td className="py-3 pr-3 text-sm text-muted-foreground">{formatDate(user.createdAt)}</td>
                          <td className="py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem onClick={() => handleEdit(user)}>
                                  <Edit3 className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => { if (confirm("Delete this user?")) deleteMutation.mutate(user.id); }}
                                  disabled={currentUser?.role !== "SUPER_ADMIN"}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </>
                      )}
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
