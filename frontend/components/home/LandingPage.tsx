import { BestSellersSection } from "./BestSellersSection";
import { CategorySection } from "./CategorySection";
import { FeaturedBuildsSection } from "./FeaturedBuildsSection";
import { HeroSection } from "./HeroSection";
import { ProjectVideosSection } from "./ProjectVideosSection";
import { ServicesSection } from "./ServicesSection";

export function LandingPage() {
  return (
    <div className="bg-[#F5F5DC] text-zinc-950">
      <HeroSection />
      <CategorySection />
      <ServicesSection />
      <ProjectVideosSection />
      <BestSellersSection />
      <FeaturedBuildsSection />
    </div>
  );
}
