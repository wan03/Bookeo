import { Home, Search, Calendar, User, PlusCircle, Zap, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function MobileNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10 z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                <Link href="/" className="flex flex-col items-center text-white/70 hover:text-white transition-colors">
                    <Home size={24} />
                    <span className="text-[10px] mt-1">Inicio</span>
                </Link>
                <Link href="/explorar" className="flex flex-col items-center text-zinc-400 hover:text-white transition-colors">
                    <Search size={24} />
                    <span className="text-[10px] mt-1">Explorar</span>
                </Link>

                <Link href="/creador/intercambios" className="flex flex-col items-center text-zinc-400 hover:text-blue-500 transition-colors">
                    <div className="relative">
                        <Zap size={24} />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    </div>
                    <span className="text-[10px] mt-1 font-bold text-blue-500">Canjes</span>
                </Link>

                <Link href="/citas" className="flex flex-col items-center text-zinc-400 hover:text-white transition-colors">
                    <Calendar size={24} />
                    <span className="text-[10px] mt-1">Citas</span>
                </Link>

                <Link href="/negocio/panel" className="flex flex-col items-center text-zinc-400 hover:text-white transition-colors">
                    <Briefcase size={24} />
                    <span className="text-[10px] mt-1">Negocio</span>
                </Link>

                <Link href="/perfil" className="flex flex-col items-center text-white/70 hover:text-white transition-colors">
                    <User size={24} />
                    <span className="text-[10px] mt-1">Perfil</span>
                </Link>
            </div>
        </nav>
    )
}
