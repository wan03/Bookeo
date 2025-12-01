'use client'

import { useState } from 'react'
import { Clock, CheckCircle, XCircle, Video, Upload } from 'lucide-react'
import Link from 'next/link'



import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MyApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([])
    const [uploadingId, setUploadingId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth')
                return
            }

            const { getInfluencerApplications } = await import('@/app/actions')
            const data = await getInfluencerApplications()
            setApplications(data)
            setLoading(false)
        }
        fetchData()
    }, [router, supabase])

    const handleUpload = (id: string) => {
        setUploadingId(id)
        // Mock upload simulation
        setTimeout(() => {
            setApplications(apps => apps.map(app =>
                app.id === id ? { ...app, status: 'completed', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' } : app
            ))
            setUploadingId(null)
        }, 2000)
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-24">
            <div className="bg-zinc-900 border-b border-zinc-800 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-1">Mis Solicitudes</h1>
                    <p className="text-zinc-400 text-sm">Rastrea tus colaboraciones y sube tus reviews.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-zinc-500">Cargando solicitudes...</div>
                ) : applications.length > 0 ? (
                    applications.map(app => (
                        <div key={app.id} className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="font-bold text-lg">{app.serviceName}</h3>
                                    {app.status === 'pending' && <span className="bg-yellow-500/10 text-yellow-500 text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/20 flex items-center"><Clock size={10} className="mr-1" /> Pendiente</span>}
                                    {app.status === 'approved' && <span className="bg-green-500/10 text-green-500 text-[10px] px-2 py-0.5 rounded-full border border-green-500/20 flex items-center"><CheckCircle size={10} className="mr-1" /> Aprobada</span>}
                                    {app.status === 'rejected' && <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-0.5 rounded-full border border-red-500/20 flex items-center"><XCircle size={10} className="mr-1" /> Rechazada</span>}
                                    {app.status === 'completed' && <span className="bg-blue-500/10 text-blue-500 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center"><Video size={10} className="mr-1" /> Completada</span>}
                                </div>
                                <p className="text-zinc-400 text-sm">{app.businessName} • {app.submittedAt}</p>
                            </div>

                            {app.status === 'approved' && (
                                <button
                                    onClick={() => handleUpload(app.id)}
                                    disabled={uploadingId === app.id}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors disabled:opacity-50"
                                >
                                    {uploadingId === app.id ? (
                                        "Subiendo..."
                                    ) : (
                                        <>
                                            <Upload size={16} className="mr-2" />
                                            Subir Video Review
                                        </>
                                    )}
                                </button>
                            )}

                            {app.status === 'completed' && (
                                <div className="text-zinc-500 text-xs flex items-center">
                                    <CheckCircle size={14} className="mr-1 text-green-500" />
                                    Video Enviado
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-zinc-500">No tienes solicitudes activas.</div>
                )}
            </div>
        </div>
    )
}
