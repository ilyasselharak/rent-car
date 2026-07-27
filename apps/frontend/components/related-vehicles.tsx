"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Users, Fuel, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";

interface RelatedVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  dailyRate: number;
  images: string[];
  seats: number;
  fuelType: string;
  transmission: string;
}

interface RelatedVehiclesProps {
  vehicles: RelatedVehicle[];
  className?: string;
}

export function RelatedVehicles({ vehicles, className }: RelatedVehiclesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 340;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!vehicles.length) return null;

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Related Vehicles</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory -mx-1 px-1"
      >
        {vehicles.map((vehicle) => (
          <Link
            key={vehicle.id}
            href={`/vehicles/${vehicle.id}`}
            className="group flex-shrink-0 w-[300px] snap-start"
          >
            <div className="rounded-xl border bg-card overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1">
              <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                <Image
                  src={vehicle.images[0] || "/placeholder.svg"}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="300px"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    {vehicle.brand}
                  </div>
                  <div className="font-semibold truncate">
                    {vehicle.model} {vehicle.year}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {vehicle.seats}
                  </span>
                  <span className="flex items-center gap-1">
                    <Fuel className="h-3.5 w-3.5" />
                    {vehicle.fuelType}
                  </span>
                  <span>{vehicle.transmission}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-lg font-bold">
                      {formatCurrency(Number(vehicle.dailyRate))}
                    </span>
                    <span className="text-xs text-muted-foreground">/day</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    Book <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
