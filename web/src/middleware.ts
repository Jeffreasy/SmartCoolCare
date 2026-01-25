// import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

// Using the NextJS adapter which is compatible with standard Request/Response patterns
// or valid manual implementation if generic adapter available.
// Since we are in Astro, we might need a custom implementation or use the auth helper if compatible.
// Actually, standard Convex Auth middleware is for Next.js.
// For Astro, we usually check auth in a custom middleware function.

import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
    // 1. Define Protected Routes
    const publicRoutes = ["/", "/login", "/signup", "/forgot-password"];
    const isProtectedRoute = !publicRoutes.includes(context.url.pathname);

    // 2. Check Auth (Cookie)
    // Convex Auth stores token in cookie named constrained by library (usually __convexAuthToken)
    // But verify on server side in Astro is harder without the helper.
    // However, the CLIENT checks it.
    // For Server Side protection (redirect), we check existence of cookie.

    // Simplistic check: If dashboard and no cookie -> redirect
    // Note: This is "Soft Protection". Real protection is in the Data Query (which returns []).

    // Check for LaventeCare auth token
    const token = context.cookies.get("__convexAuthToken")?.value || context.cookies.get("__session")?.value;

    if (isProtectedRoute && !token) {
        return context.redirect("/login");
    }

    return next();
});
