'use client'

import { useState } from 'react'
import { Plus, Instagram, Eye, Trash2 } from 'lucide-react'



import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BarterManagementPage() {
    const [offers, setOffers] = useState<any[]>([])
    const [showCreateModal, setShowCreateModal] = useState(false)
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

            const { data: business } = await supabase
                .from('businesses')
                .select('id')
                .eq('owner_id', user.id)
                .single()

            if (business) {
                const { getBusinessBarterOffers } = await import('@/app/actions')
                const data = await getBusinessBarterOffers(business.id)
                setOffers(data)
            }
            setLoading(false)
        }
        fetchData()
    }, [router, supabase])

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Ofertas de Intercambio</h1>
                    <p className="text-zinc-400 text-sm">Gestiona tus colaboraciones con influencers.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center font-medium transition-colors"
                >
                    <Plus size={18} className="mr-2" />
                    Crear Oferta
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                    <p className="text-zinc-500 text-xs uppercase mb-1">Ofertas Activas</p>
                    <p className="text-2xl font-bold text-white">1</p>
                </div>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                    <p className="text-zinc-500 text-xs uppercase mb-1">Solicitudes</p>
                    <p className="text-2xl font-bold text-blue-500">3</p>
                </div>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                    <p className="text-zinc-500 text-xs uppercase mb-1">Reviews Generados</p>
                    <p className="text-2xl font-bold text-green-400">12</p>
                </div>
            </div>

            {/* Offers List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-zinc-500">Cargando ofertas...</div>
                ) : offers.length > 0 ? (
                    offers.map(offer => (
                        <div key={offer.id} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex justify-between items-center">
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="font-bold text-lg">{offer.serviceName}</h3>
                                    <span className="bg-green-500/10 text-green-500 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-green-500/20">
                                        {offer.status}
                                    </span>
                                </div>
                                <p className="text-zinc-400 text-sm mb-3 max-w-lg">{offer.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-zinc-500">
                                    <span className="flex items-center">
                                        <Instagram size={12} className="mr-1" /> {offer.minFollowers}+ Seguidores
                                    </span>
                                    <span>Valor: RD$ {offer.value}</span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <button className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors">
                                    <Eye size={16} />
                                    <span>Ver Solicitudes ({offer.applicants})</span>
                                </button>
                                <button className="text-zinc-500 hover:text-red-500 p-2 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-zinc-500">No tienes ofertas activas.</div>
                )}
            </div>

            {/* Create Modal (Mock) */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-800 p-6">
                        <h2 className="text-xl font-bold mb-4">Nueva Oferta de Intercambio</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Servicio a Ofrecer</label>
                                <select className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white">
                                    <option>Corte VIP + Barba</option>
                                    <option>Limpieza Facial</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Descripción de la Campaña</label>
                                <textarea
                                    className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white h-24"
                                    placeholder="¿Qué tipo de contenido buscas?"
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Min. Seguidores</label>
                                    <input type="number" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white" placeholder="5000" />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Plataforma</label>
                                    <select className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white">
                                        <option>Instagram</option>
                                        <option>TikTok</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
                            >
                                Publicar Oferta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
