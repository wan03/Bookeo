import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected Routes Logic
    if (request.nextUrl.pathname.startsWith('/negocio') || request.nextUrl.pathname.startsWith('/creador') || request.nextUrl.pathname.startsWith('/citas')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth', request.url))
        }

        // Fetch user role from metadata (faster, no RLS issues)
        const role = user.user_metadata?.role

        if (request.nextUrl.pathname.startsWith('/negocio') && role !== 'business_owner' && role !== 'admin' && role !== 'staff') {
            return NextResponse.redirect(new URL('/', request.url)) // Or unauthorized page
        }

        // Allow all authenticated users to view barter offers, but restrict other creator routes
        if (request.nextUrl.pathname.startsWith('/creador')) {
            // Public creator routes accessible to all authenticated users
            const publicCreatorRoutes = ['/creador/intercambios', '/creador/perfil/verificacion']
            const isPublicRoute = publicCreatorRoutes.some(route => request.nextUrl.pathname.startsWith(route))

            if (!isPublicRoute && role !== 'influencer' && role !== 'admin') {
                return NextResponse.redirect(new URL('/', request.url))
            }
        }

        // /citas is accessible to any authenticated user (or we could restrict to 'consumer' if needed)
    }

    return response
}
