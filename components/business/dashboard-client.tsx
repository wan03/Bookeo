'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock, DollarSign, TrendingUp, Users, Calendar, List, MessageSquare, Zap, Settings } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Appointment, Business } from '@/types'

interface DashboardClientProps {
    initialAppointments: Appointment[]
    business: Business
}

export default function DashboardClient({ initialAppointments, business }: DashboardClientProps) {
    const [appointments, setAppointments] = useState(initialAppointments)

    const handleStatusChange = (id: string, status: string) => {
        setAppointments(prev => prev.map(app =>
            app.id === id ? { ...app, status: status as any } : app
        ))
        // In a real app, we would call an API to update the status here
    }

    // Calculate stats
    const todaySales = appointments
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + a.price, 0)

    const currentRevenue = appointments
        .filter(a => a.status === 'completed') // In real app, filter by current month
        .reduce((sum, a) => sum + a.price, 0)

    const todayAppointments = appointments.length
    const remainingAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                    <div className="flex items-center space-x-2 text-zinc-400 mb-2">
                        <DollarSign size={16} />
                        <span className="text-xs uppercase tracking-wider">Ventas de Hoy</span>
                    </div>
                    <p className="text-2xl font-bold text-white">RD$ {todaySales.toLocaleString()}</p>
                    <div className="flex items-center text-green-400 text-xs mt-1">
                        <TrendingUp size={12} className="mr-1" />
                        <span>+15% vs semana pasada</span>
                    </div>
                </div>
                <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                    <div className="flex items-center space-x-2 text-zinc-400 mb-2">
                        <Users size={16} />
                        <span className="text-xs uppercase tracking-wider">Citas</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{todayAppointments}</p>
                    <div className="flex items-center text-zinc-500 text-xs mt-1">
                        <span>{remainingAppointments} restantes hoy</span>
                    </div>
                </div>
            </div>

            {/* Revenue Pace */}
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-500">
                            <TrendingUp size={16} />
                        </div>
                        <span className="text-sm font-bold text-zinc-200">Meta Mensual</span>
                    </div>
                    <span className="text-xs text-zinc-400">
                        {Math.round((currentRevenue / (business.monthlyRevenueGoal || 100000)) * 100)}%
                    </span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min((currentRevenue / (business.monthlyRevenueGoal || 100000)) * 100, 100)}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs text-zinc-500">
                    <span>RD$ {currentRevenue.toLocaleString()}</span>
                    <span>Meta: RD$ {(business.monthlyRevenueGoal || 100000).toLocaleString()}</span>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
                <h2 className="text-lg font-bold mb-4">Acceso Rápido</h2>
                <div className="grid grid-cols-3 gap-3">
                    <Link href="/negocio/calendario" className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col items-center justify-center hover:border-blue-500 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
                            <Calendar size={20} />
                        </div>
                        <span className="text-xs font-medium">Calendario</span>
                    </Link>
                    <Link href="/negocio/servicios" className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col items-center justify-center hover:border-purple-500 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-2">
                            <List size={20} />
                        </div>
                        <span className="text-xs font-medium">Servicios</span>
                    </Link>
                    <Link href="/negocio/marketing" className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col items-center justify-center hover:border-pink-500 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 mb-2">
                            <MessageSquare size={20} />
                        </div>
                        <span className="text-xs font-medium">Marketing</span>
                    </Link>
                    <Link href="/negocio/intercambios" className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col items-center justify-center hover:border-yellow-500 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-2">
                            <Zap size={20} />
                        </div>
                        <span className="text-xs font-medium">Canjes</span>
                    </Link>
                    <Link href="/negocio/clientes" className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col items-center justify-center hover:border-green-500 transition-colors opacity-50">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2">
                            <Users size={20} />
                        </div>
                        <span className="text-xs font-medium">Clientes</span>
                    </Link>
                    <Link href="/negocio/ajustes" className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col items-center justify-center hover:border-zinc-500 transition-colors opacity-50">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mb-2">
                            <Settings size={20} />
                        </div>
                        <span className="text-xs font-medium">Ajustes</span>
                    </Link>
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div>
                <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
                    <span>Agenda de Hoy</span>
                    <span className="text-xs font-normal text-zinc-400 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                        {new Date().toLocaleDateString()}
                    </span>
                </h2>

                <div className="space-y-3">
                    {appointments.length === 0 ? (
                        <p className="text-center text-zinc-500 py-8">No hay citas para hoy.</p>
                    ) : (
                        appointments.map(app => (
                            <div key={app.id} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 relative overflow-hidden">
                                {/* Status Indicator Strip */}
                                <div className={cn(
                                    "absolute left-0 top-0 bottom-0 w-1",
                                    app.status === 'completed' ? "bg-green-500" :
                                        app.status === 'no_show' ? "bg-red-500" :
                                            "bg-yellow-500"
                                )} />

                                <div className="flex justify-between items-start mb-3 pl-2">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 overflow-hidden">
                                            {app.avatar?.startsWith('http') ? (
                                                <img src={app.avatar} alt={app.clientName} className="w-full h-full object-cover" />
                                            ) : (
                                                app.avatar
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{app.clientName}</h3>
                                            <p className="text-xs text-zinc-400">{app.serviceName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white flex items-center justify-end">
                                            <Clock size={14} className="mr-1 text-zinc-500" />
                                            {app.time}
                                        </p>
                                        <p className="text-xs text-green-400 font-medium mt-1">RD$ {app.price}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                {app.status === 'pending' || app.status === 'confirmed' ? (
                                    <div className="flex space-x-2 pl-2 mt-4 pt-3 border-t border-zinc-800/50">
                                        <button
                                            onClick={() => handleStatusChange(app.id, 'completed')}
                                            className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-500 py-2 rounded-lg text-xs font-bold flex items-center justify-center transition-colors"
                                        >
                                            <CheckCircle size={14} className="mr-1" />
                                            Completada
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(app.id, 'no_show')}
                                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2 rounded-lg text-xs font-bold flex items-center justify-center transition-colors"
                                        >
                                            <XCircle size={14} className="mr-1" />
                                            No Show
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pl-2 mt-2">
                                        <span className={cn(
                                            "text-xs font-bold px-2 py-1 rounded-md inline-flex items-center",
                                            app.status === 'completed' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                        )}>
                                            {app.status === 'completed' ? "Completada" : "No Show"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
