'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Building2 } from 'lucide-react'

export default function BusinessOnboardingPage() {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [address, setAddress] = useState('')
    const [category, setCategory] = useState('barber')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No authenticated user found')

            const { error: insertError } = await supabase.from('businesses').insert({
                owner_id: user.id,
                name,
                description,
                address,
                category,
                is_verified: false // Pending verification
            })

            if (insertError) throw insertError

            router.push('/negocio/panel')
        } catch (err: any) {
            console.error('Onboarding error:', err)
            setError(err.message || 'Failed to create business')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Configura tu Negocio</h1>
                    <p className="text-zinc-400 mt-2">Cuéntanos sobre tu establecimiento para empezar.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-zinc-300 text-sm font-medium">Nombre del Negocio</label>
                        <input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej. Barbería El Duro"
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="category" className="text-zinc-300 text-sm font-medium">Categoría</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                            <option value="barber">Barbería</option>
                            <option value="salon">Salón de Belleza</option>
                            <option value="spa">Spa</option>
                            <option value="nails">Uñas</option>
                            <option value="makeup">Maquillaje</option>
                            <option value="tattoo">Tatuajes</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-zinc-300 text-sm font-medium">Descripción</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe tus servicios..."
                            className="flex min-h-[100px] w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="address" className="text-zinc-300 text-sm font-medium">Dirección</label>
                        <input
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Av. Winston Churchill #123"
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            required
                        />
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg rounded-md font-medium text-white flex items-center justify-center transition-colors" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                        Crear Negocio
                    </button>
                </form>
            </div>
        </div>
    )
}
