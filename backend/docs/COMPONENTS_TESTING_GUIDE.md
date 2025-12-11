# Project Components - Complete Testing Guide

## ✅ All Changes Made

### 1. **GET All Projects** - ✅ Fixed
- Now includes components in list response
- Shows componentsCount and totalComponentsCost

### 2. **GET Featured by Category** - ✅ Fixed
- Now includes components in featured projects

### 3. **UPDATE Project** - ✅ Already Working
- Can update components (replaces all)
- Deletes old, creates new component associations
- Returns updated project with components

### 4. **DELETE Project** - ✅ Already Working
- Cascade delete removes all component associations
- Schema has `onDelete: Cascade` configured

---

## 📋 Complete Test Suite

### Test 1: Create Project with Components

```bash
curl -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Project Full",
    "description": "Testing all component features",
    "category": "ROBOTICS",
    "difficulty": "INTERMEDIATE",
    "estimatedCostCents": 200000,
    "estimatedBuildTimeMinutes": 240,
    "components": [
      {
        "componentId": "cmixvbx2200019mv7k1tl7l2o",
        "quantity": 1,
        "notes": "Arduino Uno R3 - Main controller"
      },
      {
        "componentId": "cmixvb0xb00009mv7io78dc57",
        "quantity": 2,
        "notes": "DHT22 Sensors - Temperature monitoring"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "Test Project Full",
    "components": [
      {
        "id": "...",
        "componentId": "cmixvbx2200019mv7k1tl7l2o",
        "quantity": 1,
        "notes": "Arduino Uno R3 - Main controller",
        "component": {
          "id": "cmixvbx2200019mv7k1tl7l2o",
          "name": "Arduino Uno R3",
          "unitPrice": 599,
          "stockQuantity": 50,
          ...
        },
        "totalCost": 599
      },
      {
        "id": "...",
        "componentId": "cmixvb0xb00009mv7io78dc57",
        "quantity": 2,
        "notes": "DHT22 Sensors - Temperature monitoring",
        "component": {
          "name": "DHT22 Sensor",
          "unitPrice": 450,
          ...
        },
        "totalCost": 900
      }
    ],
    "componentsCount": 2,
    "totalComponentsCost": 1499
  }
}
```

**✅ Save the project ID for next tests!**

---

### Test 2: GET All Projects (List)

```bash
curl -X GET "http://localhost:4000/api/projects?page=1&limit=10&sortBy=createdAt&sortOrder=desc"
```

**Expected:** Each project should have:
- ✅ `components` array
- ✅ `componentsCount` 
- ✅ `totalComponentsCost`

---

### Test 3: GET Project by ID

```bash
curl -X GET "http://localhost:4000/api/projects/PROJECT_ID_HERE"
```

**Expected:** Full project with components array

---

### Test 4: GET Featured Projects by Category

```bash
curl -X GET "http://localhost:4000/api/projects/categories/ROBOTICS/featured?limit=5"
```

**Expected:** Array of featured projects with components

---

### Test 5: UPDATE Project - Change Components

```bash
curl -X PUT http://localhost:4000/api/projects/PROJECT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "components": [
      {
        "componentId": "cmixvbx2200019mv7k1tl7l2o",
        "quantity": 3,
        "notes": "Updated quantity - Need 3 Arduinos now"
      }
    ]
  }'
```

**Expected:**
- ✅ Old components removed
- ✅ New components added
- ✅ Response includes updated components
- ✅ `componentsCount: 1`
- ✅ `totalComponentsCost` recalculated

**Note:** This REPLACES all components. To keep existing ones, include them in the array.

---

### Test 6: UPDATE Project - Add More Components

```bash
curl -X PUT http://localhost:4000/api/projects/PROJECT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "components": [
      {
        "componentId": "cmixvbx2200019mv7k1tl7l2o",
        "quantity": 1,
        "notes": "Arduino Uno"
      },
      {
        "componentId": "cmixvb0xb00009mv7io78dc57",
        "quantity": 1,
        "notes": "DHT22 Sensor"
      },
      {
        "componentId": "another-component-id",
        "quantity": 5,
        "notes": "Jumper Wires"
      }
    ]
  }'
```

**Expected:**
- ✅ All 3 components in response
- ✅ `componentsCount: 3`

---

### Test 7: UPDATE Project - Remove All Components

```bash
curl -X PUT http://localhost:4000/api/projects/PROJECT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "components": []
  }'
```

**Expected:**
- ✅ Empty components array
- ✅ `componentsCount: 0`
- ✅ `totalComponentsCost: 0`

---

### Test 8: UPDATE Project - Other Fields (Don't Touch Components)

```bash
curl -X PUT http://localhost:4000/api/projects/PROJECT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Updated Project Title",
    "estimatedCostCents": 300000
  }'
```

