'use client'

import { Calendar, Clock, MapPin, ChevronRight, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CitasPage() {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth')
                return
            }
            setUser(user)

            // Import dynamically to avoid server-side issues if any
            const { getUserAppointments } = await import('@/app/actions')
            const data = await getUserAppointments()
            setAppointments(data)
            setLoading(false)
        }
        fetchData()
    }, [router, supabase])

    const upcomingAppointments = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending')
    const pastAppointments = appointments.filter(a => a.status !== 'confirmed' && a.status !== 'pending')

    const displayedAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-24 p-4">
            <h1 className="text-3xl font-bold mb-2">Mis Citas</h1>
            {user && <p className="text-zinc-400 text-sm mb-6">Hola, {user.email}</p>}

            {/* Tabs */}
            <div className="flex border-b border-zinc-800 mb-6">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={cn(
                        "flex-1 py-3 text-center font-medium transition-colors relative",
                        activeTab === 'upcoming' ? "text-blue-500" : "text-zinc-500 hover:text-zinc-300"
                    )}
                >
                    Próximas
                    {activeTab === 'upcoming' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
                </button>
                <button
                    onClick={() => setActiveTab('past')}
                    className={cn(
                        "flex-1 py-3 text-center font-medium transition-colors relative",
                        activeTab === 'past' ? "text-blue-500" : "text-zinc-500 hover:text-zinc-300"
                    )}
                >
                    Pasadas
                    {activeTab === 'past' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
                </button>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-zinc-500">Cargando citas...</div>
                ) : displayedAppointments.length > 0 ? (
                    displayedAppointments.map((apt) => (
                        <div key={apt.id} className={cn(
                            "rounded-2xl p-5 border transition-all",
                            apt.status === 'confirmed'
                                ? "bg-zinc-900 border-zinc-800 border-l-4 border-l-green-500"
                                : "bg-zinc-900/50 border-zinc-800 opacity-75"
                        )}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block",
                                        apt.status === 'confirmed' ? "bg-green-500/10 text-green-500" : "bg-zinc-700 text-zinc-400"
                                    )}>
                                        {apt.status === 'confirmed' ? 'Confirmada' : 'Completada'}
                                    </span>
                                    <h3 className="font-bold text-lg">{apt.businessName}</h3>
                                    <p className="text-zinc-400 text-sm">{apt.serviceName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg capitalize">
                                        {format(parseISO(apt.date), 'MMM d', { locale: es })}
                                    </p>
                                    <p className="text-zinc-400 text-sm">{apt.time}</p>
                                </div>
                            </div>

                            <div className="flex items-center text-sm text-zinc-400 mb-4">
                                <MapPin size={14} className="mr-1" /> {apt.location}
                            </div>

                            {apt.status === 'confirmed' ? (
                                <div className="flex space-x-3">
                                    <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                                        Cancelar
                                    </button>
                                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                                        Ver Detalles
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center">
                                    <span className="text-xs text-zinc-500">RD$ {apt.price}</span>
                                    <Link href={`/reservar/${apt.businessId}`} className="text-blue-500 text-sm font-medium flex items-center hover:underline">
                                        Reservar de nuevo <ChevronRight size={14} />
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-zinc-500">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar size={32} className="text-zinc-600" />
                        </div>
                        <p>No tienes citas {activeTab === 'upcoming' ? 'próximas' : 'pasadas'}.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
