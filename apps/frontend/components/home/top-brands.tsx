"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "@/lib/i18n/use-translations";

const brands = [
  { name: "Mercedes-Benz", logo: "/brands/mercedes.svg", width: 200 },
  { name: "BMW", logo: "/brands/bmw.svg", width: 120 },
  { name: "Audi", logo: "/brands/audi.svg", width: 120 },
  { name: "Porsche", logo: "/brands/porsche.svg", width: 180 },
  { name: "Lexus", logo: "/brands/lexus.svg", width: 160 },
  { name: "Range Rover", logo: "/brands/range-rover.svg", width: 200 },
  { name: "Ferrari", logo: "/brands/ferrari.svg", width: 180 },
  { name: "Lamborghini", logo: "/brands/lamborghini.svg", width: 200 },
  { name: "Rolls-Royce", logo: "/brands/rolls-royce.svg", width: 200 },
  { name: "Tesla", logo: "/brands/tesla.svg", width: 160 },
];

export function TopBrands() {
  const { t } = useTranslations();
  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-yellow-500 mb-3">{t("Top Brands")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{t("World-Class Manufacturers")}</h2>
        </motion.div>

        <div className="relative overflow-hidden">
          <div className="flex gap-16 items-center animate-marquee whitespace-nowrap py-4"
            style={{ animation: "marquee 30s linear infinite" }}
          >
            {[...brands, ...brands].map((brand, i) => (
              <motion.div
                key={`${brand.name}-${i}`}
                whileHover={{ scale: 1.1 }}
                className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 opacity-50 hover:opacity-100"
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={brand.width}
                  height={40}
                  className="h-10 w-auto dark:invert"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}