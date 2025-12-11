# Project Components Feature Guide

## Overview

The Project Components feature allows admins to link required components from the marketplace to projects. This helps students understand exactly what they need to purchase to build each project.

## Key Features

1. **Component Association**: Link multiple components to a project with specific quantities
2. **Component Notes**: Add notes for each component (e.g., "Main microcontroller", "Optional for beginners")
3. **Auto-calculation**: Total component cost is automatically calculated
4. **Stock Tracking**: See real-time component availability
5. **Detailed Information**: Full component details included in project responses

## Database Schema

### ProjectComponent Model

```prisma
model ProjectComponent {
  id          String  @id @default(cuid())
  projectId   String
  componentId String
  quantity    Int     @default(1)
  notes       String? // Usage notes

  project   Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  component Component @relation(fields: [componentId], references: [id], onDelete: Restrict)

  createdAt DateTime @default(now())

  @@unique([projectId, componentId])
  @@index([componentId])
}
```

**Key Relationships:**
- One project can have many components
- Each component can be used in many projects
- Quantity tracks how many of each component is needed
- Notes field for usage instructions

## API Usage

### 1. Creating a Project with Components (New Format - Recommended)

```json
POST /api/projects
{
  "title": "Arduino Weather Station",
  "description": "Build a complete IoT weather station...",
  "category": "IOT",
  "difficulty": "BEGINNER",
  "components": [
    {
      "componentId": "cm123abc",
      "quantity": 1,
      "notes": "Main microcontroller - Arduino Uno R3"
    },
    {
      "componentId": "cm456def",
      "quantity": 1,
      "notes": "Temperature and humidity sensor - DHT22"
    },
    {
      "componentId": "cm789ghi",
      "quantity": 10,
      "notes": "Male-to-male jumper wires"
    }
  ]
}
```

**Response includes:**
```json
{
  "success": true,
  "data": {
    "id": "project-id",
    "title": "Arduino Weather Station",
    "components": [
      {
        "id": "pc-1",
        "componentId": "cm123abc",
        "quantity": 1,
        "notes": "Main microcontroller - Arduino Uno R3",
        "component": {
          "id": "cm123abc",
          "name": "Arduino Uno R3",
          "sku": "ARD-UNO-R3",
          "unitPriceCents": 59900,
          "unitPrice": 599,
          "stockQuantity": 50,
          "isActive": true,
          "imageUrl": "https://..."
        },
        "totalCost": 599
      },
      // ... more components
    ],
    "componentsCount": 3,
    "totalComponentsCost": 1499
  }
}
```

### 2. Backward Compatibility (Simple Component IDs)

Still supported for simple use cases:

```json
POST /api/projects
{
  "title": "Simple LED Project",
  "componentIds": ["cm123abc", "cm456def", "cm789ghi"]
}
```

- All components default to quantity: 1
- No notes are added
- Automatically converted to new format internally

⚠️ **Note:** Cannot use both `components` and `componentIds` in same request

### 3. Updating Project Components

Replace entire component list:

```json
PUT /api/projects/:projectId
{
  "components": [
    {
      "componentId": "cm123abc",
      "quantity": 2,
      "notes": "Updated quantity and notes"
    }
  ]
}
```

**Important:** This replaces ALL existing component associations. To keep existing components, include them in the update.

### 4. Fetching Project with Components

```bash
GET /api/projects/:projectId
GET /api/projects/slug/:slug
```

Both endpoints automatically include full component details:

```json
{
  "id": "project-id",
  "title": "Arduino Weather Station",
  "estimatedCost": 1500,
  "components": [
    {
      "id": "pc-1",
      "componentId": "cm123abc",
      "quantity": 1,
      "notes": "Main microcontroller",
      "component": {
        "id": "cm123abc",
        "name": "Arduino Uno R3",
        "description": "...",
        "unitPrice": 599,
        "stockQuantity": 50,
        "vendorLink": "https://...",
        "imageUrl": "https://..."
      },
      "totalCost": 599
    }
  ],
  "componentsCount": 6,
  "totalComponentsCost": 1499
}
```

