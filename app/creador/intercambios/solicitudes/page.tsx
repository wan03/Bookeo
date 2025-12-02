'use client'

import { useState } from 'react'
import { Clock, CheckCircle, XCircle, Video, Upload } from 'lucide-react'
import Link from 'next/link'



import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MyApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([])
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
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

    const handleSubmitContent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedAppId) return
        setSubmitting(true)

        try {
            const formData = new FormData(e.target as HTMLFormElement)
            const contentUrl = formData.get('contentUrl') as string
            const platform = formData.get('platform') as string

            const { submitContent } = await import('@/app/actions')
            await submitContent(selectedAppId, contentUrl, platform)

            // Refresh list
            const { getInfluencerApplications } = await import('@/app/actions')
            const data = await getInfluencerApplications()
            setApplications(data)
            setSelectedAppId(null)
        } catch (error) {
            console.error('Error submitting content:', error)
            alert('Error al enviar contenido. Intenta de nuevo.')
        } finally {
            setSubmitting(false)
        }
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
                                    onClick={() => setSelectedAppId(app.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors"
                                >
                                    <Upload size={16} className="mr-2" />
                                    Subir Contenido
                                </button>
                            )}

                            {app.status === 'completed' && (
                                <div className="text-zinc-500 text-xs flex items-center">
                                    <CheckCircle size={14} className="mr-1 text-green-500" />
                                    Contenido Enviado
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-zinc-500">No tienes solicitudes activas.</div>
                )}
            </div>

            {/* Content Submission Modal */}
            {selectedAppId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-800 p-6">
                        <h2 className="text-xl font-bold mb-4">Subir Contenido</h2>
                        <form onSubmit={handleSubmitContent}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Link del Post/Video</label>
                                    <input
                                        name="contentUrl"
                                        type="url"
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white"
                                        placeholder="https://instagram.com/p/..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Plataforma</label>
                                    <select name="platform" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white">
                                        <option value="Instagram">Instagram</option>
                                        <option value="TikTok">TikTok</option>
                                        <option value="YouTube">YouTube</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setSelectedAppId(null)}
                                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold disabled:opacity-50"
                                >
                                    {submitting ? 'Enviando...' : 'Enviar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
