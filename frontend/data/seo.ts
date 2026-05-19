import { siteConfig } from "@/data/site-config";

export const defaultSeo = {
  title: siteConfig.name,
  description: siteConfig.description,
} as const;
