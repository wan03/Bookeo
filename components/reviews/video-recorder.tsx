'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileVideo, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoUploaderProps {
    onUploadComplete: (url: string) => void
    onCancel: () => void
}

export default function VideoUploader({ onUploadComplete, onCancel }: VideoUploaderProps) {
    const [step, setStep] = useState<'select' | 'uploading' | 'success'>('select')
    const [progress, setProgress] = useState(0)
    const [fileName, setFileName] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type.startsWith('video/')) {
                setFileName(file.name)
                startUpload()
            } else {
                alert('Por favor selecciona un archivo de video válido.')
            }
        }
    }

    const startUpload = () => {
        setStep('uploading')
        // Simulate Upload
        let p = 0
        const interval = setInterval(() => {
            p += 10
            setProgress(p)
            if (p >= 100) {
                clearInterval(interval)
                setStep('success')
                setTimeout(() => {
                    onUploadComplete("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
                }, 1500)
            }
        }, 300)
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden relative">
                {/* Close Button */}
                <button onClick={onCancel} className="absolute top-4 right-4 text-zinc-500 hover:text-white z-10">
                    <X size={24} />
                </button>

                <div className="p-8 text-center">
                    {step === 'select' && (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                <Upload size={32} className="text-blue-500" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Sube tu Video Reseña</h2>
                            <p className="text-zinc-400 text-sm mb-6">Comparte tu experiencia con un video corto. (Max 1 min)</p>

                            <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                            />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all w-full flex items-center justify-center"
                            >
                                <FileVideo size={20} className="mr-2" />
                                Seleccionar Video
                            </button>
                        </div>
                    )}

                    {step === 'uploading' && (
                        <div className="flex flex-col items-center py-4">
                            <div className="w-16 h-16 relative mb-4">
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="8" />
                                    <circle
                                        cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="8"
                                        strokeDasharray="283"
                                        strokeDashoffset={283 - (283 * progress / 100)}
                                        className="transition-all duration-300 ease-out"
                                        transform="rotate(-90 50 50)"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-500 text-xs">
                                    {progress}%
                                </div>
                            </div>
                            <h3 className="font-bold mb-1">Subiendo Video...</h3>
                            <p className="text-zinc-500 text-xs truncate max-w-[200px]">{fileName}</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="flex flex-col items-center py-4 animate-in zoom-in">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle size={32} className="text-green-500" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">¡Video Subido!</h2>
                            <p className="text-zinc-400 text-sm">Gracias por compartir tu experiencia.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
