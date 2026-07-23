"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/use-translations";

export function FooterCTA() {
  const { t } = useTranslations();
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute top-0 left-0 right-0 h-px bg-white/20" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/20" />

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {t("Ready to Hit the Road?")}
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            {t("Join thousands of satisfied customers. Book your premium vehicle in minutes and experience driving at its finest.")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/vehicles"
              className="bg-white text-yellow-600 hover:bg-gray-100 font-bold text-lg px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all"
            >
              {t("Browse Vehicles")}
            </Link>
            <Link
              href="/register"
              className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 font-bold text-lg px-10 py-4 rounded-xl transition-all"
            >
              {t("Create Account")}
            </Link>
          </div>
          <p className="text-white/50 text-sm mt-6">{t("No hidden fees. Free cancellation. 24/7 support.")}</p>
        </motion.div>
      </div>
    </section>
  );
}