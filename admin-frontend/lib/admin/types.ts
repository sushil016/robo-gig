export type ProductType =
  | "ELECTRONICS_COMPONENT"
  | "MODULE"
  | "SENSOR"
  | "DEVELOPMENT_BOARD"
  | "MOTOR_ACTUATOR"
  | "POWER_BATTERY"
  | "TOOL_EQUIPMENT"
  | "COURSE_KIT"
  | "BOOK"
  | "SOFTWARE"
  | "CUSTOM_PROJECT_SERVICE"
  | "OTHER";

export type Product = {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  typicalUseCase: string | null;
  vendorLink: string | null;
  imageUrl: string | null;
  category: string;
  subcategory: string;
  productType: ProductType;
  brand: string | null;
  tags: string[];
  isBestSeller: boolean;
  isRobomaniacItem: boolean;
  isSoftware: boolean;
  unitPriceCents: number;
  stockQuantity: number;
  isActive: boolean;
};

export type ProductListResponse = {
  success: boolean;
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CategoryNode = {
  category: string;
  count: number;
  subcategories: {
    name: string;
    count: number;
    products: Product[];
  }[];
};

export type Project = {
  id: string;
  title: string;
  summary?: string;
  category: string;
  difficulty: string;
  youtubeUrl?: string;
  isFeatured: boolean;
  isPublic: boolean;
};

export type ProjectListResponse = {
  success: boolean;
  data: {
    projects: Project[];
    pagination: {
      total: number;
    };
  };
};

export type AdminOrder = {
  id: string;
  userId: string;
  addressId: string;
  orderType: string;
  status: string;
  totalAmountCents: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
  address?: {
    name: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPriceCents: number;
    subtotalCents: number;
    component?: Product | null;
  }[];
  payments: {
    id: string;
    gateway: string;
    status: string;
    amountCents: number;
  }[];
};

export type AdminOrderListResponse = {
  success: boolean;
  data: AdminOrder[];
};

export type LoginResponse = {
  success: boolean;
  data: {
    user: {
      email: string;
      name: string | null;
      role: string;
    };
    accessToken: string;
  };
};

export type ProductForm = {
  id: string;
  name: string;
  sku: string;
  description: string;
  typicalUseCase: string;
  vendorLink: string;
  imageUrl: string;
  category: string;
  subcategory: string;
  productType: ProductType;
  brand: string;
  tags: string;
  unitPrice: string;
  stockQuantity: string;
  isBestSeller: boolean;
  isRobomaniacItem: boolean;
  isSoftware: boolean;
  isActive: boolean;
};

export type ProjectForm = {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  difficulty: string;
  youtubeUrl: string;
  estimatedCost: string;
  estimatedBuildTimeMinutes: string;
  isFeatured: boolean;
  isPublic: boolean;
};

export type AdminSection =
  | "dashboard"
  | "catalog"
  | "products"
  | "categories"
  | "projects"
  | "orders"
  | "media"
  | "settings";
