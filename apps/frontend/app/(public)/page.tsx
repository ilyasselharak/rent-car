import { Hero } from "@/components/home/hero";
import { PopularVehicles } from "@/components/home/popular-vehicles";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { TopBrands } from "@/components/home/top-brands";
import { SpecialOffers } from "@/components/home/special-offers";
import { HowItWorks } from "@/components/home/how-it-works";
import { Reviews } from "@/components/home/reviews";
import { LatestVehicles } from "@/components/home/latest-vehicles";
import { FooterCTA } from "@/components/home/footer-cta";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <PopularVehicles />
      <WhyChooseUs />
      <TopBrands />
      <SpecialOffers />
      <HowItWorks />
      <Reviews />
      <LatestVehicles />
      <FooterCTA />
    </main>
  );
}
