import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerInstance } from "../db/supabase.client";

/**
 * Public paths that don't require authentication
 * Includes auth pages and API endpoints
 */
const PUBLIC_PATHS = [
  // Public pages
  "/",
  // Auth pages
  "/login",
  "/register",
  "/forgot-password",
  "/update-password",
  // API endpoints (will handle auth internally if needed)
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/reset-password",
  "/api/auth/update-password",
];

/**
 * Authentication middleware
 * Verifies user session and protects routes
 */
export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Create server-side Supabase client with cookie handling
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Make supabase client available in context
  locals.supabase = supabase;

  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  // Get authenticated user from session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // User is authenticated - store user info in locals
    locals.user = {
      id: user.id,
      email: user.email ?? "",
    };
  } else {
    // User is not authenticated - redirect to login for protected routes
    return redirect("/login");
  }

  return next();
});
