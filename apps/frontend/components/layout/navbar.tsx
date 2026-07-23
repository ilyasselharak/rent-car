"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Car, Menu, X, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/use-translations";

const navLinkDefs = [
  { href: "/", label: "Accueil" },
  { href: "/vehicles", label: "Véhicules" },
  { href: "/about", label: "À Propos" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = navLinkDefs.map((l) => ({ ...l, label: t(l.label) }));

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-black/85 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-black/40 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex h-16 md:h-20 items-center justify-between px-4 sm:px-6 lg:px-8" style={{ maxWidth: "1280px" }}>
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:shadow-lg group-hover:shadow-amber-500/20"
            style={{ background: "#D4AF37" }}
          >
            <Car className="h-5 w-5 md:h-5.5 md:w-5.5 text-black" />
          </div>
          <span className="text-lg md:text-xl font-bold tracking-tight text-white">
            Rent<span style={{ color: "#D4AF37" }}>Car</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                pathname === link.href
                  ? "text-white bg-white/10"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 ring-2 ring-white/20">
                    <AvatarImage src={user.avatar || ""} alt={user.name || ""} />
                    <AvatarFallback className="bg-white/10 text-white text-xs">
                      {getInitials(user.name || "U")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 border-white/10 bg-black/95 backdrop-blur-xl text-white" align="end" forceMount>
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || ""} alt={user.name || ""} />
                    <AvatarFallback className="bg-white/10 text-white">
                      {getInitials(user.name || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium text-white">{user.name || user.email}</p>
                    <p className="text-xs text-white/50 capitalize">{user.role.toLowerCase()}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild className="text-white/80 hover:text-white focus:text-white focus:bg-white/10">
                  <Link href="/dashboard">Tableau de Bord</Link>
                </DropdownMenuItem>
                {user?.role === "AGENCY" && (
                  <DropdownMenuItem asChild className="text-white/80 hover:text-white focus:text-white focus:bg-white/10">
                    <Link href="/dashboard/agency/profile">Profil Agence</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-white/10"
                >
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-lg"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
                style={{ background: "#D4AF37", color: "#000" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#C69C2F")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#D4AF37")}
              >
                S&apos;inscrire
              </Link>
            </div>
          )}

          <button
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl px-4 py-5 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                pathname === link.href
                  ? "text-white bg-white/10"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 space-y-2">
            {isAuthenticated ? (
              <>
                <Button variant="outline" asChild className="w-full border-white/20 text-white hover:bg-white/10">
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    Tableau de Bord
                  </Link>
                </Button>
                <Button
                  className="w-full bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white border border-white/20 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="block w-full text-center px-4 py-2.5 text-sm font-bold rounded-lg transition-all"
                  style={{ background: "#D4AF37", color: "#000" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
