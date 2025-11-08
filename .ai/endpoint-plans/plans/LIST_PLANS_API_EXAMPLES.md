# API Examples: GET /api/plans

This document contains practical examples for testing the `GET /api/plans` endpoint.

## Base URL
```
http://localhost:4321/api/plans
```

## Positive Test Cases

### 1. Get all plans with default parameters
**Request:**
```bash
curl -X GET "http://localhost:4321/api/plans"
```

**Expected Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid-plan-1",
      "name": "Weekend in Rome",
      "destination": "Rome, Italy",
      "start_date": "2025-11-10T00:00:00Z",
      "end_date": "2025-11-12T00:00:00Z",
      "status": "generated",
      "created_at": "2025-10-20T10:00:00Z"
    },
    {
      "id": "uuid-plan-2",
      "name": "Paris Adventure",
      "destination": "Paris, France",
      "start_date": null,
      "end_date": null,
      "status": "draft",
      "created_at": "2025-10-19T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 20,
    "offset": 0
  }
}
```

---

### 2. Filter by status (draft)
**Request:**
```bash
curl -X GET "http://localhost:4321/api/plans?status=draft"
```

**Expected Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid-plan-2",
      "name": "Paris Adventure",
      "destination": "Paris, France",
      "start_date": null,
      "end_date": null,
      "status": "draft",
      "created_at": "2025-10-19T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

---

### 3. Filter by status (generated)
**Request:**
```bash
curl -X GET "http://localhost:4321/api/plans?status=generated"
```

**Expected Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid-plan-1",
      "name": "Weekend in Rome",
      "destination": "Rome, Italy",
      "start_date": "2025-11-10T00:00:00Z",
      "end_date": "2025-11-12T00:00:00Z",
      "status": "generated",
      "created_at": "2025-10-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

---

### 4. Sort by name ascending
**Request:**
```bash
curl -X GET "http://localhost:4321/api/plans?sort_by=name&order=asc"
```

**Expected Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid-plan-2",
      "name": "Paris Adventure",
      "destination": "Paris, France",
      "start_date": null,
      "end_date": null,
      "status": "draft",
      "created_at": "2025-10-19T15:30:00Z"
    },
    {
      "id": "uuid-plan-1",
      "name": "Weekend in Rome",
      "destination": "Rome, Italy",
      "start_date": "2025-11-10T00:00:00Z",
      "end_date": "2025-11-12T00:00:00Z",
      "status": "generated",
      "created_at": "2025-10-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 20,
    "offset": 0
  }
}
```

---

### 5. Pagination - first page with limit 1
**Request:**
```bash
curl -X GET "http://localhost:4321/api/plans?limit=1&offset=0"
```

**Expected Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid-plan-1",
      "name": "Weekend in Rome",
      "destination": "Rome, Italy",
      "start_date": "2025-11-10T00:00:00Z",
      "end_date": "2025-11-12T00:00:00Z",
      "status": "generated",
      "created_at": "2025-10-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 1,
    "offset": 0
  }
}
```

---

### 6. Pagination - second page with limit 1
**Request:**
```bash
curl -X GET "http://localhost:4321/api/plans?limit=1&offset=1"
```

**Expected Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid-plan-2",
      "name": "Paris Adventure",
      "destination": "Paris, France",
      "start_date": null,
      "end_date": null,
      "status": "draft",
      "created_at": "2025-10-19T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 1,
    "offset": 1
  }
}
```

---

### 7. Combined filters and sorting
**Request:**
```bash
curl -X GET "http://localhost:4321/api/plans?status=draft&sort_by=created_at&order=asc&limit=10&offset=0"
```

**Expected Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid-plan-2",
      "name": "Paris Adventure",
      "destination": "Paris, France",
      "start_date": null,
      "end_date": null,
      "status": "draft",
      "created_at": "2025-10-19T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

---

### 8. Empty result set (no plans match filter)
**Request:**
```bash
curl -X GET "http://localhost:4321/api/plans?status=archived"
```

**Expected Response (200 OK):**
```json
{
  "data": [],
  "pagination": {
    "total": 0,
    "limit": 20,
    "offset": 0
  }
}
```

---

## Negative Test Cases

