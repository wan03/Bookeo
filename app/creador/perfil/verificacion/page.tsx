'use client'

import { useState } from 'react'
import { Upload, CheckCircle, AlertCircle, Instagram } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function VerificationPage() {
    const [step, setStep] = useState(1)
    const [handle, setHandle] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user found')

            // 1. Create Influencer Profile if not exists
            const { error } = await supabase
                .from('influencer_profiles')
                .upsert({
                    id: user.id,
                    instagram_handle: handle,
                    is_verified: false // Needs admin approval
                })

            if (error) throw error

            // 2. Simulate file upload (In real app, upload to storage bucket)
            // await supabase.storage.from('verification').upload(...)

            setStep(3)
        } catch (error) {
            console.error('Error submitting verification:', error)
            alert('Error al enviar solicitud. Intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-md mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                        Verificación de Influencer
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        Desbloquea ofertas exclusivas y aumenta tu credibilidad.
                    </p>
                </div>

                {step === 1 && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h2 className="font-bold text-lg mb-4">Paso 1: Tu Perfil</h2>
                        <form onSubmit={(e) => { e.preventDefault(); setStep(2) }}>
                            <div className="mb-4">
                                <label className="block text-xs text-zinc-400 mb-2">Usuario de Instagram</label>
                                <div className="relative">
                                    <Instagram className="absolute left-3 top-3 text-zinc-500" size={20} />
                                    <input
                                        type="text"
                                        value={handle}
                                        onChange={(e) => setHandle(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="@tu_usuario"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Continuar
                            </button>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h2 className="font-bold text-lg mb-4">Paso 2: Comprobante</h2>
                        <p className="text-sm text-zinc-400 mb-6">
                            Sube una captura de pantalla de tu perfil (Insights) donde se vean tus estadísticas de los últimos 30 días.
                        </p>

                        <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center mb-6 hover:border-blue-500/50 transition-colors cursor-pointer">
                            <Upload className="mx-auto text-zinc-500 mb-2" size={32} />
                            <p className="text-sm text-zinc-400">Toca para subir imagen</p>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-xl transition-colors"
                            >
                                Atrás
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Enviando...' : 'Enviar Solicitud'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-12 animate-in fade-in zoom-in">
                        <div className="bg-green-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="text-green-500" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h2>
                        <p className="text-zinc-400 mb-8 max-w-xs mx-auto">
                            Nuestro equipo revisará tu perfil en las próximas 24-48 horas. Te notificaremos por correo.
                        </p>
                        <button
                            onClick={() => router.push('/creador/intercambios')}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                        >
                            Volver a Ofertas
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
