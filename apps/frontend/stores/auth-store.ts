import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatar: string | null;
  phone: string | null;
  customer?: {
    loyaltyPoints: number;
    loyaltyTier: string;
    totalRentals: number;
    totalSpent: number;
  } | null;
  agencyProfile?: {
    id: string;
    agencyName: string;
    slug: string;
    logo: string | null;
    phone: string | null;
    city: string | null;
    verified: boolean;
    rating: number;
  } | null;
}

function decodeJwtExp(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1] as string));
    return payload.exp || null;
  } catch {
    return null;
  }
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  checkSession: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),
      setTokens: (accessToken, refreshToken) => {
        const exp = decodeJwtExp(accessToken);
        const expiresAt = exp ? exp * 1000 : null;
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
        }
        set({ accessToken, refreshToken, expiresAt, isAuthenticated: true });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          document.cookie = "accessToken=; path=/; max-age=0";
        }
        set({ user: null, accessToken: null, refreshToken: null, expiresAt: null, isAuthenticated: false });
      },
      setLoading: (isLoading) => set({ isLoading }),
      checkSession: () => {
        const { expiresAt, logout } = get();
        if (expiresAt && Date.now() >= expiresAt) {
          logout();
          return false;
        }
        return true;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.checkSession();
        state?.setLoading(false);
      },
    }
  )
);
