/**
 * Component Validation
 * Input validation for component operations
 */

import type { CreateComponentRequest, UpdateComponentRequest, ComponentFilters } from "../types/component.types.js";

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Validate component creation data
 */
export function validateCreateComponent(data: any): ValidationResult<CreateComponentRequest> {
  const errors: string[] = [];

  // Name validation
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("Component name is required");
  } else if (data.name.trim().length < 3) {
    errors.push("Component name must be at least 3 characters");
  } else if (data.name.trim().length > 200) {
    errors.push("Component name must be less than 200 characters");
  }

  // SKU validation (optional)
  if (data.sku !== undefined && data.sku !== null) {
    if (typeof data.sku !== "string" || data.sku.trim().length === 0) {
      errors.push("SKU must be a non-empty string");
    } else if (data.sku.trim().length > 50) {
      errors.push("SKU must be less than 50 characters");
    }
  }

  // Price validation
  if (data.unitPriceCents === undefined || data.unitPriceCents === null) {
    errors.push("Unit price is required");
  } else if (typeof data.unitPriceCents !== "number" || isNaN(data.unitPriceCents)) {
    errors.push("Unit price must be a number");
  } else if (data.unitPriceCents < 0) {
    errors.push("Unit price cannot be negative");
  } else if (data.unitPriceCents > 100000000) {
    // Max price 10 lakh rupees
    errors.push("Unit price is too high");
  }

  // Stock quantity validation (optional)
  if (data.stockQuantity !== undefined && data.stockQuantity !== null) {
    if (typeof data.stockQuantity !== "number" || isNaN(data.stockQuantity)) {
      errors.push("Stock quantity must be a number");
    } else if (data.stockQuantity < 0) {
      errors.push("Stock quantity cannot be negative");
    } else if (!Number.isInteger(data.stockQuantity)) {
      errors.push("Stock quantity must be an integer");
    }
  }

  // Description validation (optional)
  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== "string") {
      errors.push("Description must be a string");
    } else if (data.description.length > 5000) {
      errors.push("Description must be less than 5000 characters");
    }
  }

  // URL validations (optional)
  if (data.vendorLink && typeof data.vendorLink === "string") {
    try {
      new URL(data.vendorLink);
    } catch {
      errors.push("Vendor link must be a valid URL");
    }
  }

  if (data.imageUrl && typeof data.imageUrl === "string") {
    try {
      new URL(data.imageUrl);
    } catch {
      errors.push("Image URL must be a valid URL");
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: errors.join(", "),
    };
  }

  const result: CreateComponentRequest = {
    name: data.name.trim(),
    unitPriceCents: Math.round(data.unitPriceCents),
  };

  if (data.sku?.trim()) result.sku = data.sku.trim();
  if (data.description?.trim()) result.description = data.description.trim();
  if (data.typicalUseCase?.trim()) result.typicalUseCase = data.typicalUseCase.trim();
  if (data.vendorLink?.trim()) result.vendorLink = data.vendorLink.trim();
  if (data.imageUrl?.trim()) result.imageUrl = data.imageUrl.trim();
  if (data.stockQuantity !== undefined) result.stockQuantity = Math.round(data.stockQuantity);
  if (data.isActive !== undefined) result.isActive = Boolean(data.isActive);

  return {
    success: true,
    data: result,
  };
}

/**
 * Validate component update data
 */
