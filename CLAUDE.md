# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CityFlow is an AI-powered web application that transforms user notes and preferences into detailed, optimized city travel plans. Built as an MVP using Astro 5 with React 19 islands, backed by Supabase, and powered by OpenRouter.ai for AI generation.

## Commands

### Development

```bash
npm run dev              # Start dev server on http://localhost:3000
npm run build            # Production build
npm run preview          # Preview production build
npm run dev:e2e          # Dev server in test mode
```

### Testing

```bash
# Unit tests (Vitest)
npm run test:unit           # Run all unit tests
npm run test:unit:watch     # Watch mode
npm run test:unit:ui        # Vitest UI
npm run test:coverage       # Generate coverage report

# E2E tests (Playwright)
npm run test:e2e           # Run all E2E tests
npm run test:e2e:ui        # Playwright UI mode
npm run test:e2e -- auth/  # Run specific test suite

# Run a single test file
npx vitest run test/unit/path/to/file.test.ts
npx playwright test e2e/path/to/file.spec.ts
```

### Code Quality

```bash
npm run lint        # Run ESLint
npm run lint:fix    # Auto-fix linting issues
npm run format      # Format with Prettier
```

### Database (Supabase)

```bash
supabase start      # Start local Supabase
supabase db reset   # Reset database with seed data
npx supabase db push --linked  # Push migrations to remote
```

### Custom Commands

```bash
# Fix E2E tests for a specific file (Test + Lint + Types)
# Usage: /fix-e2e-tests <file_path>
/fix-e2e-tests e2e/auth/login.spec.ts
```

## Architecture

### Core Patterns

**Hybrid Rendering Strategy:**

- Use `.astro` components for static content and layouts
- Use `.tsx` (React) components only when interactivity is needed
- React components are "islands" of interactivity in otherwise static pages

**Authentication & Session Management:**

- Middleware (`src/middleware/index.ts`) handles authentication for all protected routes
- Always access Supabase client via `context.locals.supabase` in Astro routes/API endpoints
- Client-side: use `supabaseClient` from `src/db/supabase.client.ts`
- Server-side: use `createSupabaseServerInstance()` with cookies/headers context
- User info available in `context.locals.user` after middleware runs

**API Architecture:**

- API routes in `src/pages/api/` follow Astro's file-based routing
- Services in `src/lib/services/` contain business logic
- Services are pure functions that accept dependencies (Supabase client, user ID)
- Never import `supabaseClient` directly in services - always pass as parameter

**Data Flow:**

1. User interacts with React component (e.g., form submission)
2. Component calls API endpoint (`src/pages/api/`)
3. API endpoint validates input with Zod schemas (`src/lib/schemas/`)
4. API endpoint calls service function (`src/lib/services/`)
5. Service interacts with Supabase and returns result
6. API endpoint returns JSON response
7. Component updates UI

**Type Safety:**

- `src/types.ts` contains shared types for entities, DTOs, and enums
- `src/db/database.types.ts` is auto-generated from Supabase schema
- Use DTOs for API responses, not raw database types
- Validate all API inputs/outputs with Zod schemas

### Key Services

**Plan Generation (`plan-generation.service.ts`):**

- Orchestrates AI-powered itinerary generation via OpenRouter
- Combines user notes, preferences, fixed points, and profile settings
- Parses AI response and stores structured plan data

**Plan Management (`plan.service.ts`):**

- CRUD operations for travel plans
- Status transitions: `draft` → `generated` → `archived`
- Handles plan content structure and activity management

**PDF Export (`pdf.service.ts`):**

- Generates clean, text-only PDF from generated plans
- Uses pdf-lib for document generation

**Authentication Services:**

- `auth.service.ts` - Server-side auth operations
- `auth.client.service.ts` - Client-side auth operations (React components)

### Database & RLS

**CRITICAL SECURITY NOTE:**
RLS is currently in **DEVELOPMENT MODE** with permissive policies. Before production deployment:

1. Set production RLS flag: `ALTER DATABASE postgres SET app.enable_production_rls = 'true';`
2. Run migrations: `npx supabase db push --linked`
3. Verify policies active (see `supabase/RLS_DEVELOPMENT_GUIDE.md`)

