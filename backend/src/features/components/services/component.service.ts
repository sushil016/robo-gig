/**
 * Component Service
 * Business logic for component management
 */

import { prisma } from "../../../lib/prisma.js";
import { NotFoundError, ConflictError } from "../../../utils/types.js";
import type {
  CreateComponentRequest,
  UpdateComponentRequest,
  ComponentFilters,
  ComponentResponse,
  PaginatedComponentsResponse,
} from "../types/component.types.js";

/**
 * Format component for response
 */
function formatComponent(component: any): ComponentResponse {
  return {
    id: component.id,
    name: component.name,
    sku: component.sku,
    description: component.description,
    typicalUseCase: component.typicalUseCase,
    vendorLink: component.vendorLink,
    imageUrl: component.imageUrl,
    unitPriceCents: component.unitPriceCents,
    unitPrice: component.unitPriceCents / 100, // Convert to rupees
    stockQuantity: component.stockQuantity,
    isActive: component.isActive,
    createdAt: component.createdAt,
    updatedAt: component.updatedAt,
  };
}

/**
 * Create a new component (Admin only)
 */
export async function createComponent(data: CreateComponentRequest): Promise<ComponentResponse> {
  // Check if SKU already exists
  if (data.sku) {
    const existing = await prisma.component.findUnique({
      where: { sku: data.sku },
    });

    if (existing) {
      throw new ConflictError(`Component with SKU "${data.sku}" already exists`);
    }
  }

  const component = await prisma.component.create({
    data: {
      name: data.name,
      sku: data.sku || null,
      description: data.description || null,
      typicalUseCase: data.typicalUseCase || null,
      vendorLink: data.vendorLink || null,
      imageUrl: data.imageUrl || null,
      unitPriceCents: data.unitPriceCents,
      stockQuantity: data.stockQuantity || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });

  console.log(`✅ Component created: ${component.id} - ${component.name}`);

  return formatComponent(component);
}

/**
 * Get all components with filters and pagination
 */
export async function getComponents(
  filters: ComponentFilters
): Promise<PaginatedComponentsResponse> {
  const {
    search,
    isActive,
    minPrice,
    maxPrice,
    inStock,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.unitPriceCents = {};
    if (minPrice !== undefined) where.unitPriceCents.gte = minPrice;
    if (maxPrice !== undefined) where.unitPriceCents.lte = maxPrice;
  }

  if (inStock) {
    where.stockQuantity = { gt: 0 };
  }

  // Build orderBy clause
  const orderBy: any = {};
  if (sortBy === "price") {
    orderBy.unitPriceCents = sortOrder;
  } else if (sortBy === "stock") {
    orderBy.stockQuantity = sortOrder;
  } else if (sortBy === "name") {
    orderBy.name = sortOrder;
  } else {
    orderBy.createdAt = sortOrder;
  }

  // Get total count
  const total = await prisma.component.count({ where });

  // Get paginated results
  const components = await prisma.component.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    components: components.map(formatComponent),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Get a single component by ID
 */
export async function getComponentById(id: string): Promise<ComponentResponse> {
  const component = await prisma.component.findUnique({
    where: { id },
  });

  if (!component) {
    throw new NotFoundError("Component not found");
  }

  return formatComponent(component);
}

/**
 * Get a single component by SKU
 */
export async function getComponentBySku(sku: string): Promise<ComponentResponse> {
  const component = await prisma.component.findUnique({
    where: { sku },
  });

  if (!component) {
    throw new NotFoundError("Component not found");
  }

  return formatComponent(component);
}

/**
 * Update a component (Admin only)
 */
export async function updateComponent(
  id: string,
  data: UpdateComponentRequest
): Promise<ComponentResponse> {
  // Check if component exists
  const existing = await prisma.component.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError("Component not found");
  }

  // Check if new SKU already exists
  if (data.sku && data.sku !== existing.sku) {
    const skuExists = await prisma.component.findUnique({
      where: { sku: data.sku },
    });

    if (skuExists) {
      throw new ConflictError(`Component with SKU "${data.sku}" already exists`);
    }
  }

  const component = await prisma.component.update({
    where: { id },
    data,
  });

  console.log(`✅ Component updated: ${component.id} - ${component.name}`);

  return formatComponent(component);
}

/**
 * Delete a component (Admin only)
 * Soft delete by setting isActive to false
 */
export async function deleteComponent(id: string): Promise<{ message: string }> {
  const existing = await prisma.component.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError("Component not found");
  }

  // Soft delete
  await prisma.component.update({
    where: { id },
    data: { isActive: false },
  });

  console.log(`🗑️  Component deleted (soft): ${id}`);

  return { message: "Component deleted successfully" };
}

/**
 * Update component stock
 */
export async function updateComponentStock(
  id: string,
  quantity: number,
  operation: "add" | "subtract" | "set" = "set"
): Promise<ComponentResponse> {
  const existing = await prisma.component.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError("Component not found");
  }

  let newStock = existing.stockQuantity;

  if (operation === "set") {
    newStock = quantity;
  } else if (operation === "add") {
    newStock += quantity;
  } else if (operation === "subtract") {
    newStock -= quantity;
    if (newStock < 0) newStock = 0;
  }

  const component = await prisma.component.update({
    where: { id },
    data: { stockQuantity: newStock },
  });

  console.log(`📦 Stock updated for ${component.name}: ${newStock} units`);

  return formatComponent(component);
}

/**
 * Get low stock components (stock below threshold)
 */
export async function getLowStockComponents(threshold: number = 10): Promise<ComponentResponse[]> {
  const components = await prisma.component.findMany({
    where: {
      isActive: true,
      stockQuantity: {
        lte: threshold,
        gt: 0,
      },
    },
    orderBy: {
      stockQuantity: "asc",
    },
  });

  return components.map(formatComponent);
}

/**
 * Get out of stock components
 */
export async function getOutOfStockComponents(): Promise<ComponentResponse[]> {
  const components = await prisma.component.findMany({
    where: {
      isActive: true,
      stockQuantity: 0,
    },
    orderBy: {
      name: "asc",
    },
  });

  return components.map(formatComponent);
}