## Component Response Fields

### ProjectComponentDetail

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | ProjectComponent relation ID |
| `componentId` | string | Component UUID |
| `quantity` | number | Number of units needed |
| `notes` | string? | Usage notes/instructions |
| `component` | object | Full component details |
| `component.name` | string | Component name |
| `component.sku` | string? | Stock Keeping Unit |
| `component.unitPrice` | number | Price per unit (rupees) |
| `component.unitPriceCents` | number | Price per unit (cents) |
| `component.stockQuantity` | number | Available stock |
| `component.isActive` | boolean | Is available for purchase |
| `component.vendorLink` | string? | External vendor URL |
| `component.imageUrl` | string? | Component image |
| `totalCost` | number | quantity × unitPrice (rupees) |

### Computed Fields on Project

| Field | Type | Description |
|-------|------|-------------|
| `componentsCount` | number | Total number of unique components |
| `totalComponentsCost` | number | Sum of all component costs (rupees) |

## Validation Rules

### Component Input Validation

```typescript
{
  componentId: string (required, valid UUID)
  quantity: number (required, min: 1)
  notes: string (optional, max: 500 chars)
}
```

**Validation Errors:**
- `"Component X: Invalid component ID"` - Invalid UUID format
- `"Component X: Quantity must be a positive number"` - Quantity < 1
- `"Component X: Notes must be a string"` - Invalid notes type
- `"Cannot specify both componentIds and components"` - Used both formats

### Database Constraints

- **Unique constraint:** One component can only be added once per project
- **Cascade delete:** Deleting a project removes all component associations
- **Restrict delete:** Cannot delete a component used in projects
- **Index on componentId:** Fast lookups of which projects use a component

## Use Cases

### 1. Complete Bill of Materials (BOM)

```json
{
  "components": [
    {"componentId": "arduino-uno", "quantity": 1, "notes": "Microcontroller"},
    {"componentId": "dht22", "quantity": 1, "notes": "Sensor"},
    {"componentId": "jumpers", "quantity": 20, "notes": "Wiring"},
    {"componentId": "breadboard", "quantity": 1, "notes": "Prototyping"},
    {"componentId": "resistor-220", "quantity": 5, "notes": "LED current limiting"},
    {"componentId": "led-red", "quantity": 2, "notes": "Status indicators"}
  ]
}
```

### 2. Optional vs Required Components

```json
{
  "components": [
    {"componentId": "esp32", "quantity": 1, "notes": "Required: Main controller"},
    {"componentId": "lcd-16x2", "quantity": 1, "notes": "Optional: For display"},
    {"componentId": "battery", "quantity": 1, "notes": "Optional: For portable use"}
  ]
}
```

### 3. Quantity-based Pricing

- System automatically calculates total cost
- Students see individual component costs
- Can compare DIY cost vs pre-built price

**Example:**
```
Arduino Uno (1x) = ₹599
DHT22 Sensor (1x) = ₹450
Jumper Wires (10x) = ₹5 each = ₹50
Breadboard (1x) = ₹150
---
Total Components Cost: ₹1,249
Pre-built Option: ₹2,500
DIY Savings: ₹1,251
```

## Frontend Integration

### Display Component List