**Database Structure:**

- `profiles` - User preferences and generation limits
- `plans` - Travel plan metadata and generated content
- `fixed_points` - User-specified must-see locations/activities
- `feedback` - User ratings and comments on generated plans

### Testing Strategy

**Unit Tests (Vitest):**

- Located in `test/unit/`
- Coverage thresholds: 80% lines, 80% functions, 75% branches
- Focus on services, utilities, schemas, and React components
- Excludes: Astro pages (E2E tested), shadcn/ui components

**E2E Tests (Playwright):**

- Located in `e2e/`
- ~149 tests across 7 categories
- Uses shared test users pool for performance
- Test users created in `global-setup.ts`, cleaned per test
- Page Object Model pattern in `e2e/page-objects/`

**Shared Test Users:**
Users like `BASIC_USER`, `PLAN_CREATOR`, `FEEDBACK_USER` are pre-created and reused. Import from `e2e/fixtures.ts` and clean up data with `cleanupUserData()` in beforeEach hooks.

### Directory Structure

```
src/
├── pages/           # Astro pages (file-based routing)
│   └── api/         # API endpoints
├── layouts/         # Astro layouts
├── components/      # UI components
│   ├── ui/          # Shadcn/ui components (don't modify)
│   └── */           # Feature-specific React components
├── middleware/      # Astro middleware (auth)
├── lib/
│   ├── services/    # Business logic (pure functions)
│   ├── schemas/     # Zod validation schemas
│   ├── utils/       # Helper functions
│   ├── constants/   # Shared constants
│   └── errors/      # Custom error types
├── hooks/           # React hooks
├── db/              # Supabase clients and types
└── types.ts         # Shared TypeScript types

e2e/
├── page-objects/    # Page Object Models
├── fixtures.ts      # Test fixtures and shared users
└── [feature]/       # Feature-specific E2E tests

test/
└── unit/           # Unit tests (mirrors src/ structure)

supabase/
├── migrations/     # Database migrations
└── *.md           # Database documentation
```

## Coding Guidelines

**Error Handling:**

- Handle errors at the beginning of functions
- Use early returns for error conditions
- Avoid deeply nested if statements
- Place happy path last for readability
- Use guard clauses for preconditions
- Log errors appropriately and return user-friendly messages

**Validation:**

- Use Zod schemas to validate all API inputs and outputs
- Schemas are in `src/lib/schemas/`
- Frontend forms also validate with Zod (using `@hookform/resolvers`)

**Styling:**

- Use Tailwind CSS 4 utility classes
- Use `dark:` variant for dark mode support
- Leverage responsive variants (`sm:`, `md:`, `lg:`)
- Use state variants (`hover:`, `focus-visible:`)
- Arbitrary values with square brackets for one-off designs (e.g., `w-[123px]`)

**Accessibility:**

- Use ARIA landmarks for page regions
- Apply appropriate ARIA roles to custom elements
- Use `aria-expanded`, `aria-controls` for expandable content
- Implement `aria-live` regions for dynamic updates
- Use `aria-label` or `aria-labelledby` for elements without visible labels
- Avoid redundant ARIA that duplicates native HTML semantics

**Node Version:**

- Use Node.js v22.x (specified in `.nvmrc` and `package.json` engines)

## Important Notes

**Environment Variables:**

- `.env` for local development
- `.env.test` for E2E tests
- Required vars: `SUPABASE_URL`, `SUPABASE_KEY`, `OPENROUTER_API_KEY`
- See `.github/ENV_TEST_SETUP.md` for test environment setup

**Usage Limits:**

- MVP provides 5 free plan generations per month per user
- Tracked in `profiles.generations_remaining`

**OpenRouter Integration:**

- AI model selection in `src/lib/services/openrouter.service.ts`
- Streaming responses supported
- Model configuration flexible via environment variables

**Deployment:**

- Vercel adapter configured (`@astrojs/vercel`)
- CI/CD via GitHub Actions (`.github/workflows/`)
- **Must enable production RLS before deploying!**
