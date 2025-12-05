import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    title: string
    value: string | number
    trend?: string
    trendUp?: boolean
    subtitle?: string
    icon: LucideIcon
    iconColor: string
    iconBg: string
}

export default function StatCard({
    title,
    value,
    trend,
    trendUp,
    subtitle,
    icon: Icon,
    iconColor,
    iconBg
}: StatCardProps) {
    return (
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50 p-6 hover:border-slate-700/50 transition-all duration-200 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${iconBg} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trendUp
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}>
                        {trendUp && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        )}
                        <span>{trend}</span>
                    </div>
                )}
            </div>

            <div>
                <p className="text-sm text-slate-400 mb-1">{title}</p>
                <p className="text-3xl font-bold text-white mb-2">{value}</p>
                {subtitle && (
                    <p className="text-xs text-slate-500">{subtitle}</p>
                )}
            </div>
        </div>
    )
}
