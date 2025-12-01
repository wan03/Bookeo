'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from 'lucide-react'

export default function Header() {
    const pathname = usePathname()
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    // Don't show global header on business dashboard
    if (pathname?.startsWith('/negocio')) {
        return null
    }
    return (
        <header className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <Link href="/" className="pointer-events-auto">
                <div className="relative w-32 h-10">
                    <Image
                        src="/logo.png"
                        alt="Bookeo Logo"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </div>
            </Link>

            <div className="pointer-events-auto">
                {user ? (
                    <Link href="/perfil" className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                        <User size={20} className="text-zinc-400" />
                    </Link>
                ) : (
                    <Link href="/auth" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                        Iniciar Sesión
                    </Link>
                )}
            </div>
        </header>
    )
}
