"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Car,
  PlusCircle,
  CalendarDays,
  Users,
  Star,
  BarChart3,
  DollarSign,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, getInitials } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/use-translations";

const sidebarItems = [
  { href: "/dashboard/agency", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/agency/vehicles", label: "My Vehicles", icon: Car },
  { href: "/dashboard/agency/vehicles/new", label: "Add Vehicle", icon: PlusCircle },
  { href: "/dashboard/agency/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/agency/customers", label: "Customers", icon: Users },
  { href: "/dashboard/agency/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/agency/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/agency/earnings", label: "Earnings", icon: DollarSign },
  { href: "/dashboard/agency/profile", label: "Profile", icon: User },
  { href: "/dashboard/agency/settings", label: "Settings", icon: Settings },
];

export default function AgencyDashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-background">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold">{user?.agencyProfile?.agencyName || "RentCar"}</span>
            </Link>
          )}
          {collapsed && <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary mx-auto"><Building2 className="h-5 w-5 text-primary-foreground" /></div>}
          <Button variant="ghost" size="icon" className="hidden lg:flex" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-auto py-4 px-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{t(item.label)}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={user?.avatar || ""} />
              <AvatarFallback>{getInitials(user?.name || "U")}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
                  <p className="text-xs text-muted-foreground">{t("Agency")}</p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              {t(sidebarItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label || "Dashboard")}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}