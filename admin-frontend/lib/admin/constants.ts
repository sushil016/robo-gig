import type { ProductForm, ProductType, ProjectForm } from "./types";

const isProduction = process.env.NODE_ENV === "production";
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
const isLocalhostUrl = (url?: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(url || "");

export const API_BASE_URL =
  configuredApiUrl && !(isProduction && isLocalhostUrl(configuredApiUrl))
    ? configuredApiUrl
    : isProduction
      ? "/_/backend"
      : "http://localhost:4000";

export const STOREFRONT_URL =
  configuredAppUrl && !(isProduction && isLocalhostUrl(configuredAppUrl))
    ? configuredAppUrl
    : isProduction
      ? "https://robo-gig.vercel.app"
      : "http://localhost:3000";

export const productTypes: ProductType[] = [
  "ELECTRONICS_COMPONENT",
  "MODULE",
  "SENSOR",
  "DEVELOPMENT_BOARD",
  "MOTOR_ACTUATOR",
  "POWER_BATTERY",
  "TOOL_EQUIPMENT",
  "COURSE_KIT",
  "BOOK",
  "SOFTWARE",
  "CUSTOM_PROJECT_SERVICE",
  "OTHER",
];

export const projectCategories = [
  "IOT",
  "ROBOTICS",
  "DRONE",
  "AUTOMATION",
  "ENVIRONMENT",
  "HEALTH",
  "AGRICULTURE",
  "SECURITY",
  "EDUCATION",
  "AUTOMOTIVE",
  "SMART_HOME",
  "ENERGY",
  "WEARABLES",
  "GAMING",
  "COMMUNICATION",
  "AI_ML",
  "COMPUTER_VISION",
  "OTHER",
];

export const emptyProductForm: ProductForm = {
  id: "",
  name: "",
  sku: "",
  description: "",
  typicalUseCase: "",
  vendorLink: "",
  imageUrl: "",
  category: "Electronics Components",
  subcategory: "General",
  productType: "ELECTRONICS_COMPONENT",
  brand: "",
  tags: "",
  unitPrice: "",
  stockQuantity: "0",
  isBestSeller: false,
  isRobomaniacItem: false,
  isSoftware: false,
  isActive: true,
};

export const emptyProjectForm: ProjectForm = {
  id: "",
  title: "",
  summary: "",
  description: "",
  category: "ROBOTICS",
  difficulty: "BEGINNER",
  youtubeUrl: "",
  estimatedCost: "",
  estimatedBuildTimeMinutes: "",
  isFeatured: false,
  isPublic: true,
};

export const sectionItems = [
  { id: "dashboard", label: "Dashboard", icon: "01" },
  { id: "catalog", label: "Browse Catalog", icon: "02" },
  { id: "products", label: "Products", icon: "03" },
  { id: "categories", label: "Categories", icon: "04" },
  { id: "projects", label: "Projects", icon: "05" },
  { id: "orders", label: "Orders", icon: "06" },
  { id: "media", label: "Images & Media", icon: "07" },
  { id: "settings", label: "Settings", icon: "08" },
] as const;
