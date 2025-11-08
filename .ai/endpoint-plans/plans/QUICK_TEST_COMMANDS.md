# Quick Test Commands for GET /api/plans

## Prerequisites
Make sure your dev server is running:
```bash
npm run dev
```

## Quick Copy-Paste Commands

### ✅ Positive Tests

```bash
# Get all plans (default parameters)
curl -s "http://localhost:4321/api/plans" | jq .
```

```bash
# Filter by status: draft
curl -s "http://localhost:4321/api/plans?status=draft" | jq .
```

```bash
# Filter by status: generated
curl -s "http://localhost:4321/api/plans?status=generated" | jq .
```

```bash
# Filter by status: archived
curl -s "http://localhost:4321/api/plans?status=archived" | jq .
```

```bash
# Sort by name ascending
curl -s "http://localhost:4321/api/plans?sort_by=name&order=asc" | jq .
```

```bash
# Sort by name descending
curl -s "http://localhost:4321/api/plans?sort_by=name&order=desc" | jq .
```

```bash
# Pagination: First page (limit 1)
curl -s "http://localhost:4321/api/plans?limit=1&offset=0" | jq .
```

```bash
# Pagination: Second page (limit 1)
curl -s "http://localhost:4321/api/plans?limit=1&offset=1" | jq .
```

```bash
# Combined: draft plans, sorted by name, limit 5
curl -s "http://localhost:4321/api/plans?status=draft&sort_by=name&order=asc&limit=5" | jq .
```

---

### ❌ Negative Tests (should return 400 Bad Request)

```bash
# Invalid status
curl -s "http://localhost:4321/api/plans?status=invalid" | jq .
```

```bash
# Invalid sort_by field
curl -s "http://localhost:4321/api/plans?sort_by=unknown" | jq .
```

```bash
# Invalid order
curl -s "http://localhost:4321/api/plans?order=wrong" | jq .
```

```bash
# Limit too high (max is 100)
curl -s "http://localhost:4321/api/plans?limit=101" | jq .
```

```bash
# Limit is zero
curl -s "http://localhost:4321/api/plans?limit=0" | jq .
```

```bash
# Negative offset
curl -s "http://localhost:4321/api/plans?offset=-1" | jq .
```

```bash
# Non-numeric limit
curl -s "http://localhost:4321/api/plans?limit=abc" | jq .
```

```bash
# Multiple errors
curl -s "http://localhost:4321/api/plans?status=invalid&limit=200&offset=-5" | jq .
```

---

## Run All Tests at Once

Execute the test script:
```bash
./.ai/endpoint-plans/plans/test-list-plans.sh
```

---

## Without jq (raw JSON)

If you don't have `jq` installed:

```bash
# Get all plans
curl "http://localhost:4321/api/plans"

# Filter by status
curl "http://localhost:4321/api/plans?status=draft"

# Invalid status (error case)
curl "http://localhost:4321/api/plans?status=invalid"
```

---

## Using HTTPie (alternative to curl)

If you prefer HTTPie:

```bash
# Get all plans
http GET localhost:4321/api/plans

# With filters
http GET localhost:4321/api/plans status==draft sort_by==name order==asc

# Error case
http GET localhost:4321/api/plans status==invalid
```

