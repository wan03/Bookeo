import { getBusinesses } from '@/app/actions/admin'
import BusinessesTable from '@/components/admin/businesses-table'
import { Building2 } from 'lucide-react'

export default async function AdminBusinessesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; filter?: string }>
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const filter = (params.filter as 'all' | 'verified' | 'unverified') || 'all'

    const { businesses, total } = await getBusinesses(page, 50, filter)

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Business Management</h2>
                    <p className="text-slate-400">Verify and manage service providers</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-semibold">{total}</span>
                    <span className="text-slate-400 text-sm">Total Businesses</span>
                </div>
            </div>

            {/* Businesses Table */}
            <BusinessesTable
                businesses={businesses}
                total={total}
                currentPage={page}
                currentFilter={filter}
            />
        </div>
    )
}
