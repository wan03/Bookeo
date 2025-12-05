import SettingsForm from '@/components/admin/settings-form'
import { Settings } from 'lucide-react'

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Platform Settings</h2>
                    <p className="text-slate-400">Configure global application settings</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <Settings className="w-5 h-5 text-slate-400" />
                    <span className="text-white font-semibold">Config</span>
                </div>
            </div>

            <div className="max-w-2xl">
                <SettingsForm />
            </div>
        </div>
    )
}
