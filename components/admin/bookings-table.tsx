'use client'

import { adminCancelBooking } from '@/app/actions/admin'
import { useState } from 'react'
import { Calendar, Clock, User, Building2, Ban, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Booking {
    id: string
    created_at: string
    start_time: string
    end_time: string
    status: string
    price: number
    businesses: { name: string } | null
    profiles: { full_name: string; email: string } | null
    services: { name: string } | null
}

interface BookingsTableProps {
    bookings: Booking[]
    total: number
    currentPage: number
    currentFilter: string
}

const statusColors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-500/10',
    confirmed: 'text-green-400 bg-green-500/10',
    completed: 'text-blue-400 bg-blue-500/10',
    cancelled: 'text-red-400 bg-red-500/10',
    no_show: 'text-slate-400 bg-slate-500/10'
}

const statusIcons: Record<string, any> = {
    pending: AlertCircle,
    confirmed: CheckCircle,
    completed: CheckCircle,
    cancelled: XCircle,
    no_show: Ban
}

export default function BookingsTable({
    bookings,
    total,
    currentPage,
    currentFilter
}: BookingsTableProps) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    const handleCancel = async (bookingId: string) => {
        const reason = prompt('Enter cancellation reason (required):')
        if (!reason) return

        setLoading(bookingId)
        const success = await adminCancelBooking(bookingId, reason)
        if (success) {
            alert('Booking cancelled successfully!')
            router.refresh()
        } else {
            alert('Failed to cancel booking')
        }
        setLoading(null)
    }

    const handleFilterChange = (filter: string) => {
        router.push(`/admin/bookings?filter=${filter}&page=1`)
    }

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50">
            {/* Filter Tabs */}
            <div className="flex gap-2 p-4 border-b border-slate-800/50 overflow-x-auto">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => handleFilterChange(filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${currentFilter === filter
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-800/50">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Booking Details
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Business
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {bookings.map((booking) => {
                            const StatusIcon = statusIcons[booking.status] || AlertCircle
                            const statusColor = statusColors[booking.status] || 'text-slate-400 bg-slate-500/10'
                            const date = new Date(booking.start_time)

                            return (
                                <tr key={booking.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">
                                                    {booking.services?.name || 'Unknown Service'}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {date.toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm text-white">{booking.profiles?.full_name || 'Unknown'}</p>
                                            <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                                <User className="w-3 h-3" />
                                                {booking.profiles?.email || 'No email'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-slate-500" />
                                            <span className="text-sm text-slate-300">
                                                {booking.businesses?.name || 'Unknown Business'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-white">
                                            RD$ {booking.price.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {['pending', 'confirmed'].includes(booking.status) && (
                                            <button
                                                onClick={() => handleCancel(booking.id)}
                                                disabled={loading === booking.id}
                                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {loading === booking.id ? 'Cancelling...' : 'Cancel'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {bookings.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No bookings found</p>
                </div>
            )}

            {/* Pagination */}
            {total > 50 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/50">
                    <p className="text-sm text-slate-400">
                        Showing {(currentPage - 1) * 50 + 1} to {Math.min(currentPage * 50, total)} of {total} bookings
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push(`/admin/bookings?filter=${currentFilter}&page=${currentPage - 1}`)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => router.push(`/admin/bookings?filter=${currentFilter}&page=${currentPage + 1}`)}
                            disabled={currentPage * 50 >= total}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
