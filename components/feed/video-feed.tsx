'use client'

import { useState, useRef } from 'react'
import { Heart, MessageCircle, Share2, MapPin, Star } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { VideoPost } from '@/types'

interface VideoFeedProps {
    initialVideos: VideoPost[]
}

export default function VideoFeed({ initialVideos }: VideoFeedProps) {
    const [activeVideo, setActiveVideo] = useState(0)
    const [dataSaver, setDataSaver] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollTop, clientHeight } = containerRef.current
            const index = Math.round(scrollTop / clientHeight)
            setActiveVideo(index)
        }
    }

    return (
        <div className="relative h-[calc(100vh-64px)]">
            {/* Data Saver Toggle */}
            <button
                onClick={() => setDataSaver(!dataSaver)}
                className={cn(
                    "absolute bottom-4 left-4 z-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
                    dataSaver ? "bg-green-500 text-black border-green-500" : "bg-black/50 text-white/50 border-white/20 backdrop-blur-sm"
                )}
            >
                {dataSaver ? "Ahorro: ON" : "Ahorro: OFF"}
            </button>

            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
            >
                {initialVideos.map((video, index) => (
                    <div key={video.id} className="h-full w-full snap-start relative bg-black">
                        {/* Video Placeholder */}
                        {(!dataSaver || index === activeVideo) && (
                            <video
                                src={video.videoUrl}
                                className="w-full h-full object-cover opacity-80"
                                autoPlay={!dataSaver && index === activeVideo}
                                loop
                                muted
                                playsInline
                                controls={dataSaver}
                            />
                        )}
                        {dataSaver && index !== activeVideo && (
                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                <p className="text-zinc-500 text-xs">Video Pausado (Ahorro de Datos)</p>
                            </div>
                        )}

                        {/* Overlay Content */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 flex flex-col justify-end p-4 pb-24 pointer-events-none">
                            <div className="pointer-events-auto">
                                <div className="flex justify-between items-end">
                                    <div className="flex-1 mr-12">
                                        <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
                                            <h3 className="font-bold text-lg text-white">{video.businessName}</h3>
                                            <span className="bg-blue-500 text-white text-[10px] px-1 rounded-full flex items-center">Verificado</span>
                                            {video.rating >= 4.9 && (
                                                <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[10px] px-1 rounded-full font-bold flex items-center ml-1 border border-white/20 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                                    🔥 El Final
                                                </span>
                                            )}
                                            {video.hasGenerator && (
                                                <span className="bg-yellow-500 text-black text-[10px] px-1 rounded-full font-bold flex items-center ml-1">
                                                    ⚡ Planta Full
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-white/90 text-sm mb-2">{video.description}</p>

                                        <div className="flex items-center text-white/70 text-xs space-x-3 mb-4">
                                            <span className="flex items-center"><MapPin size={12} className="mr-1" /> {video.location}</span>
                                            <span className="flex items-center"><Star size={12} className="mr-1 text-yellow-400" /> {video.rating}</span>
                                            <span className="font-bold text-green-400">{video.price}</span>
                                        </div>
                                        <div className="p-4">
                                            <Link
                                                href={`/reservar/${video.businessId}`}
                                                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 mb-3 flex items-center justify-center"
                                            >
                                                Reservar Ahora
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Right Sidebar Actions */}
                                    <div className="flex flex-col space-y-6 items-center">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-white/10 p-3 rounded-full mb-1 backdrop-blur-sm">
                                                <Heart size={28} className="text-white" />
                                            </div>
                                            <span className="text-xs font-bold">{video.likes}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="bg-white/10 p-3 rounded-full mb-1 backdrop-blur-sm">
                                                <MessageCircle size={28} className="text-white" />
                                            </div>
                                            <span className="text-xs font-bold">Comentarios</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="bg-white/10 p-3 rounded-full mb-1 backdrop-blur-sm">
                                                <Share2 size={28} className="text-white" />
                                            </div>
                                            <span className="text-xs font-bold">Compartir</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
