'use client'

import { BusinessWithDetails } from '@/app/actions/admin'
import { verifyBusiness, rejectBusiness } from '@/app/actions/admin'
import { useState } from 'react'
import { CheckCircle, XCircle, Building2, Mail, MapPin, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BusinessesTableProps {
    businesses: BusinessWithDetails[]
    total: number
    currentPage: number
    currentFilter: 'all' | 'verified' | 'unverified'
}

export default function BusinessesTable({
    businesses,
    total,
    currentPage,
    currentFilter
}: BusinessesTableProps) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    const handleVerify = async (businessId: string) => {
        setLoading(businessId)
        const success = await verifyBusiness(businessId)
        if (success) {
            alert('Business verified successfully!')
            router.refresh()
        } else {
            alert('Failed to verify business')
        }
        setLoading(null)
    }

    const handleReject = async (businessId: string) => {
        const reason = prompt('Enter rejection reason (optional):')
        setLoading(businessId)
        const success = await rejectBusiness(businessId, reason || undefined)
        if (success) {
            alert('Business unverified successfully!')
            router.refresh()
        } else {
            alert('Failed to unverify business')
        }
        setLoading(null)
    }

    const handleFilterChange = (filter: string) => {
        router.push(`/admin/businesses?filter=${filter}&page=1`)
    }

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50">
            {/* Filter Tabs */}
            <div className="flex gap-2 p-4 border-b border-slate-800/50">
                {['all', 'verified', 'unverified'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => handleFilterChange(filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentFilter === filter
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
                                Business
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Owner
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Stats
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {businesses.map((business) => (
                            <tr key={business.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {business.imageUrl ? (
                                            <img
                                                src={business.imageUrl}
                                                alt={business.name}
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-slate-600" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-white">{business.name}</p>
                                            <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                {business.address || 'No address'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="text-sm text-white">{business.ownerName || 'Unknown'}</p>
                                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                            <Mail className="w-3 h-3" />
                                            {business.ownerEmail || 'No email'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400">
                                        {business.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {business.isVerified ? (
                                        <span className="flex items-center gap-1 text-green-400 text-sm">
                                            <CheckCircle className="w-4 h-4" />
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-yellow-400 text-sm">
                                            <XCircle className="w-4 h-4" />
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1 text-xs text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-400" />
                                            {business.rating.toFixed(1)} ({business.reviewCount} reviews)
                                        </div>
                                        <div>{business.serviceCount} services</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {!business.isVerified ? (
                                            <button
                                                onClick={() => handleVerify(business.id)}
                                                disabled={loading === business.id}
                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {loading === business.id ? 'Verifying...' : 'Verify'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleReject(business.id)}
                                                disabled={loading === business.id}
                                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {loading === business.id ? 'Processing...' : 'Unverify'}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {businesses.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No businesses found</p>
                </div>
            )}

            {/* Pagination */}
            {total > 50 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/50">
                    <p className="text-sm text-slate-400">
                        Showing {(currentPage - 1) * 50 + 1} to {Math.min(currentPage * 50, total)} of {total} businesses
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push(`/admin/businesses?filter=${currentFilter}&page=${currentPage - 1}`)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => router.push(`/admin/businesses?filter=${currentFilter}&page=${currentPage + 1}`)}
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
