import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
    // 1. Define Protected Routes
    const publicRoutes = ["/", "/login", "/signup", "/forgot-password"];

    // Check if the current path is protected
    // We strictly assume anything NOT in publicRoutes is protected + API routes might have their own guards
    const isProtectedRoute = !publicRoutes.includes(context.url.pathname) && !context.url.pathname.startsWith('/api/');

    // 2. Check Auth (Cookie)
    // The AuthContext sets '__session' cookie on login
    const token = context.cookies.get("__session")?.value;

    if (isProtectedRoute && !token) {
        return context.redirect("/login");
    }

    return next();
});
