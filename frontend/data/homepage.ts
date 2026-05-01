import { catalogNavigationGroups } from "./catalog-navigation";

export type HomeIconName =
  | "battery"
  | "boxes"
  | "brain"
  | "cpu"
  | "factory"
  | "film"
  | "gauge"
  | "graduation"
  | "microscope"
  | "package"
  | "plane"
  | "radar"
  | "rocket"
  | "shield"
  | "sparkles"
  | "store"
  | "wrench";

export const homeHero = {
  eyebrow: "B2C and B2B electronics builds",
  title: "Complete robotics, IoT, drone, and AI project builds.",
  description:
    "Buy electronics parts, course kits, Robomaniac books, BlockSquare software, or get a custom hardware-software project built for student, institution, or company needs.",
  image: "/homepage/components.png",
  primaryCta: { label: "Browse All Categories", href: "/categories" },
  secondaryCta: { label: "Custom Project Services", href: "/projects" },
};

export const serviceTiles = [
  {
    title: "All Electronics",
    copy: "Small parts to complete assemblies",
    href: "/categories",
    icon: "cpu",
    tone: "bg-blue-50 text-blue-800",
  },
  {
    title: "Custom Projects",
    copy: "Student, institution, and company builds",
    href: "/projects",
    icon: "brain",
    tone: "bg-cyan-50 text-cyan-800",
  },
  {
    title: "Robomaniac Store",
    copy: "Kits, books, and BlockSquare",
    href: "/robomaniac-store",
    icon: "store",
    tone: "bg-sky-50 text-sky-800",
  },
  {
    title: "Drones & Aero",
    copy: "UAV, satellite, and aero models",
    href: "/components?category=Drones%20%26%20Aerospace",
    icon: "plane",
    tone: "bg-indigo-50 text-indigo-800",
  },
] satisfies Array<{
  title: string;
  copy: string;
  href: string;
  icon: HomeIconName;
  tone: string;
}>;

export const featuredCategories = [
  { ...catalogNavigationGroups[0], icon: "cpu" },
  { ...catalogNavigationGroups[1], icon: "gauge" },
  { ...catalogNavigationGroups[2], icon: "boxes" },
  { ...catalogNavigationGroups[3], icon: "wrench" },
  { ...catalogNavigationGroups[4], icon: "battery" },
  { ...catalogNavigationGroups[7], icon: "microscope" },
  { ...catalogNavigationGroups[5], icon: "plane" },
  { ...catalogNavigationGroups[6], icon: "store" },
] satisfies Array<(typeof catalogNavigationGroups)[number] & { icon: HomeIconName }>;

export const bestSellingProducts = [
  { name: "Arduino Uno R3", price: "₹1,199", stock: "50 in stock" },
  { name: "ESP32 DevKit V1", price: "₹399", stock: "60 in stock" },
  { name: "HC-SR04 Ultrasonic Sensor", price: "₹99", stock: "200 in stock" },
  { name: "L298N Motor Driver", price: "₹149", stock: "75 in stock" },
  { name: "SG90 Micro Servo Motor", price: "₹129", stock: "150 in stock" },
  { name: "Robomaniac Robotics Course Kit", price: "₹6,999", stock: "Robomaniac" },
];

export const projectHighlights = [
  {
    title: "Arduino Line Following Robot",
    meta: "Beginner • ₹1,499 • 3 hours",
    href: "/projects",
  },
  {
    title: "Obstacle Avoiding Robot Car",
    meta: "Beginner • ₹1,399 • 2.5 hours",
    href: "/projects",
  },
  {
    title: "Self-Balancing Robot",
    meta: "Advanced • ₹1,999 • 7 hours",
    href: "/projects",
  },
];

export const services = [
  {
    title: "Electronics Components",
    copy: "Small passives, semiconductors, modules, displays, tools, and full assemblies.",
    icon: "cpu",
  },
  {
    title: "Student Projects",
    copy: "Final year, competition, science fair, prototype, and research builds.",
    icon: "graduation",
  },
  {
    title: "Institution Labs",
    copy: "Robotics, IoT, AI, drone, and electronics lab kits for schools and colleges.",
    icon: "factory",
  },
  {
    title: "Company Prototypes",
    copy: "B2B hardware, firmware, IoT dashboards, automation, and custom devices.",
    icon: "brain",
  },
  {
    title: "Aerospace Builds",
    copy: "Drones, satellite models, payload prototypes, and aero modeling planes.",
    icon: "rocket",
  },
  {
    title: "IoT Systems",
    copy: "Sensor networks, dashboards, automation, telemetry, and connected devices.",
    icon: "radar",
  },
  {
    title: "Robotics Programs",
    copy: "Robotics labs, training kits, course kits, robot builds, and BOM planning.",
    icon: "wrench",
  },
  {
    title: "PCB & Manufacturing",
    copy: "PCB support, prototyping, assembly planning, and product-ready electronics.",
    icon: "microscope",
  },
  {
    title: "Robomaniac Products",
    copy: "Lego robotics kits, robotics course kits, AI books, and BlockSquare software.",
    icon: "store",
  },
] satisfies Array<{
  title: string;
  copy: string;
  icon: HomeIconName;
}>;

export const projectVideoSlots = [
  "Robotics project demos",
  "IoT and automation walkthroughs",
  "Drone and aero modeling tests",
];
