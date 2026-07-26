"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Fuel, Users, Settings, Gauge, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";
import { getVehicles } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

function NewVehicleCard({ vehicle, index, t }: { vehicle: any; index: number; t: (k: string) => string }) {
  const images = vehicle.images?.length ? vehicle.images : ["/placeholder-car.jpg"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="group relative bg-white  rounded-2xl border border-gray-200  hover:border-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/5 transition-all duration-300 overflow-hidden"
    >
      <Link href={`/vehicles/${vehicle.id}`}>
        <div className="relative aspect-[4/3] bg-gray-100  overflow-hidden">
          <Image
            src={images[0]}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> {t("New")}
            </span>
          </div>
          {vehicle.dailyRate && (
            <div className="absolute bottom-3 right-3 bg-white/90  backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
              <span className="text-sm font-bold text-yellow-600 ">{formatCurrency(vehicle.dailyRate)}</span>
              <span className="text-[10px] text-gray-400 ml-0.5">{t("/day")}</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-900  group-hover:text-yellow-500 transition-colors truncate">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{vehicle.year}</p>
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 ">
            {vehicle.transmission && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500  bg-gray-100  px-2 py-1 rounded-md">
                <Settings className="h-3 w-3" />{vehicle.transmission === "AUTOMATIC" ? "Auto" : vehicle.transmission}
              </span>
            )}
            {vehicle.fuelType && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500  bg-gray-100  px-2 py-1 rounded-md">
                <Fuel className="h-3 w-3" />{vehicle.fuelType === "ELECTRIC" ? "Electric" : vehicle.fuelType === "HYBRID" ? "Hybrid" : vehicle.fuelType}
              </span>
            )}
            {vehicle.seats && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500  bg-gray-100  px-2 py-1 rounded-md">
                <Users className="h-3 w-3" />{vehicle.seats} seats
              </span>
            )}
            {vehicle.mileage && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500  bg-gray-100  px-2 py-1 rounded-md">
                <Gauge className="h-3 w-3" />{vehicle.mileage.toLocaleString()} km
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white  rounded-2xl border border-gray-200  overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200 " />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200  rounded w-3/4" />
        <div className="h-3 bg-gray-200  rounded w-1/4" />
        <div className="h-8 bg-gray-200  rounded w-full" />
      </div>
    </div>
  );
}

export function LatestVehicles() {
  const { t: translate } = useTranslations();
  const [limit, setLimit] = useState(6);
  const { data, isLoading, error } = useQuery({
    queryKey: ["vehicles", "latest", limit],
    queryFn: () => getVehicles({ sort: "createdAt", order: "desc", limit }),
  });

  const vehicles = data?.vehicles || data?.data || [];

  return (
    <section className="py-20 md:py-28 bg-white ">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-yellow-500 mb-3">{translate("Latest Additions")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900  mb-4">{translate("New Arrivals")}</h2>
          <p className="text-gray-500  max-w-xl mx-auto">
            {translate("Freshly added to our fleet — be the first to drive them.")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : vehicles.length > 0 ? (
            vehicles.map((v: any, i: number) => (
              <NewVehicleCard key={v.id} vehicle={v} index={i} t={translate} />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <Sparkles className="h-10 w-10 text-gray-300  mx-auto mb-3" />
              <p className="text-gray-400">{translate("No new vehicles yet.")}</p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-center text-red-400 py-6">{translate("Failed to load vehicles.")}</p>
        )}

        {!isLoading && vehicles.length >= 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <button
              onClick={() => setLimit((l) => l + 6)}
              className="inline-flex items-center gap-2 border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-semibold px-8 py-3 rounded-xl transition-all"
            >
              {translate("Load More")}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}