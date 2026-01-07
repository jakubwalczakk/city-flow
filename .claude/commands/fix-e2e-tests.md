---
description: Fix all E2E tests in a specific file
argument-hint: <E2E_SPEC_FILE>
---

Please fix all E2E tests defined in `{{E2E_SPEC_FILE}}`.

To ensure the fix is complete and doesn't introduce regressions, you MUST use the provided verification script.

Follow these steps:

1. Run the verification script to see current failures:
   `./scripts/test-e2e-file.sh {{E2E_SPEC_FILE}}`
2. Analyze the output and fix the code/tests.
3. Run the verification script again to verify the fix.
4. Repeat until the script passes (Tests passed + Lint passed + Types passed).

Do not stop until `./scripts/test-e2e-file.sh {{E2E_SPEC_FILE}}` returns a success exit code (0).
