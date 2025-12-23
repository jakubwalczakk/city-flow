# CI/CD Workflow Diagram

## 🔄 Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     TRIGGER EVENTS                          │
│  • Push to master/main                                      │
│  • Manual workflow_dispatch                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   CONCURRENCY CHECK                         │
│  Cancel previous runs for same branch                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              JOB 1: TEST & BUILD                            │
│              ubuntu-latest | 15min timeout                  │
├─────────────────────────────────────────────────────────────┤
│  1. ✅ Checkout repository                                  │
│  2. ✅ Setup Node.js (from .nvmrc) + npm cache                         │
│  3. ✅ Install dependencies (npm ci)                        │
│  4. ✅ Run linter (npm run lint)                            │
│  5. ✅ Run unit tests (npm run test:unit)                   │
│  6. ✅ Build production (npm run build)                     │
│     ├─ PUBLIC_SITE_URL                                      │
│     ├─ PUBLIC_SUPABASE_URL (from secrets)                   │
│     ├─ PUBLIC_SUPABASE_KEY (from secrets)                   │
│     ├─ SUPABASE_URL (from secrets)                          │
│     ├─ SUPABASE_KEY (from secrets)                          │
│     └─ OPENROUTER_API_KEY (from secrets)                    │
│  7. ✅ Upload build artifacts (7 days retention)            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ needs: test-and-build
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              JOB 2: E2E TESTS                               │
│              ubuntu-latest | 20min timeout                  │
├─────────────────────────────────────────────────────────────┤
│  1. ✅ Checkout repository                                  │
│  2. ✅ Setup Node.js (from .nvmrc) + npm cache                         │
│  3. ✅ Install dependencies (npm ci)                        │
│  4. ✅ Install Playwright browsers (chromium + deps)        │
│  5. ✅ Create .env.test file                                │
│     ├─ SUPABASE_URL (from secrets)                          │
│     ├─ SUPABASE_KEY (from secrets)                          │
│     ├─ PUBLIC_SUPABASE_URL (from secrets)                   │
│     ├─ PUBLIC_SUPABASE_KEY (from secrets)                   │
│     ├─ OPENROUTER_API_KEY (from secrets)                    │
│     └─ PUBLIC_SITE_URL=http://localhost:3000                │
│  6. ✅ Run E2E tests (npm run test:e2e)                     │
│  7. ✅ Upload Playwright report (on failure, 7 days)        │
│  8. ✅ Upload test results (always, 7 days)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW COMPLETE                        │
│  ✅ All tests passed → Ready to deploy                      │
│  ❌ Tests failed → Check logs and artifacts                 │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Decision Points

```
Push to master/main
    │
    ├─ Concurrency check
    │   ├─ Previous run exists? → Cancel it
    │   └─ No previous run? → Continue
    │
    ├─ Test & Build Job
    │   ├─ Linting fails? → ❌ Stop workflow
    │   ├─ Unit tests fail? → ❌ Stop workflow
    │   ├─ Build fails? → ❌ Stop workflow
    │   └─ All pass? → ✅ Continue to E2E
    │
    └─ E2E Tests Job
        ├─ E2E tests fail? → ❌ Upload reports → Stop
        └─ All pass? → ✅ Workflow complete
```

## 📊 Parallel vs Sequential

```
┌──────────────────────────────────────────────────────────┐
│                    SEQUENTIAL JOBS                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Job 1: Test & Build                                     │
│  ├─ Checkout                                             │
│  ├─ Setup Node                                           │
│  ├─ Install deps                                         │
│  ├─ Lint (parallel internally)                           │
│  ├─ Test (parallel internally)                           │
│  ├─ Build                                                │
│  └─ Upload artifacts                                     │
│                                                           │
│         │                                                 │
│         │ needs: test-and-build                          │
│         ▼                                                 │
│                                                           │
│  Job 2: E2E Tests                                        │
│  ├─ Checkout                                             │
│  ├─ Setup Node                                           │
│  ├─ Install deps                                         │
│  ├─ Install Playwright                                   │
│  ├─ Create .env.test                                     │
│  ├─ Run E2E tests                                        │
│  └─ Upload artifacts                                     │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## 🔐 Secrets Flow

```
GitHub Secrets (Repository Settings)
    │
    ├─ SUPABASE_URL ────────────┐
    ├─ SUPABASE_KEY ────────────┤
    ├─ PUBLIC_SUPABASE_URL ─────┼──→ Injected into workflow
    ├─ PUBLIC_SUPABASE_KEY ─────┤   as environment variables
    └─ OPENROUTER_API_KEY ──────┘
                │
                ├──→ Build step (Job 1)
                │    └─ Used during production build
                │
                └──→ .env.test file (Job 2)
                     └─ Used by Playwright tests
