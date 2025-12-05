import { getUsers } from '@/app/actions/admin'
import UsersTable from '@/components/admin/users-table'
import { Users } from 'lucide-react'

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; role?: string }>
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const search = params.search || ''
    const role = params.role || 'all'

    const { users, total } = await getUsers(page, 50, search, role)

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">User Management</h2>
                    <p className="text-slate-400">Manage user accounts and roles</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-semibold">{total}</span>
                    <span className="text-slate-400 text-sm">Total Users</span>
                </div>
            </div>

            {/* Users Table */}
            <UsersTable
                users={users}
                total={total}
                currentPage={page}
                currentRole={role}
                searchQuery={search}
            />
        </div>
    )
}
