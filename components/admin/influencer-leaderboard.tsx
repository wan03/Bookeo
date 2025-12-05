'use client'

import { Trophy, Star, TrendingUp } from 'lucide-react'

interface Influencer {
    id: string
    reputation_score: number
    total_barters_completed: number
    profiles: { full_name: string; email: string } | null
}

export default function InfluencerLeaderboard({ influencers }: { influencers: Influencer[] }) {
    return (
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top Influencers
            </h3>

            <div className="space-y-4">
                {influencers.map((influencer, index) => (
                    <div key={influencer.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                    index === 1 ? 'bg-slate-400/20 text-slate-300' :
                                        index === 2 ? 'bg-amber-700/20 text-amber-600' :
                                            'bg-slate-800 text-slate-500'
                                }`}>
                                {index + 1}
                            </div>
                            <div>
                                <p className="font-medium text-white">{influencer.profiles?.full_name || 'Unknown'}</p>
                                <p className="text-xs text-slate-400">{influencer.profiles?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Reputation</p>
                                <div className="flex items-center justify-end gap-1 text-yellow-400 font-medium">
                                    <Star className="w-3 h-3 fill-current" />
                                    {influencer.reputation_score}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Barters</p>
                                <div className="flex items-center justify-end gap-1 text-blue-400 font-medium">
                                    <TrendingUp className="w-3 h-3" />
                                    {influencer.total_barters_completed}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {influencers.length === 0 && (
                    <p className="text-center text-slate-500 py-4">No active influencers yet</p>
                )}
            </div>
        </div>
    )
}
