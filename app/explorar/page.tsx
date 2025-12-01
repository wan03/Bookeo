'use client'

import { Search, MapPin, Star, Filter } from 'lucide-react'
import Link from 'next/link'
import { MOCK_CATEGORIES } from '@/lib/mock-data'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export default function ExplorarPage() {
    const [businesses, setBusinesses] = useState<any[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBusinesses = async () => {
            setLoading(true)
            const { getBusinesses } = await import('@/app/actions')
            const data = await getBusinesses(searchQuery, selectedCategory)
            setBusinesses(data)
            setLoading(false)
        }

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchBusinesses()
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [searchQuery, selectedCategory])

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-24 p-4">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Explorar</h1>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-3 text-zinc-500" size={20} />
                <input
                    type="text"
                    placeholder="¿Qué buscas hoy? (ej. Corte, Uñas)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:outline-none transition-all"
                />
                <button className="absolute right-3 top-2.5 p-1 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                    <Filter size={16} />
                </button>
            </div>

            {/* Categories */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3">Categorías</h2>
                <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
                    {MOCK_CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                            className={cn(
                                "flex-shrink-0 px-4 py-3 rounded-xl border font-medium transition-all flex flex-col items-center min-w-[80px]",
                                selectedCategory === cat.id
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "bg-zinc-900 border-zinc-800 hover:border-blue-500 text-zinc-300"
                            )}
                        >
                            <span className="text-2xl mb-1">{cat.icon}</span>
                            <span className="text-xs">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Featured Businesses */}
            <h2 className="text-xl font-bold mb-4">
                {searchQuery ? `Resultados para "${searchQuery}"` : "Recomendados para ti"}
            </h2>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-12 text-zinc-500">Cargando negocios...</div>
                ) : businesses.length > 0 ? (
                    businesses.map((business) => (
                        <Link href={`/reservar/${business.id}`} key={business.id} className="block bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-blue-500 transition-all group">
                            <div className="flex h-32">
                                <div className="w-32 h-full overflow-hidden relative">
                                    <img src={business.imageUrl} alt={business.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    {business.rating >= 4.9 && (
                                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            Top
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{business.name}</h3>
                                        <p className="text-zinc-400 text-xs flex items-center">
                                            <MapPin size={12} className="mr-1" /> {business.address}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center text-sm font-bold">
                                            <Star size={14} className="text-yellow-400 mr-1" /> {business.rating}
                                            <span className="text-zinc-500 text-xs font-normal ml-1">({business.reviewCount})</span>
                                        </span>
                                        <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-300">
                                            {business.services.length} Servicios
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-12 text-zinc-500">
                        <p>No encontramos resultados para tu búsqueda.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
