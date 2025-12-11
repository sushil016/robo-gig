# CUID vs UUID Validation Fix

## Issue

**Problem:** Component IDs validation was failing with error `"Invalid component ID"` even though the IDs were correct.

**Example:**
```json
{
  "components": [
    {
      "componentId": "cmixvbx2200019mv7k1tl7l2o",
      "quantity": 1,
      "notes": "Arduino Uno"
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "errors": ["Component 1: Invalid component ID"]
}
```

## Root Cause

The validator's `isValidUUID()` function only accepted **UUID format** IDs:
```
UUID: 550e8400-e29b-41d4-a716-446655440000
```

But Prisma is configured to use **CUID format** IDs:
```prisma
model Component {
  id String @id @default(cuid())  // <- Generates CUID, not UUID
}
```

**CUID format:**
```
cmixvbx2200019mv7k1tl7l2o
```
- Starts with 'c'
- Followed by 24-32 alphanumeric characters
- More readable and sortable than UUIDs

## Solution

Updated the `isValidUUID()` function to accept **both UUID and CUID formats**:

```typescript
/**
 * Validate ID format (supports both UUID and CUID)
 * CUID format: c[a-z0-9]{24,32} (e.g., cmixvbx2200019mv7k1tl7l2o)
 * UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
export function isValidUUID(id: string): boolean {
  // UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  // CUID format (starts with 'c', followed by 24-32 alphanumeric chars)
  const cuidRegex = /^c[a-z0-9]{24,32}$/i;
  
  return uuidRegex.test(id) || cuidRegex.test(id);
}
```

## Testing

### ✅ Valid CUID IDs (now accepted)
```
cmixvbx2200019mv7k1tl7l2o
cmixvb0xb00009mv7io78dc57
cm4p8wz8x0000s8nw45h8gj3k
```

### ✅ Valid UUID IDs (still accepted)
```
550e8400-e29b-41d4-a716-446655440000
6ba7b810-9dad-11d1-80b4-00c04fd430c8
```

### ❌ Invalid IDs (correctly rejected)
```
invalid-id
123456789
cmix  (too short)
xmixvbx2200019mv7k1tl7l2o  (doesn't start with 'c')
```

## Files Updated

- `src/features/projects/validators/project.validator.ts` ✅

## Impact

- **Create Project:** Now accepts CUID component IDs
- **Update Project:** Now accepts CUID component IDs
- **Backward Compatible:** Still accepts UUID format if used elsewhere
- **No Breaking Changes:** Existing UUID IDs still work

## Example Usage (Now Works!)

```json
POST /api/projects
{
  "title": "Arduino Weather Station",
  "components": [
    {
      "componentId": "cmixvbx2200019mv7k1tl7l2o",
      "quantity": 1,
      "notes": "Arduino Uno R3"
    },
    {
      "componentId": "cmixvb0xb00009mv7io78dc57",
      "quantity": 1,
      "notes": "DHT22 Sensor"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cm123...",
    "title": "Arduino Weather Station",
    "components": [...],
    "componentsCount": 2
  }
}
```

## Note on Function Naming

The function is still called `isValidUUID()` for backward compatibility, but it now validates both UUID and CUID formats. Consider renaming to `isValidId()` in future refactoring.

---

**Fixed:** December 11, 2025  
**Status:** ✅ Resolved  
**Breaking Changes:** None
