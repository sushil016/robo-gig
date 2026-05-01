/**
 * Component Upload Controller
 * Handles component creation with image uploads to Azure Blob Storage
 */

import type { Request, Response, NextFunction } from 'express';
import { uploadFileToAzure, FileType, UPLOAD_LIMITS } from '../../../services/azure-storage.service.js';
import * as componentService from '../services/component.service.js';

// Define multer file structure
interface MulterFiles {
  images?: Express.Multer.File[];
  thumbnail?: Express.Multer.File[];
}

/**
 * Create component with image uploads
 * POST /api/components/upload
 * Access: Admin only
 */
export async function handleCreateComponentWithUploads(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const files = req.files as MulterFiles;
    const {
      name,
      sku,
      description,
      typicalUseCase,
      vendorLink,
      category,
      subcategory,
      productType,
      brand,
      tags,
      isBestSeller,
      isRobomaniacItem,
      isSoftware,
      unitPriceCents,
      stockQuantity,
      isActive,
    } = req.body;

    // Validate required fields
    if (!name) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: name',
      });
      return;
    }

    if (!unitPriceCents) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: unitPriceCents',
      });
      return;
    }

    // Validate file counts
    const imageFiles = files?.images || [];
    const thumbnailFile = files?.thumbnail?.[0];

    if (imageFiles.length > UPLOAD_LIMITS.MAX_PROJECT_IMAGES) {
      res.status(400).json({
        success: false,
        error: `Maximum ${UPLOAD_LIMITS.MAX_PROJECT_IMAGES} images allowed`,
      });
      return;
    }

    // Validate at least one image is provided
    if (!thumbnailFile && imageFiles.length === 0) {
      res.status(400).json({
        success: false,
        error: 'At least one image (thumbnail or gallery image) is required',
      });
      return;
    }

    // Upload thumbnail if provided
    let thumbnailUrl: string | null = null;
    if (thumbnailFile) {
      const thumbnailResult = await uploadFileToAzure(
        thumbnailFile.buffer,
        thumbnailFile.originalname,
        thumbnailFile.mimetype,
        FileType.COMPONENT_IMAGE
      );

      if ('error' in thumbnailResult) {
        res.status(500).json({
          success: false,
          error: `Thumbnail upload failed: ${thumbnailResult.error}`,
        });
        return;
      }

      thumbnailUrl = thumbnailResult.url;
    }

    // Upload component images if provided
    const imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        const imageResult = await uploadFileToAzure(
          imageFile.buffer,
          imageFile.originalname,
          imageFile.mimetype,
          FileType.COMPONENT_IMAGE
        );

        if ('error' in imageResult) {
          res.status(500).json({
            success: false,
            error: `Image upload failed: ${imageResult.error}`,
          });
          return;
        }

        imageUrls.push(imageResult.url);
      }
    }

    // Use thumbnail as primary imageUrl, or first image if no thumbnail
    const primaryImageUrl = thumbnailUrl || (imageUrls.length > 0 ? imageUrls[0] : null);

    // Build component data
    const componentData: any = {
      name,
      unitPriceCents: parseInt(unitPriceCents, 10),
      imageUrl: primaryImageUrl,
      imageUrls: imageUrls,
    };

    // Add optional fields
    if (sku) componentData.sku = sku;
    if (description) componentData.description = description;
    if (typicalUseCase) componentData.typicalUseCase = typicalUseCase;
    if (vendorLink) componentData.vendorLink = vendorLink;
    if (category) componentData.category = category;
    if (subcategory) componentData.subcategory = subcategory;
    if (productType) componentData.productType = productType;
    if (brand) componentData.brand = brand;
    if (tags) componentData.tags = tags;
    if (isBestSeller !== undefined) {
      componentData.isBestSeller = isBestSeller === 'true' || isBestSeller === true;
    }
    if (isRobomaniacItem !== undefined) {
      componentData.isRobomaniacItem =
        isRobomaniacItem === 'true' || isRobomaniacItem === true;
    }
    if (isSoftware !== undefined) {
      componentData.isSoftware = isSoftware === 'true' || isSoftware === true;
    }
    if (stockQuantity !== undefined) componentData.stockQuantity = parseInt(stockQuantity, 10);
    if (isActive !== undefined) componentData.isActive = isActive === 'true' || isActive === true;

    // Create component in database
    const component = await componentService.createComponent(componentData);

    res.status(201).json({
      success: true,
      data: {
        component,
        uploads: {
          thumbnailUrl,
          imageUrls,
        },
      },
      message: 'Component created successfully with uploads',
    });
  } catch (error: any) {
    console.error('Component upload error:', error);

    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: 'Component with this SKU already exists',
      });
      return;
    }

    next(error);
  }
}
