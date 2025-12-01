'use client'

import { useState, useEffect } from 'react'
import { updateOperatingHours, addBlockedTime, deleteBlockedTime } from '@/app/actions'
import { Loader2, Plus, Trash2, Save } from 'lucide-react'

// Simple notification helper
const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    alert(msg)
}

interface OperatingHour {
    day_of_week: number
    open_time: string
    close_time: string
    is_closed: boolean
}

interface BlockedTime {
    id: string
    start_time: string
    end_time: string
    reason: string
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function AvailabilityManager({
    businessId,
    initialHours,
    initialBlocked
}: {
    businessId: string
    initialHours: OperatingHour[]
    initialBlocked: BlockedTime[]
}) {
    const [hours, setHours] = useState<OperatingHour[]>(initialHours)
    const [blocked, setBlocked] = useState<BlockedTime[]>(initialBlocked)
    const [saving, setSaving] = useState(false)
    const [newBlocked, setNewBlocked] = useState({ start: '', end: '', reason: '' })

    // Initialize missing days
    useEffect(() => {
        const fullWeek = Array.from({ length: 7 }).map((_, i) => {
            const existing = initialHours.find(h => h.day_of_week === i)
            return existing || {
                day_of_week: i,
                open_time: '09:00:00',
                close_time: '18:00:00',
                is_closed: i === 0 // Default closed on Sunday
            }
        })
        // Sort by day of week
        fullWeek.sort((a, b) => a.day_of_week - b.day_of_week)

        setHours(fullWeek)
    }, [initialHours])

    const handleHourChange = (day: number, field: keyof OperatingHour, value: any) => {
        setHours(prev => prev.map(h => h.day_of_week === day ? { ...h, [field]: value } : h))
    }

    const saveHours = async () => {
        setSaving(true)
        try {
            await Promise.all(hours.map(h =>
                updateOperatingHours(businessId, h.day_of_week, h.open_time, h.close_time, h.is_closed)
            ))
            notify('Horario actualizado correctamente')
        } catch (error) {
            console.error(error)
            notify('Error al actualizar horario', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleAddBlocked = async () => {
        if (!newBlocked.start || !newBlocked.end) return
        setSaving(true)
        try {
            const newBlock = await addBlockedTime(businessId, new Date(newBlocked.start), new Date(newBlocked.end), newBlocked.reason)
            notify('Tiempo bloqueado añadido.')
            setBlocked(prev => [...prev, newBlock])
            setNewBlocked({ start: '', end: '', reason: '' })
        } catch (error) {
            console.error(error)
            notify('Error al añadir tiempo bloqueado', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteBlocked = async (id: string) => {
        if (!confirm('¿Estás seguro?')) return
        setSaving(true)
        try {
            await deleteBlockedTime(id)
            setBlocked(prev => prev.filter(b => b.id !== id))
            notify('Tiempo bloqueado eliminado')
        } catch (error) {
            console.error(error)
            notify('Error al eliminar', 'error')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Horario de Atención</h2>
                    <button
                        onClick={saveHours}
                        disabled={saving}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>Guardar Cambios</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {hours.map((h) => (
                        <div key={h.day_of_week} className="flex items-center space-x-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800/50">
                            <div className="w-24 font-medium">{DAYS[h.day_of_week]}</div>

                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!h.is_closed}
                                    onChange={(e) => handleHourChange(h.day_of_week, 'is_closed', !e.target.checked)}
                                    className="rounded border-zinc-700 bg-zinc-800"
                                />
                                <span className="text-sm text-zinc-400">Abierto</span>
                            </label>

                            {!h.is_closed && (
                                <div className="flex items-center space-x-2 ml-auto">
                                    <input
                                        type="time"
                                        value={h.open_time.slice(0, 5)}
                                        onChange={(e) => handleHourChange(h.day_of_week, 'open_time', e.target.value)}
                                        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm"
                                    />
                                    <span className="text-zinc-500">-</span>
                                    <input
                                        type="time"
                                        value={h.close_time.slice(0, 5)}
                                        onChange={(e) => handleHourChange(h.day_of_week, 'close_time', e.target.value)}
                                        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm"
                                    />
                                </div>
                            )}
                            {h.is_closed && (
                                <div className="ml-auto text-zinc-500 text-sm italic">Cerrado</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">Bloquear Horario (Vacaciones/Feriados)</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <input
                        type="datetime-local"
                        value={newBlocked.start}
                        onChange={(e) => setNewBlocked({ ...newBlocked, start: e.target.value })}
                        className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
                    />
                    <input
                        type="datetime-local"
                        value={newBlocked.end}
                        onChange={(e) => setNewBlocked({ ...newBlocked, end: e.target.value })}
                        className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Razón (opcional)"
                        value={newBlocked.reason}
                        onChange={(e) => setNewBlocked({ ...newBlocked, reason: e.target.value })}
                        className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
                    />
                    <button
                        onClick={handleAddBlocked}
                        disabled={saving}
                        className="flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus size={18} />
                        <span>Añadir</span>
                    </button>
                </div>

                <div className="space-y-2">
                    {blocked.map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded border border-zinc-800/50">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                    {new Date(b.start_time).toLocaleString()} - {new Date(b.end_time).toLocaleString()}
                                </span>
                                {b.reason && <span className="text-xs text-zinc-500">{b.reason}</span>}
                            </div>
                            <button
                                onClick={() => handleDeleteBlocked(b.id)}
                                className="text-red-400 hover:text-red-300 p-2"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {blocked.length === 0 && (
                        <div className="text-center py-8 text-zinc-500">No hay horarios bloqueados</div>
                    )}
                </div>
            </div>
        </div>
    )
}
