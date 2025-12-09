/**
 * Component Feature Types
 * Type definitions for component management
 */

export interface CreateComponentRequest {
  name: string;
  sku?: string;
  description?: string;
  typicalUseCase?: string;
  vendorLink?: string;
  imageUrl?: string;
  unitPriceCents: number;
  stockQuantity?: number;
  isActive?: boolean;
}

export interface UpdateComponentRequest {
  name?: string;
  sku?: string;
  description?: string;
  typicalUseCase?: string;
  vendorLink?: string;
  imageUrl?: string;
  unitPriceCents?: number;
  stockQuantity?: number;
  isActive?: boolean;
}

export interface ComponentFilters {
  search?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "name" | "price" | "stock" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface ComponentResponse {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  typicalUseCase: string | null;
  vendorLink: string | null;
  imageUrl: string | null;
  unitPriceCents: number;
  unitPrice: number; // Formatted price in rupees
  stockQuantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedComponentsResponse {
  components: ComponentResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ComponentStockUpdate {
  componentId: string;
  quantity: number;
  operation: "add" | "subtract" | "set";
}
