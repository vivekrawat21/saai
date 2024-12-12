import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(
    [
        "/sign-in",
        "/sign-up",
        "/",
        "home"
    ]
)
const isPublicApiRoute = createRouteMatcher([
    "/api/videos"
])
export default clerkMiddleware(async(auth, req) => {
    const { userId } = await auth();
    const currentUrl = new URL(req.url);
    const isAccessingDashboard = currentUrl.pathname === "/home";
    const isApiReq = currentUrl.pathname.startsWith("/api");
    
    if (userId && isPublicRoute(req) && !isAccessingDashboard) {
        return NextResponse.redirect(new URL("/home",req.url))
    }
    
    // Not logged in 
    if (!userId) {
        if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
            return NextResponse.redirect(new URL("/sign-in",req.url));
        }
        if (isApiReq && !isPublicApiRoute(req)) {
            return NextResponse.redirect(new URL("/sign-in",req.url));
        }
    }
    return NextResponse.next();
});

export const config = {
  matcher: [

    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};