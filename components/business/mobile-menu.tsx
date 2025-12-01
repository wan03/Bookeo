'use client'

import { X, LayoutDashboard, Calendar, List, Zap, Users, MessageSquare, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

interface BusinessMobileMenuProps {
    isOpen: boolean
    onClose: () => void
}

export default function BusinessMobileMenu({ isOpen, onClose }: BusinessMobileMenuProps) {
    const pathname = usePathname()

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900">
                <span className="font-bold text-lg">Menú del Negocio</span>
                <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white">
                    <X size={24} />
                </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <MenuLink href="/negocio/panel" icon={<LayoutDashboard size={20} />} label="Panel de Control" onClick={onClose} active={pathname === '/negocio/panel'} />
                <MenuLink href="/negocio/calendario" icon={<Calendar size={20} />} label="Calendario" onClick={onClose} active={pathname === '/negocio/calendario'} />
                <MenuLink href="/negocio/servicios" icon={<List size={20} />} label="Servicios" onClick={onClose} active={pathname === '/negocio/servicios'} />
                <MenuLink href="/negocio/intercambios" icon={<Zap size={20} />} label="Intercambios" onClick={onClose} active={pathname === '/negocio/intercambios'} />
                <MenuLink href="/negocio/clientes" icon={<Users size={20} />} label="Clientes" onClick={onClose} active={pathname === '/negocio/clientes'} />
                <MenuLink href="/negocio/marketing" icon={<MessageSquare size={20} />} label="Marketing" onClick={onClose} active={pathname === '/negocio/marketing'} />

                <div className="my-4 border-t border-zinc-800" />

                <MenuLink href="/negocio/ajustes" icon={<Settings size={20} />} label="Ajustes" onClick={onClose} active={pathname === '/negocio/ajustes'} />
                <button className="w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    )
}

function MenuLink({ href, icon, label, onClick, active }: { href: string, icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "flex items-center space-x-3 px-4 py-4 rounded-xl transition-colors",
                active ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            )}
        >
            {icon}
            <span className="font-medium text-lg">{label}</span>
        </Link>
    )
}
