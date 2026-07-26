"use client";

import { motion } from "framer-motion";
import { Percent, Gift, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/use-translations";

export function SpecialOffers() {
  const { t } = useTranslations();

  const offers = [
    {
      icon: Percent,
      title: t("Weekly Saver"),
      description: t("Book 7+ days and save up to 25% on your total rental."),
      gradient: "from-yellow-500 via-yellow-400 to-orange-400",
      badge: t("Save 25%"),
    },
    {
      icon: Gift,
      title: t("Weekend Getaway"),
      description: t("Pick up Thursday, return Monday — pay for only 3 days."),
      gradient: "from-purple-500 via-pink-500 to-red-500",
      badge: t("3 for 4"),
    },
    {
      icon: Zap,
      title: t("First Rental"),
      description: t("New customers get a special discount on their first booking."),
      gradient: "from-blue-500 via-cyan-400 to-teal-400",
      badge: t("New User"),
    },
    {
      icon: Clock,
      title: t("Last Minute"),
      description: t("Book within 48 hours and enjoy reduced rates on select vehicles."),
      gradient: "from-emerald-500 via-green-400 to-lime-400",
      badge: t("Flash Deal"),
    },
  ];

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
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-yellow-500 mb-3">{t("Special Offers")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900  mb-4">{t("Drive More, Pay Less")}</h2>
          <p className="text-gray-500  max-w-xl mx-auto">
            {t("Exclusive deals designed to give you the best value on every rental.")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {offers.map((offer, i) => (
            <motion.div
              key={offer.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl p-6 md:p-8 cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${offer.gradient} opacity-90`} />
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
              <div className="relative z-10 flex items-start gap-5">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 shrink-0">
                  <offer.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-bold text-white">{offer.title}</h3>
                    <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                      {offer.badge}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">{offer.description}</p>
                  <Link
                    href="/vehicles"
                    className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-all"
                  >
                    {t("Book now")}
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}