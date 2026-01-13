#!/bin/bash

# A script to test the PDF export endpoint.
#
# Usage:
# 1. Make sure your dev server is running: `npm run dev`
# 2. Make sure this script is executable: `chmod +x test-export.sh`
# 3. Run the script: `./test-export.sh`

# --- Configuration ---
HOST="http://localhost:3000"
PLAN_API_URL="$HOST/api/plans"

echo "Starting PDF export endpoint test..."
echo "=========================================="

# --- Step 1: Get list of plans ---
echo "Step 1: Fetching list of plans..."

PLANS_JSON=$(curl -s "$PLAN_API_URL?limit=10&offset=0&sort_by=created_at&order=desc")

# --- Validate Step 1 ---
if [ -z "$PLANS_JSON" ] || ! echo "$PLANS_JSON" | grep -q '"data"'; then
  echo "❌ Error: Failed to fetch plans list."
  echo "Response from plans endpoint:"
  echo "$PLANS_JSON"
  exit 1
fi

echo "✅ Plans fetched successfully."

# --- Step 2: Find a generated plan ---
echo "Step 2: Looking for a plan with 'generated' status..."

# Try to extract a plan ID with status 'generated'
PLAN_ID=$(echo "$PLANS_JSON" | grep -o '"id":"[^"]*"[^}]*"status":"generated"' | grep -o '"id":"[^"]*' | grep -o '[^"]*$' | head -1)

if [ -z "$PLAN_ID" ]; then
  echo "⚠️  Warning: No generated plans found in the database."
  echo "Please run test-generation.sh first to create a generated plan."
  exit 1
fi

echo "✅ Found generated plan with ID: $PLAN_ID"
echo ""

# --- Step 3: Test export with missing format parameter (should fail with 400) ---
echo "Step 3: Testing export without format parameter (expecting 400 error)..."
EXPORT_URL="$PLAN_API_URL/$PLAN_ID/export"

ERROR_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$EXPORT_URL")
HTTP_CODE=$(echo "$ERROR_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)

if [ "$HTTP_CODE" = "400" ]; then
  echo "✅ Correctly returned 400 Bad Request for missing format parameter"
else
  echo "❌ Expected 400 but got: $HTTP_CODE"
fi
echo ""

# --- Step 4: Test export with invalid format parameter (should fail with 400) ---
echo "Step 4: Testing export with invalid format (expecting 400 error)..."

ERROR_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$EXPORT_URL?format=docx")
HTTP_CODE=$(echo "$ERROR_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)

if [ "$HTTP_CODE" = "400" ]; then
  echo "✅ Correctly returned 400 Bad Request for invalid format"
else
  echo "❌ Expected 400 but got: $HTTP_CODE"
fi
echo ""

# --- Step 5: Test successful PDF export ---
echo "Step 5: Testing successful PDF export with format=pdf..."

PDF_FILE="test-export-$PLAN_ID.pdf"
curl -s "$EXPORT_URL?format=pdf" -o "$PDF_FILE" -w "HTTP_CODE:%{http_code}\n" > /tmp/export_result.txt
HTTP_CODE=$(cat /tmp/export_result.txt | grep "HTTP_CODE:" | cut -d: -f2)

if [ "$HTTP_CODE" = "200" ]; then
  # Check if file was created and has content
  if [ -f "$PDF_FILE" ] && [ -s "$PDF_FILE" ]; then
    FILE_SIZE=$(wc -c < "$PDF_FILE")
    echo "✅ PDF export successful!"
    echo "   File: $PDF_FILE"
    echo "   Size: $FILE_SIZE bytes"
    
    # Check if it's actually a PDF (starts with %PDF)
    if head -c 4 "$PDF_FILE" | grep -q "%PDF"; then
      echo "   ✅ File is a valid PDF"
    else
      echo "   ⚠️  File doesn't appear to be a valid PDF"
    fi
  else
    echo "❌ HTTP 200 but file is empty or doesn't exist"
  fi
else
  echo "❌ Expected 200 but got: $HTTP_CODE"
  echo "Response:"
  cat /tmp/export_result.txt
fi
echo ""

# --- Step 6: Test export on draft plan (should fail with 409) ---
echo "Step 6: Looking for a draft plan to test 409 Conflict error..."

DRAFT_PLAN_ID=$(echo "$PLANS_JSON" | grep -o '"id":"[^"]*"[^}]*"status":"draft"' | grep -o '"id":"[^"]*' | grep -o '[^"]*$' | head -1)

if [ -z "$DRAFT_PLAN_ID" ]; then
  echo "⚠️  No draft plans found, skipping 409 test"
else
  echo "Found draft plan with ID: $DRAFT_PLAN_ID"
  DRAFT_EXPORT_URL="$PLAN_API_URL/$DRAFT_PLAN_ID/export"
  
  ERROR_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$DRAFT_EXPORT_URL?format=pdf")
  HTTP_CODE=$(echo "$ERROR_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
  
  if [ "$HTTP_CODE" = "409" ]; then
    echo "✅ Correctly returned 409 Conflict for draft plan"
  else
    echo "❌ Expected 409 but got: $HTTP_CODE"
  fi
fi
echo ""

echo "=========================================="
echo "PDF Export Test Complete!"
echo "=========================================="

exit 0

