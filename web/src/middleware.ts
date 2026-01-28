import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
    // 1. Define Protected Routes
    const publicRoutes = ["/", "/login", "/signup", "/forgot-password"];

    // Check if the current path is protected
    // We strictly assume anything NOT in publicRoutes is protected + API routes might have their own guards
    const isProtectedRoute = !publicRoutes.includes(context.url.pathname) && !context.url.pathname.startsWith('/api/');

    // 2. Check Auth (Cookie)
    // We check for EITHER 'access_token' OR 'refresh_token'.
    // The backend refresh_token path fix ensures it's visible here.
    const accessToken = context.cookies.get("access_token")?.value;
    const refreshToken = context.cookies.get("refresh_token")?.value;

    const hasSession = !!(accessToken || refreshToken);

    if (isProtectedRoute && !hasSession) {
        return context.redirect("/login");
    }

    return next();
});
