'use client'

import { useState } from 'react'
import { User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Store, DollarSign, Users, Box, Plus, Trash2, Save } from 'lucide-react'
import { Business, StaffMember, BusinessResource } from '@/types'
import { updateBusinessRevenueGoal, addBusinessStaff, deleteBusinessStaff, addBusinessResource, deleteBusinessResource } from '@/app/actions'

interface SettingsClientProps {
    business: Business
    initialStaff: StaffMember[]
    initialResources: BusinessResource[]
}

export default function SettingsClient({ business, initialStaff, initialResources }: SettingsClientProps) {
    const [revenueGoal, setRevenueGoal] = useState(business.monthlyRevenueGoal || 100000)
    const [staff, setStaff] = useState(initialStaff)
    const [resources, setResources] = useState(initialResources)

    const [newStaffName, setNewStaffName] = useState('')
    const [newResourceName, setNewResourceName] = useState('')
    const [newResourceType, setNewResourceType] = useState('room')

    const [loadingGoal, setLoadingGoal] = useState(false)

    const handleUpdateGoal = async () => {
        setLoadingGoal(true)
        try {
            await updateBusinessRevenueGoal(business.id, revenueGoal)
            alert('Meta de ingresos actualizada')
        } catch (error) {
            console.error(error)
            alert('Error al actualizar meta')
        } finally {
            setLoadingGoal(false)
        }
    }

    const handleAddStaff = async () => {
        if (!newStaffName) return
        try {
            await addBusinessStaff(business.id, newStaffName, [])
            // Refresh page to get ID or optimistic update if we had ID. 
            // For simplicity, reload.
            window.location.reload()
        } catch (error) {
            console.error(error)
            alert('Error al agregar personal')
        }
    }

    const handleDeleteStaff = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este miembro?')) return
        try {
            await deleteBusinessStaff(id)
            setStaff(prev => prev.filter(s => s.id !== id))
        } catch (error) {
            console.error(error)
            alert('Error al eliminar personal')
        }
    }

    const handleAddResource = async () => {
        if (!newResourceName) return
        try {
            await addBusinessResource(business.id, newResourceName, newResourceType)
            window.location.reload()
        } catch (error) {
            console.error(error)
            alert('Error al agregar recurso')
        }
    }

    const handleDeleteResource = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este recurso?')) return
        try {
            await deleteBusinessResource(id)
            setResources(prev => prev.filter(r => r.id !== id))
        } catch (error) {
            console.error(error)
            alert('Error al eliminar recurso')
        }
    }

    return (
        <div className="space-y-8 pb-10">
            <h1 className="text-2xl font-bold">Ajustes del Negocio</h1>

            {/* Revenue Goal */}
            <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                        <DollarSign size={24} />
                    </div>
                    <h2 className="text-xl font-bold">Meta de Ingresos Mensual</h2>
                </div>
                <div className="flex items-end space-x-4">
                    <div className="flex-1">
                        <label htmlFor="revenue-goal" className="block text-sm text-zinc-400 mb-2">Meta (RD$)</label>
                        <input
                            id="revenue-goal"
                            type="number"
                            value={revenueGoal}
                            onChange={(e) => setRevenueGoal(Number(e.target.value))}
                            className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white text-lg font-bold"
                        />
                    </div>
                    <button
                        onClick={handleUpdateGoal}
                        disabled={loadingGoal}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center"
                    >
                        <Save size={18} className="mr-2" />
                        {loadingGoal ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </section>

            {/* Staff Management */}
            <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Users size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Personal</h2>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    {staff.map(member => (
                        <div key={member.id} className="flex items-center justify-between bg-black/50 p-4 rounded-xl border border-zinc-800">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-zinc-400">
                                    {member.name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="font-medium">{member.name}</span>
                            </div>
                            <button onClick={() => handleDeleteStaff(member.id)} className="text-zinc-500 hover:text-red-500 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {staff.length === 0 && <p className="text-zinc-500 text-sm">No hay personal registrado.</p>}
                </div>

                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Nombre del nuevo miembro"
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        className="flex-1 bg-black border border-zinc-700 rounded-xl p-3 text-white"
                    />
                    <button onClick={handleAddStaff} aria-label="Agregar Personal" className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl font-bold">
                        <Plus size={20} />
                    </button>
                </div>
            </section>

            {/* Resource Management */}
            <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                            <Box size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Recursos</h2>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    {resources.map(resource => (
                        <div key={resource.id} className="flex items-center justify-between bg-black/50 p-4 rounded-xl border border-zinc-800">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                                    <Box size={16} />
                                </div>
                                <div>
                                    <span className="font-medium block">{resource.name}</span>
                                    <span className="text-xs text-zinc-500 uppercase">{resource.type}</span>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteResource(resource.id)} className="text-zinc-500 hover:text-red-500 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {resources.length === 0 && <p className="text-zinc-500 text-sm">No hay recursos registrados.</p>}
                </div>

                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Nombre del recurso (ej. Silla 1)"
                        value={newResourceName}
                        onChange={(e) => setNewResourceName(e.target.value)}
                        className="flex-1 bg-black border border-zinc-700 rounded-xl p-3 text-white"
                    />
                    <select
                        value={newResourceType}
                        onChange={(e) => setNewResourceType(e.target.value)}
                        className="bg-black border border-zinc-700 rounded-xl p-3 text-white"
                    >
                        <option value="room">Habitación</option>
                        <option value="chair">Silla</option>
                        <option value="equipment">Equipo</option>
                        <option value="other">Otro</option>
                    </select>
                    <button onClick={handleAddResource} className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-xl font-bold">
                        <Plus size={20} />
                    </button>
                </div>
            </section>
        </div>
    )
}
