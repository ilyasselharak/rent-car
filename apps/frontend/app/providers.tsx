"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

function SessionWatcher() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    const interval = setInterval(() => {
      checkSession();
    }, 30_000);
    return () => clearInterval(interval);
  }, [checkSession]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionWatcher />
      {children}
    </QueryClientProvider>
  );
}
