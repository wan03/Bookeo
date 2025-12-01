'use client'

import { useState } from 'react'
import { MessageSquare, Gift, Bell, Save, Plus, Play, X, Zap, Clock } from 'lucide-react'
import { Business } from '@/types'
import { toggleBusinessFlashSale } from '@/app/actions'
import { cn } from '@/lib/utils'

interface MarketingClientProps {
    business: Business
}

export default function MarketingClient({ business }: MarketingClientProps) {
    const [flashSaleActive, setFlashSaleActive] = useState(business.flashSaleActive || false)
    const [flashSaleEndsAt, setFlashSaleEndsAt] = useState(business.flashSaleEndsAt)
    const [loadingFlash, setLoadingFlash] = useState(false)

    const [config, setConfig] = useState({
        enableSmsReminders: true,
        reminderHoursBefore: 24,
        enableWhatsappReviews: true,
        loyaltyProgramEnabled: false,
        birthdayAutomation: false, // New feature
    })

    const [campaigns, setCampaigns] = useState([
        { id: 1, name: 'Cumpleaños del Mes', type: 'WhatsApp', status: 'Active', trigger: 'Birthday' },
        { id: 2, name: 'Recuperación de Clientes', type: 'SMS', status: 'Paused', trigger: 'Inactive > 30 days' },
    ])

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newCampaign, setNewCampaign] = useState({ name: '', type: 'WhatsApp', trigger: 'Manual' })
    const [showToast, setShowToast] = useState<string | null>(null)

    const handleToggle = (key: keyof typeof config) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleTestTrigger = (msg: string) => {
        setShowToast(msg)
        setTimeout(() => setShowToast(null), 3000)
    }

    const handleFlashSaleToggle = async () => {
        setLoadingFlash(true)
        try {
            const newState = !flashSaleActive
            await toggleBusinessFlashSale(business.id, newState, 3) // Default 3 hours
            setFlashSaleActive(newState)
            if (newState) {
                const endsAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
                setFlashSaleEndsAt(endsAt)
                handleTestTrigger("🔥 Flash Sale Activado por 3 horas!")
            } else {
                setFlashSaleEndsAt(undefined)
                handleTestTrigger("Flash Sale Desactivado")
            }
        } catch (error) {
            console.error(error)
            alert('Error al cambiar estado de Flash Sale')
        } finally {
            setLoadingFlash(false)
        }
    }

    const handleCreateCampaign = () => {
        const campaign = {
            id: campaigns.length + 1,
            name: newCampaign.name || 'Nueva Campaña',
            type: newCampaign.type,
            status: 'Active',
            trigger: newCampaign.trigger
        }
        setCampaigns([...campaigns, campaign])
        setShowCreateModal(false)
        setNewCampaign({ name: '', type: 'WhatsApp', trigger: 'Manual' })
        handleTestTrigger("✅ Campaña creada exitosamente")
    }

    return (
        <div className="max-w-4xl mx-auto relative pb-10">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-black px-6 py-3 rounded-full font-bold shadow-lg animate-in fade-in slide-in-from-top-4 flex items-center">
                    {showToast}
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1">Automatización de Marketing</h1>
                <p className="text-zinc-400 text-sm">Configura tus mensajes automáticos y campañas para retener clientes.</p>
            </div>

            {/* Flash Sale Panic Button */}
            <div className="mb-8 bg-gradient-to-r from-red-900/20 to-orange-900/20 p-6 rounded-xl border border-red-500/30 relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <Zap className="text-yellow-500 mr-2" fill="currentColor" />
                            Flash Sale "Panic Button"
                        </h2>
                        <p className="text-zinc-400 text-sm mt-1">Activa un descuento del 20% en todos los servicios por 3 horas.</p>
                        {flashSaleActive && flashSaleEndsAt && (
                            <p className="text-yellow-500 text-xs font-bold mt-2 flex items-center animate-pulse">
                                <Clock size={12} className="mr-1" />
                                Termina: {new Date(flashSaleEndsAt).toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleFlashSaleToggle}
                        disabled={loadingFlash}
                        className={cn(
                            "px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg",
                            flashSaleActive
                                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                                : "bg-white text-black hover:bg-zinc-200"
                        )}
                    >
                        {loadingFlash ? 'Procesando...' : flashSaleActive ? 'DESACTIVAR' : 'ACTIVAR AHORA'}
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
                {/* Birthday Automation */}
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-pink-500/10 p-2 rounded-lg text-pink-500">
                                <Gift size={20} />
                            </div>
                            <h3 className="font-bold">Regalo de Cumpleaños</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={config.birthdayAutomation}
                                onChange={() => handleToggle('birthdayAutomation')}
                            />
                            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                        </label>
                    </div>
                    <p className="text-zinc-400 text-xs mb-4">Envía automáticamente un cupón de 20% de descuento en el cumpleaños del cliente.</p>
                    {config.birthdayAutomation && (
                        <button
                            onClick={() => handleTestTrigger("🎂 Mensaje de cumpleaños de prueba enviado!")}
                            className="w-full py-2 text-xs font-bold text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors flex items-center justify-center"
                        >
                            <Play size={12} className="mr-1" /> Probar Envío
                        </button>
                    )}
                </div>

                {/* Automatic Reminders */}
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                                <Bell size={20} />
                            </div>
                            <h3 className="font-bold">Recordatorios de Citas</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={config.enableSmsReminders}
                                onChange={() => handleToggle('enableSmsReminders')}
                            />
                            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <p className="text-zinc-400 text-xs mb-4">Envía recordatorios automáticos por WhatsApp/SMS para reducir inasistencias.</p>
                </div>

                {/* Review Requests */}
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-500/10 p-2 rounded-lg text-green-500">
                                <MessageSquare size={20} />
                            </div>
                            <h3 className="font-bold">Solicitud de Reseñas</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={config.enableWhatsappReviews}
                                onChange={() => handleToggle('enableWhatsappReviews')}
                            />
                            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                    <p className="text-zinc-400 text-xs mb-4">Envía un mensaje automático por WhatsApp después de la cita pidiendo una reseña.</p>
                </div>

                {/* Loyalty Program */}
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500">
                                <Gift size={20} />
                            </div>
                            <h3 className="font-bold">Programa de Lealtad</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={config.loyaltyProgramEnabled}
                                onChange={() => handleToggle('loyaltyProgramEnabled')}
                            />
                            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                    <p className="text-zinc-400 text-xs mb-4">Premia a tus clientes frecuentes con puntos por cada visita.</p>
                </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Campañas Activas</h3>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-white text-black px-3 py-1.5 rounded-lg text-sm font-bold flex items-center hover:bg-zinc-200 transition-colors"
                    >
                        <Plus size={16} className="mr-1" /> Nueva
                    </button>
                </div>
                <div className="divide-y divide-zinc-800">
                    {campaigns.map(campaign => (
                        <div key={campaign.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                            <div>
                                <p className="font-medium">{campaign.name}</p>
                                <p className="text-xs text-zinc-500">Trigger: {campaign.trigger}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${campaign.status === 'Active'
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                    }`}>
                                    {campaign.status}
                                </span>
                                <span className="text-xs text-zinc-400">{campaign.type}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Campaign Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-800 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Nueva Campaña</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Nombre de la Campaña</label>
                                <input
                                    type="text"
                                    value={newCampaign.name}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white"
                                    placeholder="Ej. Oferta de Verano"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Tipo</label>
                                    <select
                                        value={newCampaign.type}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })}
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white"
                                    >
                                        <option>WhatsApp</option>
                                        <option>SMS</option>
                                        <option>Email</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1">Disparador (Trigger)</label>
                                    <select
                                        value={newCampaign.trigger}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, trigger: e.target.value })}
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white"
                                    >
                                        <option>Manual</option>
                                        <option>Birthday</option>
                                        <option>Inactive {'>'} 30 days</option>
                                        <option>New Client</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1">Mensaje</label>
                                <textarea
                                    className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white h-24"
                                    placeholder="Escribe tu mensaje aquí..."
                                ></textarea>
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
                                onClick={handleCreateCampaign}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
                            >
                                Crear Campaña
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
