import { SiteInfoPage } from "@/components/static/SiteInfoPage";
import { staticPages } from "@/lib/static-pages";

export default function TermsPage() {
  return <SiteInfoPage {...staticPages.terms} />;
}
