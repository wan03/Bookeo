import AuthClient from './AuthClient'

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const params = await searchParams
    const rawRedirect = params?.redirect
    const redirectTo = typeof rawRedirect === 'string'
        ? rawRedirect
        : Array.isArray(rawRedirect)
            ? rawRedirect[0] ?? '/'
            : '/'

    return <AuthClient redirectTo={redirectTo} />
}
