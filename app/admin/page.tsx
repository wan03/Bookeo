import { getAdminStats, getRecentActivity } from '@/app/actions/admin'
import StatCard from '@/components/admin/stat-card'
import RecentActivityFeed from '@/components/admin/recent-activity-feed'
import {
    Users,
    Building2,
    Calendar,
    DollarSign,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    Sparkles
} from 'lucide-react'

export default async function AdminDashboard() {
    const stats = await getAdminStats()
    const recentActivity = await getRecentActivity(20)

    if (!stats) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-slate-400">Failed to load dashboard stats</p>
            </div>
        )
    }

    // Calculate trends (mock for now - would need historical data)
    const userGrowth = stats.newUsers30d > 0 ? '+' + ((stats.newUsers30d / stats.totalUsers) * 100).toFixed(1) + '%' : '0%'
    const revenueGrowth = stats.revenue30d > 0 ? '+' + ((stats.revenue30d / stats.totalRevenue) * 100).toFixed(1) + '%' : '0%'
    const bookingGrowth = stats.bookings30d > 0 ? '+' + ((stats.bookings30d / stats.totalBookings) * 100).toFixed(1) + '%' : '0%'

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
                <p className="text-slate-400">Platform metrics and recent activity</p>
            </div>

            {/* Top Row - Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`RD$${stats.totalRevenue.toLocaleString()}`}
                    trend={revenueGrowth}
                    trendUp={stats.revenue30d > 0}
                    icon={DollarSign}
                    iconColor="text-green-400"
                    iconBg="bg-green-500/10"
                />
                <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings.toLocaleString()}
                    trend={bookingGrowth}
                    trendUp={stats.bookings30d > 0}
                    icon={Calendar}
                    iconColor="text-blue-400"
                    iconBg="bg-blue-500/10"
                />
                <StatCard
                    title="Active Users"
                    value={stats.totalUsers.toLocaleString()}
                    trend={userGrowth}
                    trendUp={stats.newUsers30d > 0}
                    icon={Users}
                    iconColor="text-purple-400"
                    iconBg="bg-purple-500/10"
                />
                <StatCard
                    title="Pending Verifications"
                    value={stats.pendingVerifications.toLocaleString()}
                    trend={stats.pendingVerifications > 0 ? 'Needs attention' : 'All clear'}
                    trendUp={false}
                    icon={AlertCircle}
                    iconColor="text-yellow-400"
                    iconBg="bg-yellow-500/10"
                />
            </div>

            {/* Second Row - Platform Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Businesses"
                    value={stats.totalBusinesses.toLocaleString()}
                    subtitle={`${stats.verifiedBusinesses} verified`}
                    icon={Building2}
                    iconColor="text-cyan-400"
                    iconBg="bg-cyan-500/10"
                />
                <StatCard
                    title="Completed Bookings"
                    value={stats.completedBookings.toLocaleString()}
                    subtitle={`${((stats.completedBookings / stats.totalBookings) * 100).toFixed(1)}% completion rate`}
                    icon={CheckCircle}
                    iconColor="text-emerald-400"
                    iconBg="bg-emerald-500/10"
                />
                <StatCard
                    title="Barter Offers"
                    value={stats.activeBarterOffers.toLocaleString()}
                    subtitle={`${stats.pendingBarterApplications} pending applications`}
                    icon={Sparkles}
                    iconColor="text-pink-400"
                    iconBg="bg-pink-500/10"
                />
                <StatCard
                    title="Average Rating"
                    value={stats.averageRating.toFixed(2)}
                    subtitle={`${stats.totalReviews} total reviews`}
                    icon={TrendingUp}
                    iconColor="text-orange-400"
                    iconBg="bg-orange-500/10"
                />
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                        <p className="text-sm text-slate-400 mt-1">Last 7 days of platform events</p>
                    </div>
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors">
                        View All
                    </button>
                </div>
                <RecentActivityFeed activities={recentActivity} />
            </div>

            {/* Last Updated */}
            <div className="text-center text-xs text-slate-500">
                Last updated: {new Date(stats.lastUpdated).toLocaleString()}
            </div>
        </div>
    )
}
