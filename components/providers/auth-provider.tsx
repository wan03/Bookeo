'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
})

export const useAuth = () => {
    return useContext(AuthContext)
}

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const initializeAuth = async () => {
            const { data: { session }, error } = await supabase.auth.getSession()

            if (session) {
                setSession(session)
                setUser(session.user)
            } else {
                setSession(null)
                setUser(null)
            }
            setLoading(false)

            const { data: { subscription } } = supabase.auth.onAuthStateChange(
                async (event, session) => {
                    console.log('AuthProvider: Auth state change', event, session?.user?.email)
                    if (session) {
                        setSession(session)
                        setUser(session.user)
                    } else {
                        setSession(null)
                        setUser(null)
                    }
                    setLoading(false)
                }
            )

            return () => {
                subscription.unsubscribe()
            }
        }

        initializeAuth()
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    const value = {
        user,
        session,
        loading,
        signOut,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
