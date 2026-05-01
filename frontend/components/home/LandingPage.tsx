import { BestSellersSection } from "./BestSellersSection";
import { CategorySection } from "./CategorySection";
import { FeaturedBuildsSection } from "./FeaturedBuildsSection";
import { HeroSection } from "./HeroSection";
import { ProjectVideosSection } from "./ProjectVideosSection";
import { ServicesSection } from "./ServicesSection";

export function LandingPage() {
  return (
    <div className="bg-white text-slate-950">
      <HeroSection />
      <CategorySection />
      <ServicesSection />
      <ProjectVideosSection />
      <BestSellersSection />
      <FeaturedBuildsSection />
    </div>
  );
}
