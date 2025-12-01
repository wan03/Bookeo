'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle, XCircle, User, Phone } from 'lucide-react'
import { format, addDays, startOfToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Appointment } from '@/types'

interface CalendarClientProps {
    initialAppointments: Appointment[]
}

export default function CalendarClient({ initialAppointments }: CalendarClientProps) {
    const [selectedDate, setSelectedDate] = useState(startOfToday())
    const [appointments, setAppointments] = useState(initialAppointments)
    const [filter, setFilter] = useState<'all' | 'confirmed' | 'completed' | 'no_show'>('all')

    const handleStatusChange = (id: string, newStatus: 'completed' | 'no_show') => {
        setAppointments(apps => apps.map(app =>
            app.id === id ? { ...app, status: newStatus } : app
        ))
        // In a real app, we would call an API to update the status here
    }

    const filteredAppointments = appointments.filter(app => {
        if (filter === 'all') return true
        return app.status === filter
    })

    // Calculate stats
    const totalRevenue = appointments
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + a.price, 0)

    const completedCount = appointments.filter(a => a.status === 'completed').length
    const pendingCount = appointments.filter(a => a.status === 'confirmed').length

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Calendario de Citas</h1>
                    <p className="text-zinc-400 text-sm">Gestiona tus reservas y marca asistencias.</p>
                </div>

                {/* Date Selector (Simplified) */}
                <div className="flex items-center bg-zinc-900 rounded-xl p-1 border border-zinc-800">
                    {[-1, 0, 1, 2, 3].map(days => {
                        const date = addDays(startOfToday(), days)
                        const isSelected = date.toDateString() === selectedDate.toDateString()
                        return (
                            <button
                                key={days}
                                onClick={() => setSelectedDate(date)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center",
                                    isSelected ? "bg-blue-600 text-white shadow-lg" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                                )}
                            >
                                <span className="uppercase text-[10px] opacity-70">{format(date, 'EEE', { locale: es })}</span>
                                <span className="text-lg font-bold">{format(date, 'd')}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                    <p className="text-zinc-500 text-xs uppercase mb-1">Ingresos Hoy</p>
                    <p className="text-2xl font-bold text-green-400">RD$ {totalRevenue}</p>
                </div>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                    <p className="text-zinc-500 text-xs uppercase mb-1">Completadas</p>
                    <p className="text-2xl font-bold text-blue-500">{completedCount}</p>
                </div>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                    <p className="text-zinc-500 text-xs uppercase mb-1">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'confirmed', 'completed', 'no_show'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize whitespace-nowrap",
                            filter === f
                                ? "bg-white text-black border-white"
                                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600"
                        )}
                    >
                        {f === 'all' ? 'Todos' : f === 'confirmed' ? 'Pendientes' : f === 'completed' ? 'Completados' : 'No-Show'}
                    </button>
                ))}
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
                {filteredAppointments.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                        <CalendarIcon className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
                        <h3 className="text-lg font-medium text-zinc-400">No hay citas para este filtro</h3>
                    </div>
                ) : (
                    filteredAppointments.map(app => (
                        <div key={app.id} className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between group hover:border-blue-500/30 transition-colors">
                            <div className="flex items-start space-x-4 mb-4 md:mb-0">
                                <div className="bg-zinc-800 p-3 rounded-lg text-center min-w-[80px]">
                                    <p className="text-lg font-bold text-white">{app.time}</p>
                                    <p className="text-xs text-zinc-500">30 min</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white flex items-center">
                                        {app.clientName}
                                        {app.status === 'completed' && <CheckCircle size={16} className="ml-2 text-green-500" />}
                                        {app.status === 'no_show' && <XCircle size={16} className="ml-2 text-red-500" />}
                                    </h3>
                                    <p className="text-blue-400 text-sm font-medium mb-1">{app.serviceName}</p>
                                    <div className="flex items-center space-x-4 text-xs text-zinc-400">
                                        <span className="flex items-center"><Phone size={12} className="mr-1" /> 809-555-0000</span>
                                        <span className="flex items-center text-green-400 font-bold">RD$ {app.price}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {app.status === 'confirmed' && (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleStatusChange(app.id, 'no_show')}
                                        className="px-4 py-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 text-sm font-medium transition-colors"
                                    >
                                        No Show
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(app.id, 'completed')}
                                        className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-bold shadow-lg shadow-green-600/20 transition-all flex items-center"
                                    >
                                        <CheckCircle size={16} className="mr-2" />
                                        Completar
                                    </button>
                                </div>
                            )}

                            {app.status !== 'confirmed' && (
                                <div className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-500 text-sm font-medium capitalize">
                                    {app.status === 'completed' ? 'Completada' : 'No Asistió'}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
