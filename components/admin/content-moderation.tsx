'use client'

import { approveContentSubmission, rejectContentSubmission } from '@/app/actions/admin'
import { useState } from 'react'
import { CheckCircle, XCircle, ExternalLink, PlayCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Submission {
    id: string
    content_url: string
    platform: string
    status: string
    created_at: string
    profiles: { full_name: string; email: string } | null
    businesses: { name: string } | null
}

export default function ContentModeration({ submissions }: { submissions: Submission[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    const handleApprove = async (id: string) => {
        if (!confirm('¿Aprobar este contenido?')) return
        setLoading(id)
        const success = await approveContentSubmission(id)
        if (success) router.refresh()
        setLoading(null)
    }

    const handleReject = async (id: string) => {
        const feedback = prompt('Introduce feedback de rechazo:')
        if (!feedback) return
        setLoading(id)
        const success = await rejectContentSubmission(id, feedback)
        if (success) router.refresh()
        setLoading(null)
    }

    const statusLabels: Record<string, string> = {
        submitted: 'Enviado',
        approved: 'Aprobado',
        rejected: 'Rechazado'
    }

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50">
            <div className="p-4 border-b border-slate-800/50">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-pink-400" />
                    Cola de Moderación de Contenido
                </h3>
            </div>

            <div className="divide-y divide-slate-800/50">
                {submissions.map((submission) => (
                    <div key={submission.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-slate-800/30 transition-colors">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${submission.platform === 'instagram' ? 'bg-pink-500/10 text-pink-400' :
                                    submission.platform === 'tiktok' ? 'bg-cyan-500/10 text-cyan-400' :
                                        'bg-slate-500/10 text-slate-400'
                                    }`}>
                                    {submission.platform}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${submission.status === 'submitted' ? 'bg-yellow-500/10 text-yellow-400' :
                                    submission.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                                        'bg-red-500/10 text-red-400'
                                    }`}>
                                    {statusLabels[submission.status] || submission.status}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {new Date(submission.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <p className="text-white font-medium">
                                {submission.profiles?.full_name} <span className="text-slate-500">para</span> {submission.businesses?.name}
                            </p>

                            <a
                                href={submission.content_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mt-1"
                            >
                                Ver Contenido <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        {submission.status === 'submitted' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleApprove(submission.id)}
                                    disabled={loading === submission.id}
                                    className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                                    title="Aprobar"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleReject(submission.id)}
                                    disabled={loading === submission.id}
                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                                    title="Rechazar"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {submissions.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No se encontraron envíos de contenido</p>
                    </div>
                )}
            </div>
        </div>
    )
}
