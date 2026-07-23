"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Search, Car, Shield, HeadphonesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const features = [
  { icon: Car, title: "Flotte de Luxe", desc: "Marques Premium" },
  { icon: Shield, title: "Réservation Sécurisée", desc: "Confirmation Rapide" },
  { icon: HeadphonesIcon, title: "Support 24/7", desc: "Toujours Disponible" },
];

const brands = [
  { name: "Mercedes", src: "/brands/mercedes.svg" },
  { name: "BMW", src: "/brands/bmw.svg" },
  { name: "Audi", src: "/brands/audi.svg" },
  { name: "Porsche", src: "/brands/porsche.svg" },
  { name: "Range Rover", src: "/brands/range-rover.svg" },
  { name: "Lamborghini", src: "/brands/lamborghini.svg" },
];

export function Hero() {
  const router = useRouter();
  const [location, setLocation] = useState("Casablanca");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (pickupDate) params.set("pickupDate", pickupDate);
    if (pickupTime) params.set("pickupTime", pickupTime);
    if (returnDate) params.set("returnDate", returnDate);
    router.push(`/vehicles?${params.toString()}`);
  };

  return (
    <>
      <section className="relative w-full overflow-hidden h-[90vh] min-h-[500px] md:min-h-[600px]">
        <motion.div
          className="absolute inset-0 hidden md:block"
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 12, ease: "easeOut", repeat: Infinity, repeatType: "mirror" }}
        >
          <Image src="/banner.png" alt="" fill priority className="object-cover" sizes="100vw" />
        </motion.div>
        <motion.div
          className="absolute inset-0 md:hidden"
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 12, ease: "easeOut", repeat: Infinity, repeatType: "mirror" }}
        >
          <Image src="/banner-mb.png" alt="" fill priority className="object-cover" sizes="100vw" />
        </motion.div>

        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.55) 35%, rgba(0,0,0,.20) 65%, rgba(0,0,0,.10) 100%)",
          }}
        />

        <div className="relative z-20 flex items-center w-full h-full px-4 sm:px-6 lg:px-8" style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div className="w-full max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span
                className="inline-block text-[10px] sm:text-xs font-semibold tracking-[0.15em] mb-4 sm:mb-6 px-4 sm:px-5 py-1.5 sm:py-2"
                style={{
                  background: "rgba(255,255,255,.08)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "9999px",
                  color: "#D4AF37",
                }}
              >
                LOCATION DE VOITURES DE LUXE
              </span>

              <h1 className="text-white font-extrabold leading-[1.1] tracking-tight mb-3 sm:mb-5 text-[30px] sm:text-[42px] lg:text-[72px]">
                Conduisez le Luxe.
                <br />
                Vivez{" "}
                <span style={{ color: "#D4AF37" }}>l&apos;Expérience.</span>
              </h1>

              <p className="text-white/80 mb-6 sm:mb-10 max-w-[520px] text-base sm:text-lg lg:text-xl leading-relaxed">
                Choisissez parmi notre collection exclusive de voitures de luxe et vivez une expérience de conduite inoubliable.
              </p>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                {features.map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,.08)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,.12)",
                    }}
                  >
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "rgba(212,175,55,.15)",
                      }}
                    >
                      <f.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: "#D4AF37" }} />
                    </div>
                    <div>
                      <p className="text-white text-xs sm:text-sm font-semibold leading-tight">{f.title}</p>
                      <p className="text-gray-400 text-[10px] sm:text-xs leading-tight">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="relative z-30 flex justify-center px-3 sm:px-4 md:px-6" style={{ marginTop: "-60px" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          className="w-full"
          style={{
            maxWidth: "1220px",
            background: "rgba(17,17,17,.92)",
            backdropFilter: "blur(16px)",
            borderRadius: "24px",
            padding: "16px",
          }}
        >
          <div className="flex flex-col md:grid md:grid-cols-5 gap-3">
            <div className="md:col-span-1">
              <label className="block text-[10px] sm:text-xs font-medium mb-1" style={{ color: "rgba(255,255,255,.6)" }}>
                Lieu
              </label>
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}
              >
                <MapPin className="h-4 w-4 shrink-0" style={{ color: "#D4AF37" }} />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-white outline-none appearance-none cursor-pointer"
                >
                  <option className="text-black" value="Casablanca">Casablanca</option>
                  <option className="text-black" value="Rabat">Rabat</option>
                  <option className="text-black" value="Marrakech">Marrakech</option>
                  <option className="text-black" value="Tanger">Tanger</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-medium mb-1" style={{ color: "rgba(255,255,255,.6)" }}>
                Date prise en charge
              </label>
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}
              >
                <Calendar className="h-4 w-4 shrink-0" style={{ color: "#D4AF37" }} />
                <input
                  type="date"
                  value={pickupDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-white outline-none"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-medium mb-1" style={{ color: "rgba(255,255,255,.6)" }}>
                Heure
              </label>
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}
              >
                <Clock className="h-4 w-4 shrink-0" style={{ color: "#D4AF37" }} />
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-white outline-none appearance-none cursor-pointer"
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} className="text-black" value={`${String(h).padStart(2, "0")}:00`}>{String(h).padStart(2, "0")}:00</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-medium mb-1" style={{ color: "rgba(255,255,255,.6)" }}>
                Date retour
              </label>
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}
              >
                <Calendar className="h-4 w-4 shrink-0" style={{ color: "#D4AF37" }} />
                <input
                  type="date"
                  value={returnDate}
                  min={pickupDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-white outline-none"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-[10px] sm:text-xs font-medium mb-1 opacity-0 hidden md:block">Search</label>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm font-bold rounded-xl transition-all"
                style={{
                  height: "44px",
                  background: "#D4AF37",
                  color: "#000",
                  borderRadius: "12px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#C69C2F")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#D4AF37")}
              >
                <Search className="h-4 w-4" />
                Rechercher
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8" style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 opacity-60 hover:opacity-100 transition-opacity duration-300">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="h-5 sm:h-6 w-auto grayscale hover:grayscale-0 transition-all duration-300"
              style={{ opacity: 0.6 }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
            >
              <img
                src={brand.src}
                alt={brand.name}
                className="h-full w-auto"
                style={{ filter: "brightness(0) invert(0.8)" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}