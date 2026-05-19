// Type definitions for catalog navigation — used throughout the app.
// The actual category tree is fetched live from /api/components/categories/tree.
// These types represent the shape of data used in nav components.

export type CatalogSubcategory = {
  name: string;
  href: string;
};

export type CatalogNavigationGroup = {
  name: string;
  href: string;
  description: string;
  subcategories: CatalogSubcategory[];
};

// Reference entry — shows what fields to fill when adding a product in admin.
// Do NOT add real entries here. Categories are derived from product.category in the DB.
export const catalogNavigationGroups: CatalogNavigationGroup[] = [
  {
    name: "Development Boards",
    href: "/components?category=Development%20Boards",
    description: "Arduino, ESP32, Raspberry Pi, STM32, and controller boards.",
    subcategories: [
      { name: "Arduino Boards", href: "/components?category=Development%20Boards&subcategory=Arduino%20Boards" },
    ],
  },
];