**Expected:**
- ✅ Title updated
- ✅ Cost updated
- ✅ Components unchanged (still there)

---

### Test 9: DELETE Project

```bash
curl -X DELETE http://localhost:4000/api/projects/PROJECT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:**
- ✅ Project deleted
- ✅ Component associations automatically deleted (cascade)
- ✅ Components themselves remain in database (can be used in other projects)

**Verify in database:**
```sql
-- Project should be gone
SELECT * FROM "Project" WHERE id = 'PROJECT_ID';

-- Component associations should be gone
SELECT * FROM "ProjectComponent" WHERE "projectId" = 'PROJECT_ID';

-- Components should still exist
SELECT * FROM "Component" WHERE id = 'cmixvbx2200019mv7k1tl7l2o';
```

---

## 🔍 Database Verification

### Check Component Associations

```sql
-- See all project-component relationships
SELECT 
  pc.id,
  p.title as project_title,
  c.name as component_name,
  pc.quantity,
  pc.notes
FROM "ProjectComponent" pc
JOIN "Project" p ON pc."projectId" = p.id
JOIN "Component" c ON pc."componentId" = c.id;
```

### Check Project with Components

```sql
-- See specific project with its components
SELECT 
  p.title,
  p.category,
  json_agg(
    json_build_object(
      'component', c.name,
      'quantity', pc.quantity,
      'notes', pc.notes,
      'price', c."unitPriceCents" / 100
    )
  ) as components
FROM "Project" p
LEFT JOIN "ProjectComponent" pc ON p.id = pc."projectId"
LEFT JOIN "Component" c ON pc."componentId" = c.id
WHERE p.id = 'YOUR_PROJECT_ID'
GROUP BY p.id, p.title, p.category;
```

---

## 🎯 Expected Behaviors

### ✅ CREATE Project
- Components are saved to `ProjectComponent` table
- Response includes full component details
- `totalComponentsCost` auto-calculated

### ✅ GET Project(s)
- All endpoints return components array
- Each component has full details
- Includes computed fields (totalCost per component)

### ✅ UPDATE Project
- **With `components` field:** Replaces ALL component associations
- **Without `components` field:** Components unchanged
- Response includes updated components

### ✅ DELETE Project
- Project deleted from `Project` table
- All associations deleted from `ProjectComponent` table
- Components remain in `Component` table (reusable)

---

## ⚠️ Important Notes

### Component Update Strategy

The update operation is **REPLACE ALL**, not incremental:

```javascript
// ❌ This will REMOVE all existing components
PUT /api/projects/:id
{ "components": [] }

// ✅ To keep existing + add new, include ALL components
PUT /api/projects/:id
{
  "components": [
    // Include existing ones
    { "componentId": "existing-1", "quantity": 1 },
    // Add new one
    { "componentId": "new-1", "quantity": 2 }
  ]
}
```

### Cascade Delete Behavior

```
DELETE Project
  ↓ (CASCADE)
  ✅ ProjectComponent deleted
  ✅ ProjectAsset deleted
  ✅ ProjectStep deleted
  ✅ ProjectMentor deleted
  ❌ Component NOT deleted (RESTRICT)
  ❌ User NOT deleted (RESTRICT)
```

Components are protected by `onDelete: Restrict` - cannot delete a component that's used in projects.

---

## 📊 Response Format Summary

### Create/Update Response
```json
{
  "success": true,
  "data": {
    "id": "project-id",
    "title": "Project Title",
    "components": [
      {
        "id": "pc-id",
        "componentId": "component-id",
        "quantity": 2,
        "notes": "Usage notes",
        "component": {
          "id": "component-id",
          "name": "Component Name",
          "sku": "SKU-123",
          "unitPriceCents": 59900,
          "unitPrice": 599,
          "stockQuantity": 50,
          "isActive": true,
          "imageUrl": "https://...",
          "vendorLink": "https://...",
          "description": "...",
          "typicalUseCase": "..."
        },
        "totalCost": 1198
      }
    ],
    "componentsCount": 1,
    "totalComponentsCost": 1198,
    ...
  }
}
```

### List Response
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "...",
        "title": "...",
        "components": [...],
        "componentsCount": 2,
        "totalComponentsCost": 1499
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 20,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

## ✅ Testing Checklist

- [ ] Create project with components
- [ ] Verify components in create response
- [ ] GET all projects - see components
- [ ] GET project by ID - see components
- [ ] GET featured by category - see components
- [ ] Update project - change components
- [ ] Update project - add components
- [ ] Update project - remove all components
- [ ] Update project - don't touch components
- [ ] Delete project - verify cascade delete
- [ ] Verify components still exist after project delete
- [ ] Check computed fields (componentsCount, totalComponentsCost)
- [ ] Verify component details (unitPrice, stockQuantity, etc.)

---

**All features are ready to test! 🚀**