```typescript
// React/Next.js example
function ProjectComponents({ project }) {
  return (
    <div className="components-list">
      <h3>Required Components</h3>
      <p>Total: {project.componentsCount} components</p>
      <p>Estimated Cost: ₹{project.totalComponentsCost}</p>
      
      {project.components.map(pc => (
        <div key={pc.id} className="component-item">
          <img src={pc.component.imageUrl} alt={pc.component.name} />
          <div>
            <h4>{pc.component.name}</h4>
            <p>Quantity: {pc.quantity}</p>
            <p>Price: ₹{pc.component.unitPrice} each</p>
            <p>Total: ₹{pc.totalCost}</p>
            {pc.notes && <p className="notes">{pc.notes}</p>}
            {pc.component.stockQuantity > 0 ? (
              <button>Add to Cart</button>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Add to Cart Flow

```typescript
async function addProjectComponentsToCart(projectId: string) {
  const project = await fetch(`/api/projects/${projectId}`).then(r => r.json());
  
  for (const pc of project.data.components) {
    if (pc.component.isActive && pc.component.stockQuantity >= pc.quantity) {
      await addToCart(pc.componentId, pc.quantity);
    }
  }
}
```

## Admin Workflow

### Step-by-Step Guide

1. **Create Component in Marketplace** (if not exists)
   ```bash
   POST /api/components
   {
     "name": "Arduino Uno R3",
     "sku": "ARD-UNO-R3",
     "unitPriceCents": 59900,
     "stockQuantity": 50
   }
   ```

2. **Get Component ID**
   ```bash
   GET /api/components?search=Arduino
   # Copy the component ID
   ```

3. **Create Project with Components**
   ```bash
   POST /api/projects
   {
     "title": "LED Blink Tutorial",
     "components": [
       {"componentId": "cm123abc", "quantity": 1, "notes": "Arduino board"},
       {"componentId": "cm456def", "quantity": 1, "notes": "LED"}
     ]
   }
   ```

4. **Update Components Later**
   ```bash
   PUT /api/projects/:id
   {
     "components": [
       {"componentId": "cm123abc", "quantity": 2, "notes": "Updated"}
     ]
   }
   ```

## Best Practices

### For Admins

1. **Always Add Notes**: Help students understand component purpose
   ```json
   {"componentId": "x", "quantity": 1, "notes": "Main controller - essential"}
   ```

2. **Mark Optional Components**: Be clear about what's required
   ```json
   {"notes": "Optional: Adds Bluetooth connectivity"}
   ```

3. **Accurate Quantities**: Count carefully
   ```json
   {"quantity": 20, "notes": "Male-to-male jumper wires (need extras)"}
   ```

4. **Use Vendor Links**: Add vendorLink to components for external purchases

5. **Keep Components Updated**: Remove discontinued components

### For Frontend Developers

1. **Show Stock Status**: Display real-time stock availability
2. **Calculate Totals**: Show total project cost
3. **Add All Button**: "Add All Components to Cart" feature
4. **Alternative Suggestions**: If component out of stock, suggest alternatives
5. **Build Guide Integration**: Link components to build steps

## Error Handling

### Common Errors

**404 - Component Not Found**
```json
{
  "success": false,
  "error": "Component with ID 'invalid-id' not found"
}
```
*Solution:* Verify component exists in marketplace

**400 - Invalid Quantity**
```json
{
  "success": false,
  "errors": ["Component 1: Quantity must be a positive number"]
}
```
*Solution:* Use quantity >= 1

**409 - Duplicate Component**
```json
{
  "success": false,
  "error": "Component already added to this project"
}
```
*Solution:* Update quantity instead of adding again

## Performance Considerations

1. **Indexed Queries**: componentId is indexed for fast lookups
2. **Eager Loading**: Components are loaded with project details
3. **Caching Strategy**: Cache component details separately
4. **Pagination**: For projects with many components (rare)

## Future Enhancements

- [ ] Component alternatives (if primary out of stock)
- [ ] Component bundles/kits
- [ ] Historical pricing
- [ ] Component compatibility matrix
- [ ] Auto-suggest components based on project type
- [ ] Student-submitted component reviews
- [ ] Component comparison tool
- [ ] Bulk import components from CSV

## Migration Guide

### From Old System (componentIds)

If you have existing projects using `componentIds`:

```typescript
// Old format
{
  "componentIds": ["id1", "id2", "id3"]
}

// Migrate to new format
{
  "components": [
    {"componentId": "id1", "quantity": 1},
    {"componentId": "id2", "quantity": 1},
    {"componentId": "id3", "quantity": 1}
  ]
}
```

System automatically handles both formats, so no migration needed!

## Support

For questions or issues:
- Check TypeScript types in `src/features/projects/types/project.types.ts`
- Review validators in `src/features/projects/validators/project.validator.ts`
- See examples in Postman collection
- Contact backend team

---

**Last Updated:** December 11, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
