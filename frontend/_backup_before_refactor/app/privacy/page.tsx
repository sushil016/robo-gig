import { SiteInfoPage } from "@/components/static/SiteInfoPage";
import { staticPages } from "@/lib/static-pages";

export default function PrivacyPage() {
  return <SiteInfoPage {...staticPages.privacy} />;
}
