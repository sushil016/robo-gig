import { SiteInfoPage } from "@/features/static-pages/components/SiteInfoPage";
import { staticPages } from "@/features/static-pages/data/static-pages";

export default function PrivacyPage() {
  return <SiteInfoPage {...staticPages.privacy} />;
}
