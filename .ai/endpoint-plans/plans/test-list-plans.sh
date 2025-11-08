#!/bin/bash

# Test script for GET /api/plans endpoint
# Usage: ./test-list-plans.sh

BASE_URL="http://localhost:4321/api/plans"
SEPARATOR="=============================================="

echo "Testing GET /api/plans endpoint..."
echo ""

# Positive Tests
echo "$SEPARATOR"
echo "POSITIVE TEST 1: Default parameters"
echo "$SEPARATOR"
curl -s "$BASE_URL" | jq .
echo ""

echo "$SEPARATOR"
echo "POSITIVE TEST 2: Filter by status=draft"
echo "$SEPARATOR"
curl -s "$BASE_URL?status=draft" | jq .
echo ""

echo "$SEPARATOR"
echo "POSITIVE TEST 3: Filter by status=generated"
echo "$SEPARATOR"
curl -s "$BASE_URL?status=generated" | jq .
echo ""

echo "$SEPARATOR"
echo "POSITIVE TEST 4: Sort by name ascending"
echo "$SEPARATOR"
curl -s "$BASE_URL?sort_by=name&order=asc" | jq .
echo ""

echo "$SEPARATOR"
echo "POSITIVE TEST 5: Pagination (limit=1, offset=0)"
echo "$SEPARATOR"
curl -s "$BASE_URL?limit=1&offset=0" | jq .
echo ""

echo "$SEPARATOR"
echo "POSITIVE TEST 6: Combined filters"
echo "$SEPARATOR"
curl -s "$BASE_URL?status=draft&sort_by=created_at&order=asc&limit=5" | jq .
echo ""

# Negative Tests
echo "$SEPARATOR"
echo "NEGATIVE TEST 1: Invalid status"
echo "$SEPARATOR"
curl -s "$BASE_URL?status=invalid_status" | jq .
echo ""

echo "$SEPARATOR"
echo "NEGATIVE TEST 2: Invalid sort_by"
echo "$SEPARATOR"
curl -s "$BASE_URL?sort_by=invalid_field" | jq .
echo ""

echo "$SEPARATOR"
echo "NEGATIVE TEST 3: Limit exceeds maximum"
echo "$SEPARATOR"
curl -s "$BASE_URL?limit=101" | jq .
echo ""

echo "$SEPARATOR"
echo "NEGATIVE TEST 4: Limit is zero"
echo "$SEPARATOR"
curl -s "$BASE_URL?limit=0" | jq .
echo ""

echo "$SEPARATOR"
echo "NEGATIVE TEST 5: Negative offset"
echo "$SEPARATOR"
curl -s "$BASE_URL?offset=-1" | jq .
echo ""

echo "$SEPARATOR"
echo "NEGATIVE TEST 6: Non-numeric limit"
echo "$SEPARATOR"
curl -s "$BASE_URL?limit=abc" | jq .
echo ""

echo "$SEPARATOR"
echo "NEGATIVE TEST 7: Multiple validation errors"
echo "$SEPARATOR"
curl -s "$BASE_URL?status=invalid&limit=200&offset=-5" | jq .
echo ""

echo "$SEPARATOR"
echo "All tests completed!"
echo "$SEPARATOR"

