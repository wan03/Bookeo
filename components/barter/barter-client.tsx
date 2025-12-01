'use client'

import { useState } from 'react'
import { Search, Filter, Star, MapPin, Instagram, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BarterOffer } from '@/types'

interface BarterClientProps {
    initialOffers: BarterOffer[]
}

export default function BarterClient({ initialOffers }: BarterClientProps) {
    const [filter, setFilter] = useState('all')
    const [selectedOffer, setSelectedOffer] = useState<string | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)

    const handleApply = (offerId: string) => {
        setSelectedOffer(offerId)
        // Simulate API call
        setTimeout(() => {
            setSelectedOffer(null)
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
        }, 1000)
    }

    const filteredOffers = initialOffers.filter(offer => {
        if (filter === 'all') return true
        // Simple mock filtering logic
        if (filter === 'Belleza') return offer.tags.includes('Beauty') || offer.tags.includes('Nails') || offer.tags.includes('Hair')
        if (filter === 'Comida') return offer.tags.includes('Foodie')
        if (filter === 'Fitness') return offer.tags.includes('Fitness')
        if (filter === 'Lifestyle') return offer.tags.includes('Lifestyle')
        return true
    })

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-24 relative">
            {/* Success Notification */}
            {showSuccess && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-black px-6 py-3 rounded-full font-bold shadow-lg animate-in fade-in slide-in-from-top-4">
                    ✅ Solicitud enviada con éxito!
                </div>
            )}

            {/* Header */}
            <div className="bg-zinc-900 border-b border-zinc-800 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                        Club de Canjes
                    </h1>
                    <p className="text-zinc-400">
                        Conecta con negocios locales, recibe servicios gratis, y crea contenido brutal. 🇩🇴
                    </p>
                    <div className="mt-4">
                        <Link href="/intercambios/solicitudes" className="text-sm text-blue-500 hover:text-pink-400 font-medium flex items-center">
                            Ver mis solicitudes →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="max-w-4xl mx-auto p-4 sticky top-0 bg-zinc-950/80 backdrop-blur-md z-10">
                <div className="flex space-x-2 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-zinc-500" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar ofertas (ej. Uñas, Corte, Spa)..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <button className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-600">
                        <Filter size={20} />
                    </button>
                </div>

                <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
                    {['Todos', 'Belleza', 'Comida', 'Fitness', 'Lifestyle'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat === 'Todos' ? 'all' : cat)}
                            className={cn(
                                "px-4 py-1.5 rounded-full border text-sm whitespace-nowrap transition-colors",
                                (filter === 'all' && cat === 'Todos') || filter === cat
                                    ? "bg-white text-black border-white"
                                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-blue-500 hover:text-blue-500"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Offers Grid */}
            <div className="max-w-4xl mx-auto p-4 grid gap-6 md:grid-cols-2">
                {filteredOffers.map((offer) => (
                    <div key={offer.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden hover:border-blue-500/50 transition-all group">
                        <div className="relative h-48">
                            <img src={offer.imageUrl} alt={offer.serviceName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white flex items-center border border-white/10">
                                <Instagram size={12} className="mr-1" />
                                {offer.minFollowers / 1000}k+ Seguidores
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                                <h3 className="text-xl font-bold text-white">{offer.serviceName}</h3>
                                <p className="text-zinc-300 text-sm flex items-center">
                                    <MapPin size={12} className="mr-1" /> {offer.businessName} • {offer.location}
                                </p>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-zinc-400 text-sm line-clamp-2">{offer.description}</p>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {offer.tags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md uppercase tracking-wider">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                                <div className="text-center">
                                    <p className="text-[10px] text-zinc-500 uppercase">Valor</p>
                                    <p className="font-bold text-green-400">RD$ {offer.value}</p>
                                </div>
                                <button
                                    onClick={() => handleApply(offer.id)}
                                    disabled={selectedOffer === offer.id}
                                    className="bg-white text-black font-bold py-2 px-6 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {selectedOffer === offer.id ? "Enviando..." : "Aplicar"}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
