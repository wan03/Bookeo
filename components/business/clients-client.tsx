'use client'

import { useState } from 'react'
import { Search, Phone, Mail, MoreVertical, AlertTriangle } from 'lucide-react'
import { ClientStats } from '@/types'

interface ClientsClientProps {
    initialClients: ClientStats[]
}

export default function ClientsClient({ initialClients }: ClientsClientProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredClients = initialClients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Clientes</h1>
                <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800 flex items-center space-x-2">
                    <Search size={18} className="text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-32 md:w-48 placeholder:text-zinc-600 text-white"
                    />
                </div>
            </div>

            <div className="space-y-3">
                {filteredClients.length > 0 ? (
                    filteredClients.map(client => (
                        <div key={client.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 overflow-hidden">
                                    {client.avatarUrl ? (
                                        <img src={client.avatarUrl} alt={client.name} className="w-full h-full object-cover" />
                                    ) : (
                                        client.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h3 className="font-bold text-white">{client.name}</h3>
                                        {client.noShowCount > 0 && (
                                            <span className="bg-red-500/10 text-red-500 text-[10px] px-1.5 py-0.5 rounded flex items-center border border-red-500/20">
                                                <AlertTriangle size={10} className="mr-1" />
                                                {client.noShowCount} No-Show
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-500">
                                        {client.totalVisits} visitas • Última: {client.lastVisit ? new Date(client.lastVisit).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <a href={`tel:${client.phone}`} className="p-2 bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600/20 transition-colors">
                                    <Phone size={18} />
                                </a>
                                <button className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-colors">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-zinc-500">
                        {searchTerm ? 'No se encontraron resultados.' : 'No hay clientes aún.'}
                    </div>
                )}
            </div>
        </div>
    )
}