### 1. Invalid status value
**Request:**
```bash
curl -X GET "http://localhost:4321/api/plans?status=invalid_status"
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Invalid query parameters",
  "details": {
    "fieldErrors": {
      "status": [
        "Invalid enum value. Expected 'draft' | 'generated' | 'archived', received 'invalid_status'"
      ]
    },
    "formErrors": []
  }
}
```

---

### 2. Invalid sort_by field
**Request:**
```bash
curl -X GET "http://localhost:4321/api/plans?sort_by=invalid_field"
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Invalid query parameters",
  "details": {
    "fieldErrors": {
      "sort_by": [
        "Invalid enum value. Expected 'created_at' | 'name', received 'invalid_field'"
      ]
    },
    "formErrors": []
  }
}
```

---

### 3. Invalid order value
**Request:**
```bash
curl -X GET "http://localhost:4321/api/plans?order=invalid_order"
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Invalid query parameters",
  "details": {
    "fieldErrors": {
      "order": [
        "Invalid enum value. Expected 'asc' | 'desc', received 'invalid_order'"
      ]
    },
    "formErrors": []
  }
}
```

---

### 4. Limit exceeds maximum (101)
**Request:**
```bash
curl -X GET "http://localhost:4321/api/plans?limit=101"
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Invalid query parameters",
  "details": {
    "fieldErrors": {
      "limit": [
        "Limit cannot exceed 100."
      ]
    },
    "formErrors": []
  }
}
```

---

### 5. Limit is zero
**Request:**
```bash
curl -X GET "http://localhost:4321/api/plans?limit=0"
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Invalid query parameters",
  "details": {
    "fieldErrors": {
      "limit": [
        "Limit must be at least 1."
      ]
    },
    "formErrors": []
  }
}
```

---

### 6. Negative offset
**Request:**
```bash
curl -X GET "http://localhost:4321/api/plans?offset=-1"
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Invalid query parameters",
  "details": {
    "fieldErrors": {
      "offset": [
        "Offset must be non-negative."
      ]
    },
    "formErrors": []
  }
}
```

---

### 7. Non-numeric limit value
**Request:**
```bash
curl -X GET "http://localhost:4321/api/plans?limit=abc"
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Invalid query parameters",
  "details": {
    "fieldErrors": {
      "limit": [
        "Expected number, received nan"
      ]
    },
    "formErrors": []
  }
}
```

---

### 8. Multiple validation errors
**Request:**
```bash
curl -X GET "http://localhost:4321/api/plans?status=invalid&limit=200&offset=-5"
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Invalid query parameters",
  "details": {
    "fieldErrors": {
      "status": [
        "Invalid enum value. Expected 'draft' | 'generated' | 'archived', received 'invalid'"
      ],
      "limit": [
        "Limit cannot exceed 100."
      ],
      "offset": [
        "Offset must be non-negative."
      ]
    },
    "formErrors": []
  }
}
```

---

## Testing with jq for pretty output

If you have `jq` installed, you can format the JSON output:

```bash
# Success case
curl -s "http://localhost:4321/api/plans" | jq .

# Error case
curl -s "http://localhost:4321/api/plans?limit=200" | jq .
```

## Testing Script

You can create a simple test script to verify all cases:

```bash
#!/bin/bash

BASE_URL="http://localhost:4321/api/plans"

echo "Testing GET /api/plans endpoint..."

# Positive tests
echo -e "\n1. Default parameters:"
curl -s "$BASE_URL" | jq .

echo -e "\n2. Filter by status=draft:"
curl -s "$BASE_URL?status=draft" | jq .

echo -e "\n3. Sort by name ascending:"
curl -s "$BASE_URL?sort_by=name&order=asc" | jq .

echo -e "\n4. Pagination (limit=1, offset=0):"
curl -s "$BASE_URL?limit=1&offset=0" | jq .

# Negative tests
echo -e "\n5. Invalid status:"
curl -s "$BASE_URL?status=invalid" | jq .

echo -e "\n6. Limit exceeds max:"
curl -s "$BASE_URL?limit=101" | jq .

echo -e "\n7. Negative offset:"
curl -s "$BASE_URL?offset=-1" | jq .

echo "Tests completed!"
```

