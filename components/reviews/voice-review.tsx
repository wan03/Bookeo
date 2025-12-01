'use client'

import { useState, useRef } from 'react'
import { Play, Pause, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceReviewProps {
    author: string
    date: string
    duration: string
    audioUrl: string
    rating: number
    comment?: string
}

export default function VoiceReview({ author, date, duration, audioUrl, rating, comment }: VoiceReviewProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null)

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleEnded = () => {
        setIsPlaying(false)
    }

    return (
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-3">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-bold text-sm text-white">{author}</h4>
                    <p className="text-[10px] text-zinc-500">{date}</p>
                </div>
                <div className="flex text-yellow-400 text-xs">
                    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                </div>
            </div>

            {comment && <p className="text-zinc-400 text-xs mb-3 italic">"{comment}"</p>}

            <div className="bg-zinc-950 rounded-lg p-2 flex items-center space-x-3 border border-zinc-800">
                <button
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                </button>

                <div className="flex-1">
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        {/* Mock progress bar animation when playing */}
                        <div className={cn("h-full bg-blue-500 transition-all duration-1000", isPlaying ? "w-full animate-pulse" : "w-0")} />
                    </div>
                </div>

                <div className="flex items-center text-zinc-500 text-xs font-mono">
                    <Mic size={10} className="mr-1" />
                    {duration}
                </div>

                <audio ref={audioRef} src={audioUrl} onEnded={handleEnded} className="hidden" />
            </div>
        </div>
    )
}
