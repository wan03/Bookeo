'use client'

import { User, Settings, CreditCard, Heart, Bell, LogOut, ChevronRight, Calendar, Star, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PerfilPage() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth')
                return
            }
            setUser(user)

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            setProfile(profile)
            setLoading(false)
        }
        getData()
    }, [router, supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
                <Loader2 className="animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-24">
            {/* Header */}
            <div className="bg-zinc-900 p-6 pt-12 border-b border-zinc-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-4 border-zinc-900 shadow-xl overflow-hidden mb-4 bg-zinc-800 flex items-center justify-center">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={40} className="text-zinc-500" />
                        )}
                    </div>
                    <h1 className="text-2xl font-bold">{profile?.full_name || user?.email}</h1>
                    <p className="text-zinc-400 text-sm mb-6">{profile?.phone_number || 'Sin teléfono'}</p>

                    {/* Stats (Mocked for now as we don't have these tables populated for users yet) */}
                    <div className="flex justify-center space-x-8 w-full max-w-xs">
                        <div className="text-center">
                            <p className="text-xl font-bold">0</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider">Citas</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold">0</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider">Reseñas</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold">0</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider">Favoritos</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-4">
                <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
                    {[
                        { icon: Heart, label: "Mis Favoritos", color: "text-pink-500", badge: 0 },
                        { icon: CreditCard, label: "Métodos de Pago", color: "text-blue-500" },
                        { icon: Bell, label: "Notificaciones", color: "text-yellow-500", badge: 0 },
                    ].map((item, idx) => (
                        <button key={idx} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0 group">
                            <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center mr-3 ${item.color} group-hover:scale-110 transition-transform`}>
                                    <item.icon size={18} />
                                </div>
                                <span className="font-medium">{item.label}</span>
                            </div>
                            <div className="flex items-center">
                                {(item.badge || 0) > 0 && (
                                    <span className="bg-zinc-800 text-zinc-400 text-xs font-bold px-2 py-0.5 rounded-full mr-2">
                                        {item.badge}
                                    </span>
                                )}
                                <ChevronRight size={18} className="text-zinc-600" />
                            </div>
                        </button>
                    ))}
                </div>

                <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
                    <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-800 transition-colors border-b border-zinc-800 group">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center mr-3 text-zinc-400 group-hover:rotate-90 transition-transform duration-500">
                                <Settings size={18} />
                            </div>
                            <span className="font-medium">Configuración</span>
                        </div>
                        <ChevronRight size={18} className="text-zinc-600" />
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-between p-4 hover:bg-zinc-800 transition-colors text-red-500 group"
                    >
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center mr-3 group-hover:bg-red-500/20 transition-colors">
                                <LogOut size={18} />
                            </div>
                            <span className="font-medium">Cerrar Sesión</span>
                        </div>
                    </button>
                </div>

                <p className="text-center text-zinc-600 text-xs mt-8">
                    Bookeo v1.0.0 • Hecho con 🇩🇴 en Santo Domingo
                </p>
            </div>
        </div>
    )
}
