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

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-800 p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Nueva Oferta de Intercambio</h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault()
                            const formData = new FormData(e.currentTarget)
                            const { createBarterOffer } = await import('@/app/actions')

                            // Get business ID (in a real app, this would be cleaner)
                            const { data: { user } } = await supabase.auth.getUser()
                            const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user?.id).single()

                            if (business) {
                                await createBarterOffer(business.id, {
                                    serviceName: formData.get('serviceName'),
                                    description: formData.get('description'),
                                    value: Number(formData.get('value')),
                                    minFollowers: Number(formData.get('minFollowers')),
                                    platform: formData.get('platform'),
                                    audienceType: formData.get('audienceType'),
                                    categoryTags: [formData.get('category')], // Simple single select for now
                                    maxApplications: Number(formData.get('maxApplications')),
                                    expiresAt: null // Optional
                                })
                                setShowCreateModal(false)
                                // Refresh list
                                const { getBusinessBarterOffers } = await import('@/app/actions')
                                const data = await getBusinessBarterOffers(business.id)
                                setOffers(data)
                            }
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Servicio a Ofrecer</label>
                                    <input name="serviceName" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white" placeholder="Ej. Corte VIP" required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-zinc-400 mb-1">Valor (RD$)</label>
                                        <input name="value" type="number" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white" placeholder="1500" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-400 mb-1">Categoría</label>
                                        <select name="category" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white">
                                            <option value="Beauty">Belleza</option>
                                            <option value="Food">Comida</option>
                                            <option value="Fitness">Fitness</option>
                                            <option value="Lifestyle">Lifestyle</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Descripción de la Campaña</label>
                                    <textarea
                                        name="description"
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white h-24"
                                        placeholder="¿Qué tipo de contenido buscas?"
                                        required
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Tipo de Audiencia</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <label className="border border-zinc-800 rounded-lg p-3 flex items-center space-x-2 cursor-pointer hover:bg-zinc-800">
                                            <input type="radio" name="audienceType" value="influencer_only" defaultChecked />
                                            <span className="text-sm">Solo Influencers</span>
                                        </label>
                                        <label className="border border-zinc-800 rounded-lg p-3 flex items-center space-x-2 cursor-pointer hover:bg-zinc-800">
                                            <input type="radio" name="audienceType" value="universal" />
                                            <span className="text-sm">Universal (Todos)</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-zinc-400 mb-1">Min. Seguidores</label>
                                        <input name="minFollowers" type="number" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white" placeholder="5000" defaultValue={1000} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-400 mb-1">Plataforma</label>
                                        <select name="platform" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white">
                                            <option value="Instagram">Instagram</option>
                                            <option value="TikTok">TikTok</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Cupo Máximo</label>
                                    <input name="maxApplications" type="number" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white" placeholder="50" defaultValue={10} />
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
                                >
                                    Publicar Oferta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
