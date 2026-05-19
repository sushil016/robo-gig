import { BestSellersSection } from "./BestSellersSection";
import { CategorySection } from "./CategorySection";
import { FeaturedBuildsSection } from "./FeaturedBuildsSection";
import { HeroSection } from "./HeroSection";
import { ProjectVideosSection } from "./ProjectVideosSection";
import { ServicesSection } from "./ServicesSection";

export function LandingPage() {
  return (
    <div className="bg-[#F2F2F0] text-[#222222]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <HeroSection />
      <CategorySection />
      <BestSellersSection />
      <ServicesSection />
      <ProjectVideosSection />
      <FeaturedBuildsSection />
    </div>
  );
}
