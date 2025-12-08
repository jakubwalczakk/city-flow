# API Examples: POST /api/plans

## Successful Request

### Request

```bash
curl -X POST http://localhost:4321/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Trip to Berlin",
    "destination": "Berlin, Germany",
    "start_date": "2026-03-05T00:00:00.000Z",
    "end_date": "2026-03-08T00:00:00.000Z",
    "notes": "See the Brandenburg Gate and eat currywurst."
  }'
```

### Response (201 Created)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "7fa54c95-45f8-43dd-9823-1d43aa6e2ed9",
  "name": "Trip to Berlin",
  "destination": "Berlin, Germany",
  "start_date": "2026-03-05T00:00:00.000Z",
  "end_date": "2026-03-08T00:00:00.000Z",
  "notes": "See the Brandenburg Gate and eat currywurst.",
  "status": "draft",
  "generated_content": null,
  "created_at": "2025-10-29T12:00:00.000Z",
  "updated_at": "2025-10-29T12:00:00.000Z"
}
```

## Validation Errors

### Missing Required Field

#### Request

```bash
curl -X POST http://localhost:4321/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Paris, France"
  }'
```

#### Response (400 Bad Request)

```json
{
  "error": "Validation failed",
  "details": {
    "fieldErrors": {
      "name": ["Name is required."]
    },
    "formErrors": []
  }
}
```

### Invalid Date Format

#### Request

```bash
curl -X POST http://localhost:4321/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weekend in Rome",
    "destination": "Rome, Italy",
    "start_date": "2026-03-05",
    "end_date": "2026-03-08"
  }'
```

#### Response (400 Bad Request)

```json
{
  "error": "Validation failed",
  "details": {
    "fieldErrors": {
      "start_date": ["Invalid datetime"],
      "end_date": ["Invalid datetime"]
    },
    "formErrors": []
  }
}
```

### End Date Before Start Date

#### Request

```bash
curl -X POST http://localhost:4321/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Trip to Tokyo",
    "destination": "Tokyo, Japan",
    "start_date": "2026-05-10T00:00:00.000Z",
    "end_date": "2026-05-05T00:00:00.000Z"
  }'
```

#### Response (400 Bad Request)

```json
{
  "error": "Validation failed",
  "details": {
    "fieldErrors": {
      "end_date": ["End date must be equal to or after start date."]
    },
    "formErrors": []
  }
}
```

### Empty Required Field

#### Request

```bash
curl -X POST http://localhost:4321/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "destination": "London, UK"
  }'
```

#### Response (400 Bad Request)

```json
{
  "error": "Validation failed",
  "details": {
    "fieldErrors": {
      "name": ["Name cannot be empty."]
    },
    "formErrors": []
  }
}
```

## Malformed JSON

### Request

```bash
curl -X POST http://localhost:4321/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Trip to Barcelona",
    "destination": "Barcelona, Spain"
    // Missing comma and invalid JSON
  }'
```

### Response (400 Bad Request)

```json
{
  "error": "Invalid JSON in request body"
}
```

## Minimal Valid Request

### Request

```bash
curl -X POST http://localhost:4321/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quick Trip",
    "destination": "Amsterdam"
  }'
```

### Response (201 Created)

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "7fa54c95-45f8-43dd-9823-1d43aa6e2ed9",
  "name": "Quick Trip",
  "destination": "Amsterdam",
  "start_date": null,
  "end_date": null,
  "notes": null,
  "status": "draft",
  "generated_content": null,
  "created_at": "2025-10-29T12:05:00.000Z",
  "updated_at": "2025-10-29T12:05:00.000Z"
}
```

## Full Request with All Optional Fields

### Request

```bash
curl -X POST http://localhost:4321/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Vacation in Greece",
    "destination": "Athens, Greece",
    "start_date": "2026-07-15T00:00:00.000Z",
    "end_date": "2026-07-22T00:00:00.000Z",
    "notes": "Visit Acropolis, try souvlaki, maybe island hopping to Santorini. Book ferry tickets in advance!"
  }'
```

### Response (201 Created)

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "user_id": "7fa54c95-45f8-43dd-9823-1d43aa6e2ed9",
  "name": "Summer Vacation in Greece",
  "destination": "Athens, Greece",
  "start_date": "2026-07-15T00:00:00.000Z",
  "end_date": "2026-07-22T00:00:00.000Z",
  "notes": "Visit Acropolis, try souvlaki, maybe island hopping to Santorini. Book ferry tickets in advance!",
  "status": "draft",
  "generated_content": null,
  "created_at": "2025-10-29T12:10:00.000Z",
  "updated_at": "2025-10-29T12:10:00.000Z"
}
```

## Using with JavaScript/TypeScript

```typescript
import type { CreatePlanCommand, PlanDetailsDto } from '@/types';

async function createPlan(plan: CreatePlanCommand): Promise<PlanDetailsDto> {
  const response = await fetch('/api/plans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(plan),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}

// Usage
try {
  const newPlan = await createPlan({
    name: 'Trip to Berlin',
    destination: 'Berlin, Germany',
    start_date: '2026-03-05T00:00:00.000Z',
    end_date: '2026-03-08T00:00:00.000Z',
    notes: 'See the Brandenburg Gate and eat currywurst.',
  });

  console.log('Plan created:', newPlan);
} catch (error) {
  console.error('Failed to create plan:', error);
}
```
