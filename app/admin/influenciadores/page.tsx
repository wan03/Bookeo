import { getInfluencerLeaderboard, getContentSubmissions } from '@/app/actions/admin'
import InfluencerLeaderboard from '@/components/admin/influencer-leaderboard'
import ContentModeration from '@/components/admin/content-moderation'
import { Crown } from 'lucide-react'

export default async function AdminInfluencersPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>
}) {
    const params = await searchParams
    const leaderboard = await getInfluencerLeaderboard()
    const submissions = await getContentSubmissions('submitted') // Default to submitted for moderation queue

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Centro de Influenciadores</h2>
                    <p className="text-slate-400">Gestionar colaboraciones y contenido</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-semibold">{leaderboard.length}</span>
                    <span className="text-slate-400 text-sm">Influenciadores Activos</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Leaderboard */}
                <div className="lg:col-span-1">
                    <InfluencerLeaderboard influencers={leaderboard} />
                </div>

                {/* Right Column: Content Moderation */}
                <div className="lg:col-span-2">
                    <ContentModeration submissions={submissions} />
                </div>
            </div>
        </div>
    )
}
