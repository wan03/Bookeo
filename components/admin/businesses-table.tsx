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
            alert('¡Negocio verificado con éxito!')
            router.refresh()
        } else {
            alert('Error al verificar el negocio')
        }
        setLoading(null)
    }

    const handleReject = async (businessId: string) => {
        const reason = prompt('Introduce la razón del rechazo (opcional):')
        setLoading(businessId)
        const success = await rejectBusiness(businessId, reason || undefined)
        if (success) {
            alert('¡Negocio desverificado con éxito!')
            router.refresh()
        } else {
            alert('Error al desverificar el negocio')
        }
        setLoading(null)
    }

    const handleFilterChange = (filter: string) => {
        router.push(`/admin/negocios?filter=${filter}&page=1`)
    }

    const filterLabels: Record<string, string> = {
        all: 'Todos',
        verified: 'Verificados',
        unverified: 'No verificados'
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
                        {filterLabels[filter] || filter}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-800/50">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Negocio
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Dueño
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Categoría
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Estadísticas
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Acciones
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
                                                {business.address || 'Sin dirección'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="text-sm text-white">{business.ownerName || 'Desconocido'}</p>
                                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                            <Mail className="w-3 h-3" />
                                            {business.ownerEmail || 'Sin email'}
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
                                            Verificado
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-yellow-400 text-sm">
                                            <XCircle className="w-4 h-4" />
                                            Pendiente
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1 text-xs text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-400" />
                                            {business.rating.toFixed(1)} ({business.reviewCount} reseñas)
                                        </div>
                                        <div>{business.serviceCount} servicios</div>
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
                                                {loading === business.id ? 'Verificando...' : 'Verificar'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleReject(business.id)}
                                                disabled={loading === business.id}
                                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {loading === business.id ? 'Procesando...' : 'Desverificar'}
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
                    <p>No se encontraron negocios</p>
                </div>
            )}

            {/* Pagination */}
            {total > 50 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/50">
                    <p className="text-sm text-slate-400">
                        Mostrando {(currentPage - 1) * 50 + 1} a {Math.min(currentPage * 50, total)} de {total} negocios
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push(`/admin/negocios?filter=${currentFilter}&page=${currentPage - 1}`)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => router.push(`/admin/negocios?filter=${currentFilter}&page=${currentPage + 1}`)}
                            disabled={currentPage * 50 >= total}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
