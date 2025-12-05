import { RecentActivity } from '@/app/actions/admin'
import { UserPlus, Building2, Calendar, Star, Sparkles } from 'lucide-react'

interface RecentActivityFeedProps {
    activities: RecentActivity[]
}

const activityIcons: Record<string, any> = {
    user_signup: UserPlus,
    business_created: Building2,
    booking_created: Calendar,
    review_posted: Star,
    barter_application: Sparkles
}

const activityColors: Record<string, string> = {
    user_signup: 'text-blue-400 bg-blue-500/10',
    business_created: 'text-purple-400 bg-purple-500/10',
    booking_created: 'text-green-400 bg-green-500/10',
    review_posted: 'text-yellow-400 bg-yellow-500/10',
    barter_application: 'text-pink-400 bg-pink-500/10'
}

export default function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
    const activityTypeLabels: Record<string, string> = {
        user_signup: 'Registro de Usuario',
        business_created: 'Negocio Creado',
        booking_created: 'Reserva Creada',
        review_posted: 'Reseña Publicada',
        barter_application: 'Solicitud de Canje'
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <p>Sin actividad reciente</p>
            </div>
        )
    }

    return (
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {activities.map((activity, index) => {
                const Icon = activityIcons[activity.activityType] || Calendar
                const colorClass = activityColors[activity.activityType] || 'text-slate-400 bg-slate-500/10'
                const timeAgo = getTimeAgo(activity.timestamp)

                return (
                    <div
                        key={`${activity.entityId}-${index}`}
                        className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors duration-200"
                    >
                        <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                            <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {activity.entityName}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                {activityTypeLabels[activity.activityType] || activity.activityType}
                            </p>
                            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {Object.entries(activity.metadata).slice(0, 2).map(([key, value]) => (
                                        <span
                                            key={key}
                                            className="text-xs px-2 py-1 rounded bg-slate-700/50 text-slate-300"
                                        >
                                            {key}: {String(value)}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="text-xs text-slate-500 flex-shrink-0">
                            {timeAgo}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function getTimeAgo(timestamp: string): string {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora mismo'
    if (diffMins < 60) return `hace ${diffMins}m`
    if (diffHours < 24) return `hace ${diffHours}h`
    if (diffDays < 7) return `hace ${diffDays}d`
    return then.toLocaleDateString()
}