```

## 📦 Artifacts Flow

```
Job 1: Test & Build
    │
    └─ Build output (dist/)
        │
        └─ Upload to GitHub Artifacts
            ├─ Name: build-output
            ├─ Retention: 7 days
            └─ Available for download

Job 2: E2E Tests
    │
    ├─ Playwright report (on failure)
    │   │
    │   └─ Upload to GitHub Artifacts
    │       ├─ Name: playwright-report
    │       ├─ Retention: 7 days
    │       └─ Contains: HTML report, traces
    │
    └─ Test results (always)
        │
        └─ Upload to GitHub Artifacts
            ├─ Name: test-results
            ├─ Retention: 7 days
            └─ Contains: Screenshots, videos, logs
```

## ⏱️ Timing Breakdown

```
Total workflow time: ~8-12 minutes (typical)

Job 1: Test & Build (~5-7 min)
├─ Checkout: ~5s
├─ Setup Node + cache: ~10s (cached) / ~30s (first run)
├─ Install deps: ~30s (cached) / ~2min (first run)
├─ Lint: ~10s
├─ Unit tests: ~30s
├─ Build: ~2-3min
└─ Upload artifacts: ~10s

Job 2: E2E Tests (~3-5 min)
├─ Checkout: ~5s
├─ Setup Node + cache: ~10s (cached)
├─ Install deps: ~30s (cached)
├─ Install Playwright: ~1min
├─ Create .env.test: ~1s
├─ Run E2E tests: ~1-2min
└─ Upload artifacts: ~10s
```

## 🔄 Cache Strategy

```
npm cache
    │
    ├─ Key: hash of package-lock.json
    │
    ├─ Cached: node_modules dependencies
    │
    ├─ Hit: ~30s install time
    │
    └─ Miss: ~2min install time

Playwright browsers
    │
    ├─ Not cached (installed fresh each time)
    │
    ├─ Reason: Ensures latest browser versions
    │
    └─ Time: ~1min per run
```

## 🎨 Status Visualization

```
✅ SUCCESS
┌────────────────────────────────────┐
│ CI/CD Pipeline                     │
│ ✅ Test & Build (5m 23s)           │
│    ✅ Lint                          │
│    ✅ Unit tests                    │
│    ✅ Build                         │
│ ✅ E2E Tests (3m 45s)               │
│    ✅ Playwright tests              │
│                                     │
│ Total: 9m 8s                       │
└────────────────────────────────────┘

❌ FAILURE
┌────────────────────────────────────┐
│ CI/CD Pipeline                     │
│ ✅ Test & Build (5m 23s)           │
│    ✅ Lint                          │
│    ✅ Unit tests                    │
│    ✅ Build                         │
│ ❌ E2E Tests (2m 15s)               │
│    ❌ Playwright tests              │
│       └─ 3 tests failed            │
│                                     │
│ Artifacts:                         │
│ • playwright-report                │
│ • test-results                     │
└────────────────────────────────────┘
```

## 🚀 Extension Points

```
Current Workflow
    │
    ├─ [Future] Code Coverage
    │   └─ Add after unit tests
    │       ├─ Generate coverage report
    │       └─ Upload to Codecov
    │
    ├─ [Future] Security Scan
    │   └─ Add after build
    │       ├─ npm audit
    │       └─ Snyk scan
    │
    ├─ [Future] Performance Tests
    │   └─ Add after E2E tests
    │       ├─ Lighthouse CI
    │       └─ Bundle size check
    │
    └─ [Future] Deployment
        └─ Add after E2E tests (on main only)
            ├─ Deploy to staging
            ├─ Smoke tests
            └─ Deploy to production
```

---

**Legend**:

- ✅ Success step
- ❌ Failed step
- → Flow direction
- ├─ Branch/parallel
- └─ End of branch
- │ Continuation
