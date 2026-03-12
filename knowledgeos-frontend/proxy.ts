import {NextRequest, NextResponse} from "next/server";

const authRoutes = ['/login', '/register'];
const publicRoutes: string[] = [];

export function proxy(request: NextRequest) {
    const {nextUrl} = request;
    const path = nextUrl.pathname;
    const token = request.cookies.get('token')?.value;

    const isPublicRoute = publicRoutes.includes(path);
    const isAuthRoute = authRoutes.includes(path);

    if(isAuthRoute && token) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }

    // callbackUrl for chosen page after login
    if(!token && !isPublicRoute && !isAuthRoute) {
        const loginUrl = new URL('/login', nextUrl);
        loginUrl.searchParams.set('callbackUrl',path);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();

}
//everything except api, _next/static, _next/image and favicon.ico will be processed
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}