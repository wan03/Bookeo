export default function CreatorVerificationPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Verificación de Creador</h1>
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                <p className="text-zinc-400 mb-6">
                    Para acceder a las ofertas de intercambio, necesitamos verificar que eres un creador de contenido activo.
                </p>

                <div className="space-y-6">
                    <div className="border border-zinc-800 rounded-xl p-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">📸</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2">Conecta tus Redes</h3>
                        <p className="text-sm text-zinc-500 mb-4">
                            Vincula tu cuenta de Instagram o TikTok para que podamos analizar tu audiencia.
                        </p>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
                            Conectar Instagram
                        </button>
                    </div>

                    <div className="border border-zinc-800 rounded-xl p-6 flex flex-col items-center text-center opacity-50">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">📝</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2">Completa tu Perfil</h3>
                        <p className="text-sm text-zinc-500 mb-4">
                            Cuéntanos sobre tu estilo y qué tipo de colaboraciones buscas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
