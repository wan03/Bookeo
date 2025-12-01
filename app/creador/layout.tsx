'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, User, CheckCircle, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export default function CreatorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
            {/* Mobile Header / Nav */}
            <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-40">
                <Link href="/creador/intercambios" className="relative w-24 h-8">
                    <Image
                        src="/logo.png"
                        alt="Bookeo Creator Logo"
                        fill
                        className="object-contain object-left"
                    />
                </Link>
                <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                        INF
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="hidden md:flex w-64 flex-col border-r border-zinc-800 bg-zinc-900/30 p-4 space-y-2">
                    <NavLink href="/creador/intercambios" icon={<Zap size={20} />} label="Intercambios" active={pathname === '/creador/intercambios'} />
                    <NavLink href="/creador/perfil" icon={<User size={20} />} label="Mi Perfil" active={pathname === '/creador/perfil'} />
                    <NavLink href="/creador/verificar" icon={<CheckCircle size={20} />} label="Verificación" active={pathname === '/creador/verificar'} />
                    <div className="flex-1" />
                    <button className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-red-400 transition-colors w-full">
                        <LogOut size={20} />
                        <span className="font-medium">Salir</span>
                    </button>
                </aside>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 pb-24">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center h-16 z-50 pb-safe">
                <MobileNavLink href="/creador/intercambios" icon={<Zap size={24} />} label="Intercambios" active={pathname === '/creador/intercambios'} />
                <MobileNavLink href="/creador/perfil" icon={<User size={24} />} label="Perfil" active={pathname === '/creador/perfil'} />
                <MobileNavLink href="/creador/verificar" icon={<CheckCircle size={24} />} label="Verificar" active={pathname === '/creador/verificar'} />
            </nav>
        </div>
    )
}

function NavLink({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                active ? "bg-purple-600/10 text-purple-500" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </Link>
    )
}

function MobileNavLink({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex flex-col items-center transition-colors",
                active ? "text-purple-500" : "text-zinc-500 hover:text-white"
            )}
        >
            {icon}
            <span className="text-[10px] mt-1">{label}</span>
        </Link>
    )
}
