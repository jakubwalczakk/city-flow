#!/bin/bash

# A script to test the end-to-end plan generation flow.
#
# Usage:
# 1. Make sure your dev server is running: `npm run dev`
# 2. Make sure this script is executable: `chmod +x test-generation.sh`
# 3. Run the script: `./test-generation.sh`

# --- Configuration ---
HOST="http://localhost:3000"
PLAN_API_URL="$HOST/api/plans"

echo "Starting end-to-end plan generation test..."
echo "=========================================="

# --- Step 1: Create a new draft plan ---
echo "Step 1: Creating a new draft plan for a trip to Rome..."

DRAFT_PLAN_JSON=$(curl -s -X POST "$PLAN_API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Automated Test Trip to Rome",
    "destination": "Rome, Italy",
    "start_date": "2026-05-10T00:00:00.000Z",
    "end_date": "2026-05-13T00:00:00.000Z",
    "notes": "I want to see the main historical sites like the Colosseum and Vatican City. Also, I love pasta and want recommendations for great local food areas."
  }')

# --- Validate Step 1 ---
if [ -z "$DRAFT_PLAN_JSON" ] || ! echo "$DRAFT_PLAN_JSON" | grep -q '"id"'; then
  echo "❌ Error: Failed to create the draft plan."
  echo "Response from plans endpoint:"
  echo "$DRAFT_PLAN_JSON"
  exit 1
fi

PLAN_ID=$(echo "$DRAFT_PLAN_JSON" | grep -o '"id":"[^"]*' | grep -o '[^"]*$' | tail -1)
echo "✅ Success! Draft plan created with ID: $PLAN_ID"
echo ""

# --- Step 2: Add a fixed point ---
FIXED_POINT_URL="$PLAN_API_URL/$PLAN_ID/fixed-points"
echo "Step 2: Adding a fixed point to the plan..."

FIXED_POINT_JSON=$(curl -s -X POST "$FIXED_POINT_URL" \
    -H "Content-Type: application/json" \
    -d '{
    "location": "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
    "event_at": "2026-05-11T14:00:00.000Z",
    "event_duration": 180,
    "description": "Guided tour of the Colosseum underground and arena."
    }')

# --- Validate Step 2 ---
if [ -z "$FIXED_POINT_JSON" ] || ! echo "$FIXED_POINT_JSON" | grep -q '"id"'; then
    echo "❌ Error: Failed to create the fixed point."
    echo "Response from fixed points endpoint:"
    echo "$FIXED_POINT_JSON"
    exit 1
fi

echo "✅ Success! Fixed point added."
echo ""

# --- Step 3: Trigger AI Generation ---
GENERATION_URL="$PLAN_API_URL/$PLAN_ID/generate"
echo "Step 3: Triggering AI plan generation for plan ID $PLAN_ID..."
echo "(This may take up to 20 seconds)"

GENERATED_PLAN_JSON=$(curl -s -X POST "$GENERATION_URL")

# --- Validate Step 3 ---
if [ -z "$GENERATED_PLAN_JSON" ] || ! echo "$GENERATED_PLAN_JSON" | grep -q '"generated_content"'; then
  echo "❌ Error: AI generation failed."
  echo "Response received from generation endpoint:"
  echo "$GENERATED_PLAN_JSON"
  exit 1
fi

echo "✅ Success! AI generation completed."
echo ""
echo "=========================================="
echo "Final Generated Plan:"
echo "=========================================="
# Use jq to pretty-print the JSON if available
if command -v jq &> /dev/null
then
    echo "$GENERATED_PLAN_JSON" | jq
else
    echo "$GENERATED_PLAN_JSON"
fi

exit 0
