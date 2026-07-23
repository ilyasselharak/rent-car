"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Fuel, Users, Gauge, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { Vehicle } from "@/types";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function VehiclesPage() {
  const { t } = useTranslations();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [fuelType, setFuelType] = useState(searchParams.get("fuelType") || "");

  const heroParams = useMemo(() => ({
    location: searchParams.get("location") || "",
    pickupDate: searchParams.get("pickupDate") || "",
    pickupTime: searchParams.get("pickupTime") || "",
    returnDate: searchParams.get("returnDate") || "",
  }), [searchParams]);

  const hasHeroFilters = heroParams.location || heroParams.pickupDate || heroParams.returnDate;

  const { data, isLoading } = useQuery({
    queryKey: ["vehicles", search, category, fuelType, heroParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (fuelType) params.append("fuelType", fuelType);
      if (heroParams.location) params.append("city", heroParams.location);
      return api.get(`/vehicles?${params.toString()}`);
    },
  });

  const vehicles = data?.data || [];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t("Our Fleet")}</h1>
        <p className="text-muted-foreground">
          {t("Browse our premium selection of vehicles available for rent.")}
        </p>
      </div>

      {/* Hero Filters */}
      {hasHeroFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-lg bg-muted/50">
          <span className="text-sm font-medium text-muted-foreground">{t("Filtered by")}:</span>
          {heroParams.location && (
            <Badge variant="secondary" className="gap-1">
              {heroParams.location}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch(p => p)} />
            </Badge>
          )}
          {heroParams.pickupDate && (
            <Badge variant="secondary">{t("Pickup")}: {heroParams.pickupDate}</Badge>
          )}
          {heroParams.returnDate && (
            <Badge variant="secondary">{t("Return")}: {heroParams.returnDate}</Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => window.history.pushState({}, "", "/vehicles")}
          >
            {t("Clear")}
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("Search by brand, model...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">{t("All Categories")}</option>
            <option value="Sedan">{t("Sedan")}</option>
            <option value="SUV">{t("SUV")}</option>
            <option value="Luxury">{t("Luxury")}</option>
            <option value="Sports">{t("Sports")}</option>
            <option value="Truck">{t("Truck")}</option>
          </select>
          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">{t("All Fuel Types")}</option>
            <option value="GASOLINE">{t("Gasoline")}</option>
            <option value="DIESEL">{t("Diesel")}</option>
            <option value="ELECTRIC">{t("Electric")}</option>
            <option value="HYBRID">{t("Hybrid")}</option>
          </select>
        </div>
      </div>

      {/* Vehicle Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[360px] rounded-xl" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20">
          <SlidersHorizontal className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">{t("No vehicles found")}</h3>
          <p className="text-muted-foreground">{t("Try adjusting your search filters.")}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle: Vehicle) => (
            <Link
              key={vehicle.id}
              href={`/vehicles/${vehicle.id}`}
              className="group rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg"
            >
              <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                {vehicle.images[0] ? (
                  <Image
                    src={vehicle.images[0]}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    {t("No Image")}
                  </div>
                )}
                <Badge
                  variant={vehicle.status === "AVAILABLE" ? "success" : "secondary"}
                  className="absolute top-3 right-3"
                >
                  {vehicle.status}
                </Badge>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-primary">
                      {formatCurrency(Number(vehicle.dailyRate))}
                    </div>
                    <div className="text-xs text-muted-foreground">{t("/day")}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Fuel className="h-3.5 w-3.5" />
                    <span>{vehicle.fuelType}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>{vehicle.seats} {t("seats")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gauge className="h-3.5 w-3.5" />
                    <span>{vehicle.transmission}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {vehicle.features.slice(0, 3).map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
