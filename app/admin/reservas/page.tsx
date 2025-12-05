import { getAllBookings } from '@/app/actions/admin'
import BookingsTable from '@/components/admin/bookings-table'
import { Calendar } from 'lucide-react'

export default async function AdminBookingsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; filter?: string }>
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const filter = params.filter || 'all'

    const { bookings, total } = await getAllBookings(page, 50, filter)

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Gestión de Reservas</h2>
                    <p className="text-slate-400">Monitorear y gestionar citas de la plataforma</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-semibold">{total}</span>
                    <span className="text-slate-400 text-sm">Reservas Totales</span>
                </div>
            </div>

            {/* Bookings Table */}
            <BookingsTable
                bookings={bookings}
                total={total}
                currentPage={page}
                currentFilter={filter}
            />
        </div>
    )
}
