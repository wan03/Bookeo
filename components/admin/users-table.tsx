'use client'

import { updateUserRole } from '@/app/actions/admin'
import { useState } from 'react'
import { User, Shield, Phone, Calendar, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UserData {
    id: string
    email: string
    fullName: string
    phoneNumber: string
    role: string
    createdAt: string
}

interface UsersTableProps {
    users: UserData[]
    total: number
    currentPage: number
    currentRole: string
    searchQuery: string
}

const roleColors: Record<string, string> = {
    admin: 'text-purple-400 bg-purple-500/10',
    business_owner: 'text-blue-400 bg-blue-500/10',
    staff: 'text-green-400 bg-green-500/10',
    consumer: 'text-slate-400 bg-slate-500/10',
    influencer: 'text-pink-400 bg-pink-500/10'
}

export default function UsersTable({
    users,
    total,
    currentPage,
    currentRole,
    searchQuery
}: UsersTableProps) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState(searchQuery)

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!confirm(`¿Estás seguro de que deseas cambiar el rol de este usuario a ${newRole}?`)) return

        setLoading(userId)
        const success = await updateUserRole(userId, newRole)
        if (success) {
            router.refresh()
        } else {
            alert('Error al actualizar el rol del usuario')
        }
        setLoading(null)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        router.push(`/admin/usuarios?search=${searchTerm}&role=${currentRole}&page=1`)
    }

    const handleFilterChange = (role: string) => {
        router.push(`/admin/usuarios?search=${searchQuery}&role=${role}&page=1`)
    }

    const roleLabels: Record<string, string> = {
        all: 'Todos',
        consumer: 'Consumidor',
        business_owner: 'Dueño de Negocio',
        staff: 'Personal',
        influencer: 'Influenciador',
        admin: 'Admin'
    }

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50">
            {/* Controls */}
            <div className="p-4 border-b border-slate-800/50 flex flex-col sm:flex-row gap-4 justify-between">
                {/* Role Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {['all', 'consumer', 'business_owner', 'staff', 'influencer', 'admin'].map((role) => (
                        <button
                            key={role}
                            onClick={() => handleFilterChange(role)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${currentRole === role
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            {roleLabels[role] || role}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar usuarios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-64"
                    />
                </form>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-800/50">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Rol
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Contacto
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Unido
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {users.map((user) => {
                            const roleColor = roleColors[user.role] || 'text-slate-400 bg-slate-500/10'
                            const date = new Date(user.createdAt)

                            return (
                                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-slate-800 text-slate-400">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{user.fullName || 'Sin Nombre'}</p>
                                                <p className="text-xs text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleColor}`}>
                                            <Shield className="w-3 h-3" />
                                            {roleLabels[user.role] || user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-300">
                                            <Phone className="w-4 h-4 text-slate-500" />
                                            {user.phoneNumber || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-300">
                                            <Calendar className="w-4 h-4 text-slate-500" />
                                            {date.toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            disabled={loading === user.id || user.role === 'admin'}
                                            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                        >
                                            <option value="consumer">Consumidor</option>
                                            <option value="business_owner">Dueño de Negocio</option>
                                            <option value="staff">Personal</option>
                                            <option value="influencer">Influenciador</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {users.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No se encontraron usuarios</p>
                </div>
            )}

            {/* Pagination */}
            {total > 50 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/50">
                    <p className="text-sm text-slate-400">
                        Mostrando {(currentPage - 1) * 50 + 1} a {Math.min(currentPage * 50, total)} de {total} usuarios
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push(`/admin/usuarios?search=${searchQuery}&role=${currentRole}&page=${currentPage - 1}`)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => router.push(`/admin/usuarios?search=${searchQuery}&role=${currentRole}&page=${currentPage + 1}`)}
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
