# CityFlow

An AI-powered web application designed to simplify the process of planning short city breaks by transforming user notes into detailed, optimized travel plans.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

CityFlow is an AI-powered web application (MVP) designed to simplify the process of planning short city breaks. The application transforms users' loose notes, travel goals, and defined preferences into detailed, optimized trip plans. The main value for the user is the ability to quickly generate a coherent sightseeing plan that considers logistics, time, and personal interests, and then export it to a PDF format.

## Tech Stack

### Frontend

- **Framework**: [Astro 5](https://astro.build/) with [React 19](https://react.dev/) for interactive components
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/)

### Backend

- **Platform**: [Supabase](https://supabase.io/)
  - PostgreSQL Database
  - Authentication
  - Backend-as-a-Service (BaaS)

### AI

- **Service**: [Openrouter.ai](https://openrouter.ai/) for access to a wide range of AI models

### Testing

- **Test Runner**: [Vitest](https://vitest.dev/)
- **Component Testing**: [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **E2E Testing**: [Playwright](https://playwright.dev/)
- **API Testing**: [Supertest](https://github.com/ladjs/supertest)

### Hosting & CI/CD

- **Platform**: Vercel/Netlify
- **CI/CD**: GitHub Actions (automated testing and build verification)
  - Automated linting and unit tests
  - Production build verification
  - E2E tests with Playwright
  - Manual and automatic triggers
  - See `.github/workflows/README.md` for details

## Getting Started Locally

### Prerequisites

- Node.js v22.15.0 (as specified in `.nvmrc`)
- npm (comes with Node.js)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/city-flow.git
    cd city-flow
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of the project and add the necessary environment variables for Supabase and Openrouter.

    ```env
    # Supabase
    PUBLIC_SUPABASE_URL=your_supabase_url
    PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

    # Openrouter.ai
    OPENROUTER_API_KEY=your_openrouter_api_key
    ```

4.  **Initialize the database:**

    ```bash
    # Start Supabase (first time)
    supabase start

    # Or reset the database (if already started)
    supabase db reset
    ```

    This will automatically create a default development user (see `supabase/SEED_DATA_GUIDE.md` for details).

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:4321](http://localhost:4321) with your browser to see the result.

## Available Scripts

### Development

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run preview`: Serves the production build locally for preview.

### Deployment to Production

> **⚠️ TODO: CRITICAL - ENABLE RLS BEFORE PRODUCTION DEPLOYMENT**
>
> Before deploying to production, you **MUST** enable Row Level Security (RLS) policies:
>
> 1. Set production RLS flag: `ALTER DATABASE postgres SET app.enable_production_rls = 'true';`
> 2. Run migrations: `npx supabase db push --linked`
> 3. Verify RLS is active (see `supabase/RLS_DEVELOPMENT_GUIDE.md`)
>
> **Without this step, your database will be exposed with unrestricted access!**

### Code Quality

- `npm run lint`: Lints the code using ESLint.
- `npm run lint:fix`: Lints the code and automatically fixes issues.
- `npm run format`: Formats the code using Prettier.

### Testing

- `npm run test:unit`: Runs unit tests with Vitest.
- `npm run test:unit:ui`: Runs unit tests with Vitest UI.
- `npm run test:e2e`: Runs end-to-end tests with Playwright.
- `npm run test:e2e:ui`: Runs end-to-end tests with Playwright UI.

### CI/CD

The project uses GitHub Actions for continuous integration and deployment. The pipeline automatically:

- ✅ Runs on every push to `master`/`main`
- ✅ Can be triggered manually from GitHub Actions tab
- ✅ Executes linting checks
- ✅ Runs unit tests
- ✅ Builds production version
- ✅ Runs E2E tests with Playwright

**Setup Instructions**:

- See `.github/workflows/README.md` for complete CI/CD documentation
- See `.github/ENV_TEST_SETUP.md` for environment variable configuration

## Project Scope

### Key Features

- **AI-Powered Itinerary Generation**: Converts user notes, preferences, and fixed points into a detailed, hour-by-hour travel plan.
- **User Authentication & Profiles**: Secure user registration and login (Email/Password, Google OAuth) with profiles for storing travel preferences.
- **Plan Management (CRUD)**: Create, read, update, and delete travel plans.
- **Simple Plan Editing**: Users can remove items from a generated plan and trigger the AI to rebuild and optimize the day's schedule.
- **PDF Export**: Export the final itinerary to a clean, text-only PDF for offline use.
- **Usage Limits**: As an MVP, registered users receive 5 free plan generations per month.
- **Fully Responsive Design**: A seamless experience across desktop and mobile devices.

### Out of Scope for MVP

- Native mobile applications.
- Integrations with external booking services (flights, hotels).
- Advanced social features like sharing or commenting on plans.
- Multimedia support (e.g., uploading photos).

## Project Status

**Current Status: In Development (MVP)**

This project is currently in the Minimum Viable Product (MVP) development phase. The primary focus is on validating the core value proposition: generating useful, coherent, and personalized travel plans from simple user inputs.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
