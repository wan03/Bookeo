export default function CreatorProfilePage() {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Mi Perfil de Creador</h1>
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold">
                        INF
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Influencer Demo</h2>
                        <p className="text-zinc-400">@influencer_demo</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-black p-4 rounded-lg">
                        <p className="text-zinc-500 text-xs uppercase">Seguidores</p>
                        <p className="text-2xl font-bold">12.5K</p>
                    </div>
                    <div className="bg-black p-4 rounded-lg">
                        <p className="text-zinc-500 text-xs uppercase">Engagement</p>
                        <p className="text-2xl font-bold text-green-500">4.8%</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Cuentas Conectadas</h3>
                    <div className="flex items-center justify-between bg-black p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-lg"></div>
                            <span>Instagram</span>
                        </div>
                        <span className="text-green-500 text-sm font-medium">Conectado</span>
                    </div>
                    <div className="flex items-center justify-between bg-black p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-black border border-zinc-700 rounded-lg flex items-center justify-center">TT</div>
                            <span>TikTok</span>
                        </div>
                        <button className="text-blue-500 text-sm font-medium">Conectar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