export function validateUpdateComponent(data: any): ValidationResult<UpdateComponentRequest> {
  const errors: string[] = [];

  // At least one field must be provided
  if (Object.keys(data).length === 0) {
    errors.push("At least one field must be provided for update");
  }

  // Name validation (if provided)
  if (data.name !== undefined) {
    if (typeof data.name !== "string" || data.name.trim().length === 0) {
      errors.push("Component name must be a non-empty string");
    } else if (data.name.trim().length < 3) {
      errors.push("Component name must be at least 3 characters");
    } else if (data.name.trim().length > 200) {
      errors.push("Component name must be less than 200 characters");
    }
  }

  // SKU validation (if provided)
  if (data.sku !== undefined && data.sku !== null) {
    if (typeof data.sku !== "string" || data.sku.trim().length === 0) {
      errors.push("SKU must be a non-empty string");
    } else if (data.sku.trim().length > 50) {
      errors.push("SKU must be less than 50 characters");
    }
  }

  // Price validation (if provided)
  if (data.unitPriceCents !== undefined) {
    if (typeof data.unitPriceCents !== "number" || isNaN(data.unitPriceCents)) {
      errors.push("Unit price must be a number");
    } else if (data.unitPriceCents < 0) {
      errors.push("Unit price cannot be negative");
    } else if (data.unitPriceCents > 100000000) {
      errors.push("Unit price is too high");
    }
  }

  // Stock quantity validation (if provided)
  if (data.stockQuantity !== undefined) {
    if (typeof data.stockQuantity !== "number" || isNaN(data.stockQuantity)) {
      errors.push("Stock quantity must be a number");
    } else if (data.stockQuantity < 0) {
      errors.push("Stock quantity cannot be negative");
    } else if (!Number.isInteger(data.stockQuantity)) {
      errors.push("Stock quantity must be an integer");
    }
  }

  // Description validation (if provided)
  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== "string") {
      errors.push("Description must be a string");
    } else if (data.description.length > 5000) {
      errors.push("Description must be less than 5000 characters");
    }
  }

  // URL validations (if provided)
  if (data.vendorLink !== undefined && data.vendorLink && typeof data.vendorLink === "string") {
    try {
      new URL(data.vendorLink);
    } catch {
      errors.push("Vendor link must be a valid URL");
    }
  }

  if (data.imageUrl !== undefined && data.imageUrl && typeof data.imageUrl === "string") {
    try {
      new URL(data.imageUrl);
    } catch {
      errors.push("Image URL must be a valid URL");
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: errors.join(", "),
    };
  }

  const updateData: UpdateComponentRequest = {};

  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.sku !== undefined) updateData.sku = data.sku?.trim() || null;
  if (data.description !== undefined) updateData.description = data.description?.trim() || null;
  if (data.typicalUseCase !== undefined) updateData.typicalUseCase = data.typicalUseCase?.trim() || null;
  if (data.vendorLink !== undefined) updateData.vendorLink = data.vendorLink?.trim() || null;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl?.trim() || null;
  if (data.unitPriceCents !== undefined) updateData.unitPriceCents = Math.round(data.unitPriceCents);
  if (data.stockQuantity !== undefined) updateData.stockQuantity = Math.round(data.stockQuantity);
  if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

  return {
    success: true,
    data: updateData,
  };
}

/**
 * Validate component filters
 */
export function validateComponentFilters(query: any): ValidationResult<ComponentFilters> {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));

  const sortBy = ["name", "price", "stock", "createdAt"].includes(query.sortBy)
    ? query.sortBy
    : "createdAt";

  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const filters: ComponentFilters = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  if (query.search && typeof query.search === "string") {
    filters.search = query.search.trim();
  }

  if (query.isActive !== undefined) {
    filters.isActive = query.isActive === "true" || query.isActive === true;
  }

  if (query.minPrice) {
    const minPrice = parseInt(query.minPrice);
    if (!isNaN(minPrice) && minPrice >= 0) {
      filters.minPrice = minPrice;
    }
  }

  if (query.maxPrice) {
    const maxPrice = parseInt(query.maxPrice);
    if (!isNaN(maxPrice) && maxPrice >= 0) {
      filters.maxPrice = maxPrice;
    }
  }

  if (query.inStock !== undefined) {
    filters.inStock = query.inStock === "true" || query.inStock === true;
  }

  return {
    success: true,
    data: filters,
  };
}
