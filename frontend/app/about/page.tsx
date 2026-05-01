import { SiteInfoPage } from "@/components/static/SiteInfoPage";
import { staticPages } from "@/lib/static-pages";

export default function AboutPage() {
  return <SiteInfoPage {...staticPages.about} />;
}
