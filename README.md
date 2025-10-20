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

### Hosting & CI/CD

- **Platform**: Vercel/Netlify

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

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:4321](http://localhost:4321) with your browser to see the result.

## Available Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production.
-   `npm run preview`: Serves the production build locally for preview.
-   `npm run lint`: Lints the code using ESLint.
-   `npm run lint:fix`: Lints the code and automatically fixes issues.
-   `npm run format`: Formats the code using Prettier.

## Project Scope

### Key Features

-   **AI-Powered Itinerary Generation**: Converts user notes, preferences, and fixed points into a detailed, hour-by-hour travel plan.
-   **User Authentication & Profiles**: Secure user registration and login (Email/Password, Google OAuth) with profiles for storing travel preferences.
-   **Plan Management (CRUD)**: Create, read, update, and delete travel plans.
-   **Simple Plan Editing**: Users can remove items from a generated plan and trigger the AI to rebuild and optimize the day's schedule.
-   **PDF Export**: Export the final itinerary to a clean, text-only PDF for offline use.
-   **Usage Limits**: As an MVP, registered users receive 5 free plan generations per month.
-   **Fully Responsive Design**: A seamless experience across desktop and mobile devices.

### Out of Scope for MVP

-   Native mobile applications.
-   Integrations with external booking services (flights, hotels).
-   Advanced social features like sharing or commenting on plans.
-   Multimedia support (e.g., uploading photos).

## Project Status

**Current Status: In Development (MVP)**

This project is currently in the Minimum Viable Product (MVP) development phase. The primary focus is on validating the core value proposition: generating useful, coherent, and personalized travel plans from simple user inputs.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
