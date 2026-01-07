#!/bin/bash

# E2E Test Verification Script
# Usage: ./scripts/test-e2e-file.sh <test-file-path>
#
# This script runs three checks on an E2E test file:
# 1. Playwright tests
# 2. ESLint
# 3. TypeScript type checking
#
# Exit code 0 if all checks pass, 1 if any check fails

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <test-file-path>"
  echo "Example: $0 e2e/auth/login.spec.ts"
  exit 1
fi

TEST_FILE="$1"
EXIT_CODE=0

echo "STEP 1: Running Playwright tests for $TEST_FILE"
if ! npx playwright test "$TEST_FILE"; then
  echo "❌ Playwright tests failed."
  EXIT_CODE=1
else
  echo "✅ Playwright tests passed."
fi

echo ""
echo "STEP 2: Running ESLint on $TEST_FILE"
if ! npm run lint -- "$TEST_FILE"; then
  echo "❌ Lint failed."
  EXIT_CODE=1
else
  echo "✅ Lint passed."
fi

echo ""
echo "STEP 3: Running TypeScript type check"
if ! npx tsc --noEmit; then
  echo "❌ Types failed."
  EXIT_CODE=1
else
  echo "✅ Types passed."
fi

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo "🎉 All checks passed!"
else
  echo "❌ Some checks failed. Please fix the issues above."
fi

exit $EXIT_CODE
