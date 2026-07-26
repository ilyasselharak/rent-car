"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";

export function Reviews() {
  const { t } = useTranslations();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const reviews = [
    { name: t("Ahmed Bennis"), location: "Casablanca", avatar: "/avatars/avatar-1.jpg", rating: 5, text: t("Exceptional service from start to finish. The Mercedes S-Class was immaculate, and the pickup process took less than 10 minutes. Will definitely be using RentCar again."), vehicle: t("Mercedes-Benz S-Class") },
    { name: t("Sarah Jenkins"), location: "Marrakech", avatar: "/avatars/avatar-2.jpg", rating: 5, text: t("Rented a Porsche Cayenne for our family trip to Marrakech. The car was spotless, fully fueled, and drove like a dream. The team went above and beyond."), vehicle: t("Porsche Cayenne") },
    { name: t("Youssef El Amrani"), location: "Rabat", avatar: "/avatars/avatar-3.jpg", rating: 4, text: t("Great selection of luxury vehicles at reasonable prices. The online booking process was smooth, and the car was ready on time. Highly recommended for business travelers."), vehicle: t("Audi A8") },
    { name: t("Emily Chen"), location: "Tangier", avatar: "/avatars/avatar-4.jpg", rating: 5, text: t("I've rented from many companies around the world, and RentCar sets a new standard. The BMW i7 was brand new, and the customer service was outstanding."), vehicle: t("BMW i7") },
    { name: t("Omar Benali"), location: "Fes", avatar: "/avatars/avatar-5.jpg", rating: 5, text: t("The VIP experience package is worth every dirham. We were greeted at the airport, the paperwork was handled in the lounge, and we drove off in a beautiful Range Rover Sport."), vehicle: t("Range Rover Sport") },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      next();
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const next = () => {
    setDirection(1);
    setCurrent((c) => (c + 1) % reviews.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + reviews.length) % reviews.length);
  };

  const goTo = (i: number) => {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
  };

  const r = reviews[current]!;

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
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-yellow-500 mb-3">{t("Testimonials")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900  mb-4">{t("Trusted by Thousands")}</h2>
          <p className="text-gray-500  max-w-xl mx-auto">
            {t("Hear from our customers about their RentCar experience.")}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto relative">
          <div className="relative min-h-[260px] flex items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full"
              >
                <div className="text-center px-4">
                  <Quote className="h-10 w-10 text-yellow-500/30 mx-auto mb-4" />
                  <p className="text-lg md:text-xl text-gray-700  leading-relaxed italic mb-6">
                    &ldquo;{r.text}&rdquo;
                  </p>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 ">{r.name}</p>
                    <p className="text-sm text-gray-400">{r.location} — {r.vehicle}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={prev} className="p-2 rounded-full border border-gray-200  hover:bg-gray-100  transition-colors">
              <ChevronLeft className="h-5 w-5 text-gray-600 " />
            </button>
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === current ? "bg-yellow-500 w-6" : "bg-gray-300 "
                  }`}
                />
              ))}
            </div>
            <button onClick={next} className="p-2 rounded-full border border-gray-200  hover:bg-gray-100  transition-colors">
              <ChevronRight className="h-5 w-5 text-gray-600 " />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}