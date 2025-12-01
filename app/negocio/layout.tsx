'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, List, Users, Settings, LogOut, Menu, MoreHorizontal, Zap, MessageSquare, Clock, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import BusinessMobileMenu from '@/components/business/mobile-menu'
import { createClient } from '@/lib/supabase/client'

export default function BusinessLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [userRole, setUserRole] = useState<'owner' | 'staff'>('owner')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRole = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profile?.role === 'staff') {
                    setUserRole('staff')
                }
                // Default is owner, or we could handle other roles
            }
            setLoading(false)
        }
        fetchRole()
    }, [])

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
            {/* Mobile Header / Nav */}
            <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-40">
                <Link href="/negocio/panel" className="relative w-24 h-8">
                    <Image
                        src="/logo.png"
                        alt="Bookeo Biz Logo"
                        fill
                        className="object-contain object-left"
                    />
                </Link>
                <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                        BP
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar (Hidden on mobile for now, simplified for prototype) */}
                <aside className="hidden md:flex w-64 flex-col border-r border-zinc-800 bg-zinc-900/30 p-4 space-y-2">
                    {/* Role Toggle for Demo */}
                    <div className="mb-4 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                        <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-bold">Vista de Rol (Demo)</p>
                        <div className="flex bg-black rounded-lg p-1">
                            <button
                                onClick={() => setUserRole('owner')}
                                className={cn(
                                    "flex-1 text-xs py-1.5 rounded-md font-medium transition-colors",
                                    userRole === 'owner' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                Dueño
                            </button>
                            <button
                                onClick={() => setUserRole('staff')}
                                className={cn(
                                    "flex-1 text-xs py-1.5 rounded-md font-medium transition-colors",
                                    userRole === 'staff' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                Staff
                            </button>
                        </div>
                    </div>

                    <NavLink href="/negocio/panel" icon={<LayoutDashboard size={20} />} label="Inicio" active={pathname === '/negocio/panel'} />
                    <NavLink href="/negocio/calendario" icon={<Calendar size={20} />} label="Calendario" active={pathname === '/negocio/calendario'} />
                    <NavLink href="/negocio/disponibilidad" icon={<Clock size={20} />} label="Disponibilidad" active={pathname === '/negocio/disponibilidad'} />
                    <NavLink href="/negocio/servicios" icon={<List size={20} />} label="Servicios" active={pathname === '/negocio/servicios'} />
                    <NavLink href="/negocio/intercambios" icon={<Zap size={20} />} label="Intercambios" active={pathname === '/negocio/intercambios'} />
                    <NavLink href="/negocio/clientes" icon={<Users size={20} />} label="Clientes" active={pathname === '/negocio/clientes'} />

                    {userRole === 'owner' && (
                        <>
                            <NavLink href="/negocio/marketing" icon={<MessageSquare size={20} />} label="Marketing" active={pathname === '/negocio/marketing'} />
                            <div className="flex-1" />
                            <NavLink href="/negocio/ajustes" icon={<Settings size={20} />} label="Ajustes" active={pathname === '/negocio/ajustes'} />
                        </>
                    )}

                    {userRole === 'staff' && <div className="flex-1" />}

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

            {/* Mobile Bottom Nav for Business */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center h-16 z-50 pb-safe">
                <MobileNavLink href="/negocio/panel" icon={<LayoutDashboard size={24} />} label="Inicio" active={pathname === '/negocio/panel'} />
                <MobileNavLink href="/negocio/calendario" icon={<Calendar size={24} />} label="Calendario" active={pathname === '/negocio/calendario'} />
                <MobileNavLink href="/negocio/servicios" icon={<List size={24} />} label="Servicios" active={pathname === '/negocio/servicios'} />
                {userRole === 'owner' && (
                    <MobileNavLink href="/negocio/marketing" icon={<MessageSquare size={24} />} label="Marketing" active={pathname === '/negocio/marketing'} />
                )}
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className={cn(
                        "flex flex-col items-center transition-colors",
                        isMenuOpen ? "text-blue-500" : "text-zinc-500 hover:text-white"
                    )}
                >
                    <Menu size={24} />
                    <span className="text-[10px] mt-1">Menú</span>
                </button>
            </nav>

            <BusinessMobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </div>
    )
}

function NavLink({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                active ? "bg-blue-600/10 text-blue-500" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
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
                active ? "text-blue-500" : "text-zinc-500 hover:text-white"
            )}
        >
            {icon}
            <span className="text-[10px] mt-1">{label}</span>
        </Link>
    )
}
