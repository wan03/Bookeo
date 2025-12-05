'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Building2,
    Calendar,
    Sparkles,
    Settings,
    TrendingUp,
    Shield
} from 'lucide-react'

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Businesses', href: '/admin/businesses', icon: Building2 },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Influencers', href: '/admin/influencers', icon: Sparkles },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 border-r border-slate-800/50 bg-slate-900/30 backdrop-blur-sm min-h-[calc(100vh-73px)]">
            <nav className="p-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }
              `}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                            {isActive && (
                                <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Stats Summary */}
            <div className="p-4 mt-8">
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            Admin Access
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        You have full platform control. All actions are logged and audited.
                    </p>
                </div>
            </div>
        </aside>
    )
}
