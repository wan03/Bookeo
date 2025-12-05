'use client'

import { Save } from 'lucide-react'

export default function SettingsForm() {
    return (
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50 p-6 space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Configuración de la Plataforma</h3>
                <div className="grid gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nombre de la Plataforma</label>
                        <input
                            type="text"
                            defaultValue="Bookeo"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email de Soporte</label>
                        <input
                            type="email"
                            defaultValue="support@bookeo.com"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Funcionalidades</h3>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-offset-slate-900" />
                        <div>
                            <p className="text-sm font-medium text-white">Habilitar Programa de Influenciadores</p>
                            <p className="text-xs text-slate-400">Permitir a usuarios registrarse como influenciadores</p>
                        </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-offset-slate-900" />
                        <div>
                            <p className="text-sm font-medium text-white">Habilitar Sistema de Canjes</p>
                            <p className="text-xs text-slate-400">Permitir a negocios publicar ofertas de canje</p>
                        </div>
                    </label>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-800/50">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                </button>
            </div>
        </div>
    )
}
