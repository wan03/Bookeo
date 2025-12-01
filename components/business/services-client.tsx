'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Clock, DollarSign, Save, X, Check } from 'lucide-react'
import { Business, Service, BusinessResource } from '@/types'
import { addService, updateService, deleteService } from '@/app/actions'
import { cn } from '@/lib/utils'

interface ServicesClientProps {
    business: Business
    initialResources: BusinessResource[]
}

export default function ServicesClient({ business, initialResources }: ServicesClientProps) {
    const [services, setServices] = useState<Service[]>(business.services)
    const [isEditing, setIsEditing] = useState(false)
    const [editingService, setEditingService] = useState<Partial<Service> | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        if (!editingService?.name || !editingService.price || !editingService.duration) return
        setLoading(true)
        try {
            if (editingService.id) {
                await updateService(editingService.id, editingService)
                setServices(prev => prev.map(s => s.id === editingService.id ? { ...s, ...editingService } as Service : s))
            } else {
                const newService = await addService(business.id, editingService)
                setServices(prev => [...prev, newService])
            }
            setIsEditing(false)
            setEditingService(null)
        } catch (error) {
            console.error('Error saving service:', JSON.stringify(error, null, 2))
            alert('Error saving service')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return
        try {
            await deleteService(id)
            setServices(prev => prev.filter(s => s.id !== id))
        } catch (error) {
            console.error(error)
            alert('Error deleting service')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Menú de Servicios</h1>
                <button
                    onClick={() => {
                        setEditingService({ name: '', description: '', price: 0, duration: 30 })
                        setIsEditing(true)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-bold transition-colors"
                >
                    <Plus size={16} />
                    <span>Agregar Servicio</span>
                </button>
            </div>

            {isEditing && (
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-lg">{editingService?.id ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="service-name" className="block text-xs text-zinc-400 mb-1">Nombre</label>
                            <input
                                id="service-name"
                                type="text"
                                value={editingService?.name}
                                onChange={e => setEditingService(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="service-price" className="block text-xs text-zinc-400 mb-1">Precio (RD$)</label>
                            <input
                                id="service-price"
                                type="number"
                                value={editingService?.price}
                                onChange={e => setEditingService(prev => ({ ...prev, price: Number(e.target.value) }))}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="service-duration" className="block text-xs text-zinc-400 mb-1">Duración (min)</label>
                            <select
                                id="service-duration"
                                value={editingService?.duration}
                                onChange={e => setEditingService(prev => ({ ...prev, duration: Number(e.target.value) }))}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white"
                            >
                                {[15, 30, 45, 60, 90, 120].map(m => (
                                    <option key={m} value={m}>{m} min</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="service-description" className="block text-xs text-zinc-400 mb-1">Descripción</label>
                            <input
                                id="service-description"
                                type="text"
                                value={editingService?.description}
                                onChange={e => setEditingService(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white"
                            />
                        </div>
                    </div>

                    {/* Resource Linking */}
                    <div>
                        <label className="block text-xs text-zinc-400 mb-2">Recursos Requeridos (Opcional)</label>
                        <div className="flex flex-wrap gap-2">
                            {initialResources.map(r => {
                                const isSelected = editingService?.resourceIds?.includes(r.id)
                                return (
                                    <button
                                        key={r.id}
                                        onClick={() => {
                                            const currentIds = editingService?.resourceIds || []
                                            const newIds = isSelected
                                                ? currentIds.filter(id => id !== r.id)
                                                : [...currentIds, r.id]
                                            setEditingService(prev => ({ ...prev, resourceIds: newIds }))
                                        }}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs border transition-colors flex items-center space-x-1",
                                            isSelected
                                                ? "bg-blue-600/20 border-blue-600 text-blue-500"
                                                : "border-zinc-700 hover:border-zinc-500 text-zinc-400"
                                        )}
                                    >
                                        {isSelected && <Check size={12} />}
                                        <span>{r.name} ({r.type})</span>
                                    </button>
                                )
                            })}
                            {initialResources.length === 0 && <span className="text-xs text-zinc-600">No hay recursos creados. Ve a Ajustes.</span>}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            onClick={() => {
                                setIsEditing(false)
                                setEditingService(null)
                            }}
                            className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold flex items-center"
                        >
                            {loading ? 'Guardando...' : <><Save size={16} className="mr-2" /> Guardar</>}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {services.map(service => (
                    <div key={service.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                                <h3 className="font-bold text-lg">{service.name}</h3>
                                <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md flex items-center">
                                    <Clock size={12} className="mr-1" />
                                    {service.duration} min
                                </span>
                            </div>
                            <p className="text-zinc-400 text-sm">{service.description}</p>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="text-right">
                                <p className="text-green-400 font-bold text-lg">RD$ {service.price}</p>
                            </div>

                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        setEditingService(service)
                                        setIsEditing(true)
                                    }}
                                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    className="p-2 hover:bg-red-900/20 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
