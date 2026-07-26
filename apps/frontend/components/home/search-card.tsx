"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar, Clock, Users, ChevronDown } from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";

const locations = [
  { value: "casablanca", label: "Casablanca" },
  { value: "rabat", label: "Rabat" },
  { value: "marrakech", label: "Marrakech" },
  { value: "tanger", label: "Tanger" },
  { value: "fes", label: "Fès" },
  { value: "agadir", label: "Agadir" },
  { value: "essaouira", label: "Essaouira" },
];

const categoryValues = ["", "Sedan", "SUV", "Luxury", "Sports", "Convertible", "Electric"] as const;
const passengersOptions = [1, 2, 3, 4, 5, 6, 7, 8];

function generateHours() {
  const hours: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      hours.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return hours;
}

const timeOptions = generateHours();

export function SearchCard() {
  const { t } = useTranslations();
  const router = useRouter();
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const locationRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({
    pickupLocation: "",
    pickupDate: "",
    pickupTime: "10:00",
    returnDate: "",
    returnTime: "10:00",
    category: "",
    passengers: "",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredLocations = locations.filter((l) =>
    l.label.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const update = (field: string, value: string) => setFilters((f) => ({ ...f, [field]: value }));

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.pickupLocation) params.set("pickupLocation", filters.pickupLocation);
    if (filters.pickupDate) params.set("pickupDate", filters.pickupDate);
    if (filters.pickupTime) params.set("pickupTime", filters.pickupTime);
    if (filters.returnDate) params.set("returnDate", filters.returnDate);
    if (filters.returnTime) params.set("returnTime", filters.returnTime);
    if (filters.category) params.set("category", filters.category);
    if (filters.passengers) params.set("seats", filters.passengers);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    router.push(`/vehicles?${params.toString()}`);
  };

  const selectedLocationLabel = locations.find((l) => l.value === filters.pickupLocation)?.label || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="backdrop-blur-xl bg-white/10  rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div ref={locationRef} className="relative">
            <label className="block text-xs font-medium text-white/80 mb-1">{t("Pickup Location")}</label>
            <button
              type="button"
              onClick={() => setLocationOpen(!locationOpen)}
              className="w-full flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white text-left transition-colors"
            >
              <MapPin className="h-4 w-4 shrink-0 text-yellow-400" />
              <span className="flex-1 truncate">{selectedLocationLabel || t("Select location")}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${locationOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {locationOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute z-50 top-full left-0 right-0 mt-1 bg-white  rounded-xl shadow-xl border overflow-hidden"
                >
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder={t("Search locations...")}
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-gray-100  rounded-lg outline-none text-gray-900 "
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-auto">
                    {filteredLocations.map((loc) => (
                      <button
                        key={loc.value}
                        type="button"
                        onClick={() => { update("pickupLocation", loc.value); setLocationOpen(false); setLocationSearch(""); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-100  ${
                          filters.pickupLocation === loc.value ? "bg-yellow-50  text-yellow-700 " : "text-gray-700 "
                        }`}
                      >
                        <MapPin className="h-4 w-4 shrink-0" />
                        {t(loc.label)}
                      </button>
                    ))}
                    {filteredLocations.length === 0 && (
                      <p className="px-4 py-3 text-sm text-gray-400">{t("No locations found")}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">{t("Pickup Date")}</label>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2.5">
              <Calendar className="h-4 w-4 shrink-0 text-yellow-400" />
              <input
                type="date"
                value={filters.pickupDate}
                onChange={(e) => update("pickupDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="flex-1 bg-transparent text-sm text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">{t("Return Date")}</label>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2.5">
              <Calendar className="h-4 w-4 shrink-0 text-yellow-400" />
              <input
                type="date"
                value={filters.returnDate}
                onChange={(e) => update("returnDate", e.target.value)}
                min={filters.pickupDate || new Date().toISOString().split("T")[0]}
                className="flex-1 bg-transparent text-sm text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">{t("Category")}</label>
            <select
              value={filters.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white outline-none appearance-none cursor-pointer"
            >
              {categoryValues.map((c) => (
                <option key={c} value={c} className="bg-gray-900 text-white">
                  {c ? t(c) : t("All")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">{t("Pickup Time")}</label>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2.5">
              <Clock className="h-4 w-4 shrink-0 text-yellow-400" />
              <select
                value={filters.pickupTime}
                onChange={(e) => update("pickupTime", e.target.value)}
                className="flex-1 bg-transparent text-sm text-white outline-none appearance-none cursor-pointer"
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t} className="bg-gray-900 text-white">{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">{t("Return Time")}</label>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2.5">
              <Clock className="h-4 w-4 shrink-0 text-yellow-400" />
              <select
                value={filters.returnTime}
                onChange={(e) => update("returnTime", e.target.value)}
                className="flex-1 bg-transparent text-sm text-white outline-none appearance-none cursor-pointer"
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t} className="bg-gray-900 text-white">{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">{t("Passengers")}</label>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2.5">
              <Users className="h-4 w-4 shrink-0 text-yellow-400" />
              <select
                value={filters.passengers}
                onChange={(e) => update("passengers", e.target.value)}
                className="flex-1 bg-transparent text-sm text-white outline-none appearance-none cursor-pointer"
              >
                <option value="" className="bg-gray-900 text-white">{t("Any")}</option>
                {passengersOptions.map((n) => (
                  <option key={n} value={n} className="bg-gray-900 text-white">{n}+</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">{t("Price Range")}</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder={t("Min")}
                value={filters.minPrice}
                onChange={(e) => update("minPrice", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none"
              />
              <span className="text-white/40">—</span>
              <input
                type="number"
                placeholder={t("Max")}
                value={filters.maxPrice}
                onChange={(e) => update("maxPrice", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none"
              />
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSearch}
          className="w-full md:w-auto md:mx-auto block bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold text-lg py-3.5 px-12 rounded-xl shadow-lg shadow-yellow-500/25 transition-all"
        >
          <Search className="inline h-5 w-5 mr-2 -mt-0.5" />
          {t("Search Vehicles")}
        </motion.button>
      </div>
    </motion.div>
  );
}