"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { formatDate } from "@/lib/utils";

export default function ClientSettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Your account information</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{user?.email || "—"}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium">{user?.name || "—"}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Phone</span>
            <span className="text-sm font-medium">{user?.phone || "—"}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Role</span>
            <span className="text-sm font-medium">{user?.role || "—"}</span>
          </div>
          {user?.customer && (
            <>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Loyalty Tier</span>
                <span className="text-sm font-medium">{user.customer.loyaltyTier || "—"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Loyalty Points</span>
                <span className="text-sm font-medium">{user.customer.loyaltyPoints || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Total Rentals</span>
                <span className="text-sm font-medium">{user.customer.totalRentals || 0}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
