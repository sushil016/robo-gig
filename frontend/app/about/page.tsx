import { SiteInfoPage } from "@/features/static-pages/components/SiteInfoPage";
import { staticPages } from "@/features/static-pages/data/static-pages";

export default function AboutPage() {
  return <SiteInfoPage {...staticPages.about} />;
}
