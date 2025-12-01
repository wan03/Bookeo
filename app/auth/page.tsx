import AuthClient from './AuthClient'

export default function Page({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
    const rawRedirect = searchParams?.redirect
    const redirectTo = typeof rawRedirect === 'string'
        ? rawRedirect
        : Array.isArray(rawRedirect)
            ? rawRedirect[0] ?? '/'
            : '/'

    return <AuthClient redirectTo={redirectTo} />
}
