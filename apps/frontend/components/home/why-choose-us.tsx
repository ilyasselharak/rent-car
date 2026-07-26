"use client";

import { motion } from "framer-motion";
import { Shield, Headphones, BadgeCheck, ThumbsUp } from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";

export function WhyChooseUs() {
  const { t } = useTranslations();

  const features = [
    {
      icon: BadgeCheck,
      title: t("Premium Fleet"),
      description: t("Every vehicle in our fleet is less than 2 years old and undergoes a rigorous 50-point inspection before each rental."),
      color: "from-yellow-400 to-yellow-600",
    },
    {
      icon: Shield,
      title: t("Full Insurance"),
      description: t("Comprehensive insurance coverage included with every booking — drive with complete peace of mind."),
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: Headphones,
      title: t("24/7 Support"),
      description: t("Our dedicated team is available around the clock to assist you with any questions or roadside emergencies."),
      color: "from-emerald-400 to-emerald-600",
    },
    {
      icon: ThumbsUp,
      title: t("Best Price Guarantee"),
      description: t("Find a lower price elsewhere? We'll match it and give you an additional 5% off your rental."),
      color: "from-purple-400 to-purple-600",
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
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-yellow-500 mb-3">{t("Why Choose Us")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900  mb-4">{t("Designed for Excellence")}</h2>
          <p className="text-gray-500  max-w-xl mx-auto">
            {t("We go beyond car rental — delivering a premium experience at every step.")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group bg-gray-50  rounded-2xl p-6 md:p-8 border border-gray-100  hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/5 transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${f.color} mb-5 shadow-lg`}>
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900  mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500  leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}