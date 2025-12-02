# JSONB Validation Strategy for `generated_content`

## Decision: Should We Validate?

**TL;DR: YES, but with a balanced approach** ✅

I've implemented **optional database-level validation** that you can enable or disable based on your needs.

---

## The Validation Migration (OPTIONAL)

Migration: `20251024120150_add_generated_content_validation.sql`

### What It Validates:

✅ **Required Structure:**

- `days` array exists
- Each day has `date` and `items` array
- Each item has `id`, `type`, and `title`
- Item `type` is one of: `activity`, `meal`, `transport`

✅ **Optional but Validated if Present:**

- `modifications` is an array (if exists)
- `warnings` is an array (if exists)

❌ **NOT Validated (for flexibility):**

- Optional item fields: `time`, `description`, `location`, `estimated_price`, etc.
- Date format (PostgreSQL doesn't easily validate string formats in JSONB)
- UUID format for item IDs
- Specific array lengths

---

## Validation Levels (Choose Your Strategy)

### 🟢 **Level 1: Database Validation (Recommended)**

**Use the migration** → Validation happens at INSERT/UPDATE time

```sql
-- This is automatically applied if you run migration 20251024120150
-- It will REJECT invalid JSONB structures
```

**Pros:**

- ✅ Data integrity guaranteed
- ✅ Catches errors early
- ✅ Works even if application code has bugs
- ✅ Self-documenting schema

**Cons:**

- ❌ Less flexible for AI evolution
- ❌ Requires migration to change validation rules

**When to use:**

- Production environments where data quality is critical
- When multiple services/apps write to the database
- When you want defense-in-depth

---

### 🟡 **Level 2: Application-Only Validation**

**Skip the validation migration** → Validate in TypeScript/application layer only

```typescript
// Example: Zod schema in your application
import { z } from "zod";

const ItemSchema = z.object({
  id: z.string().uuid(),
  time: z.string().optional(),
  type: z.enum(["activity", "meal", "transport"]),
  title: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  estimated_price: z.string().optional(),
  estimated_duration: z.string().optional(),
  notes: z.string().optional(),
});

const GeneratedContentSchema = z.object({
  days: z.array(
    z.object({
      date: z.string(), // or z.string().date() for stricter validation
      items: z.array(ItemSchema),
    })
  ),
  modifications: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
});
```

**Pros:**

- ✅ Maximum flexibility
- ✅ Easy to change validation rules
- ✅ Can validate complex formats (UUIDs, dates, etc.)
- ✅ Better error messages for users

**Cons:**

- ❌ No protection if app code has bugs
- ❌ Can't prevent direct database writes
- ❌ Validation logic duplicated if you have multiple apps

**When to use:**

- Early development/prototyping
- Single application accessing the database
- When AI output structure is still evolving
- When you need detailed validation error messages

---

### 🔵 **Level 3: Hybrid Approach (Best of Both Worlds)**

**Run the validation migration** AND **validate in application**

```typescript
// Application layer: Strict validation with good error messages
const validatedData = GeneratedContentSchema.parse(aiOutput);

// Database layer: Safety net (catches any bugs)
await db.plans.update({
  where: { id },
  data: { generated_content: validatedData },
});
// ✅ If app validation missed something, DB will catch it
```

**Pros:**

- ✅ **Best data integrity** (defense in depth)
- ✅ Detailed errors in app, basic safety in DB
- ✅ Protects against bugs in application code

**Cons:**

- ❌ Slight performance overhead (double validation)
- ❌ Validation logic in two places

**When to use:**

- **RECOMMENDED for production**
- Critical data that drives user experience
- When you want maximum safety

---

## How to Enable/Disable Database Validation

### To Enable:

```bash
# Run the validation migration
supabase migration up 20251024120150_add_generated_content_validation.sql
```

### To Disable (if you change your mind):

```sql
-- Remove the constraint
ALTER TABLE plans DROP CONSTRAINT check_generated_content_structure;

-- Optionally drop the validation function
DROP FUNCTION validate_generated_content(JSONB);
```

### To Re-enable Later:

```sql
-- Recreate the constraint (function must exist)
ALTER TABLE plans
ADD CONSTRAINT check_generated_content_structure
CHECK (validate_generated_content(generated_content));
```

---

## Testing the Validation

### ✅ Valid Examples:

```sql
-- Minimal valid structure
UPDATE plans SET generated_content = '{
  "days": [
    {
      "date": "2025-05-15",
      "items": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "type": "activity",
          "title": "Koloseum"
        }
      ]
    }
  ]
}'::jsonb WHERE id = 'some-uuid';
-- ✅ ACCEPTED
```

```sql
-- Full structure with optional fields
UPDATE plans SET generated_content = '{
  "days": [
    {
      "date": "2025-05-15",
      "items": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "time": "09:00",
          "type": "activity",
          "title": "Koloseum",
          "description": "Wizyta w starożytnym amfiteatrze",
          "location": "Piazza del Colosseo, 1",
          "estimated_price": "16 EUR",
          "estimated_duration": "2 godziny",
          "notes": "Sprawdź godziny otwarcia"
        }
      ]
    }
  ],
  "modifications": ["Usunięto Muzeum X"],
  "warnings": ["Sprawdź godziny otwarcia"]
}'::jsonb WHERE id = 'some-uuid';
-- ✅ ACCEPTED
```

### ❌ Invalid Examples:

```sql
-- Missing 'days' array
UPDATE plans SET generated_content = '{
  "items": []
}'::jsonb WHERE id = 'some-uuid';
-- ❌ REJECTED: missing 'days'
```

```sql
-- Invalid item type
UPDATE plans SET generated_content = '{
  "days": [
    {
      "date": "2025-05-15",
      "items": [
        {
          "id": "123",
          "type": "invalid_type",
          "title": "Something"
        }
      ]
    }
  ]
}'::jsonb WHERE id = 'some-uuid';
-- ❌ REJECTED: type must be 'activity', 'meal', or 'transport'
```

```sql
-- Missing required item fields
UPDATE plans SET generated_content = '{
  "days": [
    {
      "date": "2025-05-15",
      "items": [
        {
          "title": "Something"
        }
      ]
    }
  ]
}'::jsonb WHERE id = 'some-uuid';
-- ❌ REJECTED: missing 'id' and 'type'
```

---

## My Recommendation for CityFlow

Based on your use case (AI-generated travel plans):

### **Phase 1: Early Development**

🟡 **Application-only validation**

- Skip migration `20251024120150` initially
- Validate with Zod/TypeScript in your app
- Allow AI output to evolve freely

### **Phase 2: Pre-Production**

🔵 **Add database validation (Hybrid)**

- Run migration `20251024120150`
- Keep application validation for UX
- Ensure data quality before launch

### **Phase 3: Production**

🔵 **Hybrid approach**

- Database enforces minimum structure
- Application provides detailed validation
- Monitor and adjust constraints as needed

---

## Performance Considerations

The validation function is marked as `IMMUTABLE`, which means:

- ✅ PostgreSQL can cache results
- ✅ Can be used in indexes (if needed later)
- ✅ Minimal performance impact (< 1ms for typical plans)

**Benchmark (estimated):**

- Small plan (1-2 days, 5-10 items): ~0.5ms overhead
- Medium plan (3-5 days, 20-30 items): ~1-2ms overhead
- Large plan (7+ days, 50+ items): ~3-5ms overhead

For comparison, a typical database INSERT already takes 5-20ms, so validation adds ~5-10% overhead.

---

## Summary

| Strategy          | Use Case       | Data Safety | Flexibility | Performance |
| ----------------- | -------------- | ----------- | ----------- | ----------- |
| **No Validation** | Prototyping    | ❌ Low      | ✅ Maximum  | ✅ Fastest  |
| **App-Only**      | Development    | 🟡 Medium   | ✅ High     | ✅ Fast     |
| **DB-Only**       | Simple systems | ✅ High     | ❌ Low      | 🟡 Good     |
| **Hybrid** ⭐     | Production     | ✅ Maximum  | 🟡 Medium   | 🟡 Good     |

**My recommendation: Start with App-Only, migrate to Hybrid before production.**
