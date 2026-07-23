"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, Fuel, Users, Settings, Gauge } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/use-translations";
import { getVehicles } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

function VehicleCard({ vehicle, index, t }: { vehicle: any; index: number; t: (k: string) => string }) {
  const images = vehicle.images?.length ? vehicle.images : ["/placeholder-car.jpg"];
  const isAvailable = vehicle.status !== "unavailable";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <Link href={`/vehicles/${vehicle.id}`} className="block">
        <div className="relative h-52 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <Image
            src={images[0]}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            {vehicle.isFeatured && (
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                {t("Featured")}
              </span>
            )}
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg ${
              isAvailable ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
            }`}>
              {isAvailable ? t("Available") : t("Booked")}
            </span>
          </div>
          {vehicle.rating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              {vehicle.rating}
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{vehicle.year}</p>
          <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
            {vehicle.transmission && (
              <span className="flex items-center gap-1"><Settings className="h-3.5 w-3.5" />{vehicle.transmission}</span>
            )}
            {vehicle.fuelType && (
              <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" />{vehicle.fuelType}</span>
            )}
            {vehicle.seats && (
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{vehicle.seats}</span>
            )}
            {vehicle.mileage && (
              <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />{vehicle.mileage.toLocaleString()} km</span>
            )}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-2xl font-bold text-yellow-500">{formatCurrency(vehicle.dailyRate)}<span className="text-sm font-normal text-gray-400">{t("/day")}</span></span>
            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400 group-hover:underline">{t("View →")}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function VehicleSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-200 dark:bg-gray-800" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
        <div className="flex gap-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-12" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-10" />
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
      </div>
    </div>
  );
}

export function PopularVehicles() {
  const { t: translate } = useTranslations();
  const { data, isLoading, error } = useQuery({
    queryKey: ["vehicles", "featured"],
    queryFn: () => getVehicles({ isFeatured: true, limit: 8 }),
  });

  const vehicles = data?.vehicles || data?.data || [];

  return (
    <section className="py-20 md:py-28 bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-yellow-500 mb-3">{translate("Premium Selection")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{translate("Popular Luxury Cars")}</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            {translate("Browse our most sought-after vehicles, handpicked for an unmatched driving experience.")}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <VehicleSkeleton key={i} />)
            : vehicles.slice(0, 8).map((v: any, i: number) => (
                <VehicleCard key={v.id} vehicle={v} index={i} t={translate} />
              ))}
        </div>

        {!isLoading && !error && vehicles.length === 0 && (
          <p className="text-center text-gray-400 py-12">{translate("No vehicles available yet.")}</p>
        )}

        {error && (
          <p className="text-center text-red-400 py-12">{translate("Failed to load vehicles. Please try again later.")}</p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center mt-10"
        >
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30"
          >
            {translate("View All Vehicles")}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
