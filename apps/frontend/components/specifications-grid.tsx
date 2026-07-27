"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpecItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

interface SpecificationsGridProps {
  specs: SpecItem[];
  className?: string;
}

export function SpecificationsGrid({ specs, className }: SpecificationsGridProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3", className)}>
      {specs.map((spec) => {
        const Icon = spec.icon;
        return (
          <div
            key={spec.label}
            className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/20 transition-all duration-200 hover:shadow-md hover:shadow-primary/5"
          >
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/15">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                {spec.label}
              </div>
              <div className="font-semibold text-xs sm:text-sm truncate">
                {spec.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
