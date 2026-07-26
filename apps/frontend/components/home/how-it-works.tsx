"use client";

import { motion } from "framer-motion";
import { Search, ClipboardCheck, Key, Heart } from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";

export function HowItWorks() {
  const { t } = useTranslations();

  const steps = [
    {
      icon: Search,
      title: t("Browse & Select"),
      description: t("Explore our premium fleet and choose the vehicle that fits your style and needs."),
      color: "from-yellow-400 to-yellow-600",
      step: "01",
    },
    {
      icon: ClipboardCheck,
      title: t("Book Instantly"),
      description: t("Fill in your details, pick your dates, and confirm your reservation in seconds."),
      color: "from-blue-400 to-blue-600",
      step: "02",
    },
    {
      icon: Key,
      title: t("Pick Up & Drive"),
      description: t("Collect your vehicle at the chosen location and hit the road with confidence."),
      color: "from-emerald-400 to-emerald-600",
      step: "03",
    },
    {
      icon: Heart,
      title: t("Enjoy & Return"),
      description: t("Enjoy your journey and return the vehicle with our hassle-free drop-off process."),
      color: "from-purple-400 to-purple-600",
      step: "04",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-gray-50  relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-yellow-500 mb-3">{t("How It Works")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900  mb-4">{t("Rent in Four Simple Steps")}</h2>
          <p className="text-gray-500  max-w-xl mx-auto">
            {t("From browsing to returning — we made the process seamless.")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center group"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900  text-white  text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                    {step.step}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900  mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500  leading-relaxed">{step.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[calc(100%-40px)] h-0.5 bg-gradient-to-r from-yellow-400/50 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}