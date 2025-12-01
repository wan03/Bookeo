'use client'

import { useState, useEffect } from 'react'
import { Clock, MapPin, Star, ChevronLeft, MessageCircle, Upload, ShieldCheck, Trophy, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { cn } from '@/lib/utils'
import { Service, Business } from '@/types'
import VoiceReview from '@/components/reviews/voice-review'
import VideoRecorder from '@/components/reviews/video-recorder'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'


interface BookingClientProps {
    business: Business
}

export default function BookingClient({ business }: BookingClientProps) {
    const [step, setStep] = useState<'service' | 'date' | 'confirm' | 'sms' | 'processing'>('service')
    const [activeTab, setActiveTab] = useState<'services' | 'reviews'>('services')
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)
    const [showRecorder, setShowRecorder] = useState(false)
    const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [smsCode, setSmsCode] = useState(['', '', '', ''])
    const [showConfetti, setShowConfetti] = useState(false)

    useEffect(() => {
        if (selectedDate && step === 'date') {
            const fetchSlots = async () => {
                setLoadingSlots(true)
                try {
                    const { getAvailableSlots } = await import('@/app/actions')
                    if (selectedService) {
                        const fetchedSlots = await getAvailableSlots(business.id, selectedService.id, selectedDate)
                        setSlots(fetchedSlots.map(s => ({ time: s, available: true })))
                    }
                } catch (error) {
                    console.error('Error fetching slots:', error)
                } finally {
                    setLoadingSlots(false)
                }
            }
            fetchSlots()
        }
    }, [selectedDate, step, business.id])

    const handleServiceSelect = (service: Service) => {
        setSelectedService(service)
        setStep('date')
    }

    const handleSlotSelect = (slot: string) => {
        setSelectedSlot(slot)
        setStep('confirm')
    }

    const handleConfirm = () => {
        setStep('sms')
    }

    const verifySms = () => {
        setStep('processing')
        setTimeout(() => {
            setIsSuccess(true)
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })
        }, 2000)
    }

    const handleSmsChange = (index: number, value: string) => {
        if (value.length > 1) return
        const newCode = [...smsCode]
        newCode[index] = value
        setSmsCode(newCode)

        // Auto-focus next input
        if (value && index < 3) {
            const nextInput = document.getElementById(`sms-${index + 1}`)
            nextInput?.focus()
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20"
                >
                    <Clock size={48} className="text-black" />
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-bold mb-2"
                >
                    ¡Reserva Confirmada!
                </motion.h1>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center space-x-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full mb-8 border border-yellow-500/20"
                >
                    <Trophy size={16} />
                    <span className="font-bold">+50 Puntos Bookeo</span>
                </motion.div>
                <p className="text-zinc-400 mb-8 max-w-xs mx-auto">Te hemos enviado los detalles por WhatsApp. ¡Nos vemos pronto!</p>
                <Link href="/" className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-8 rounded-xl transition-colors w-full max-w-xs">
                    Volver al Inicio
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-24">
            {/* Header */}
            <div className="relative h-48">
                <img src={business.imageUrl} alt={business.name} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                    <Link href="/" className="absolute -top-32 left-0 p-2 bg-black/50 rounded-full backdrop-blur-sm">
                        <ChevronLeft className="text-white" />
                    </Link>
                    <h1 className="text-2xl font-bold mb-1">{business.name}</h1>
                    <div className="flex items-center text-sm text-zinc-400 space-x-3">
                        <span className="flex items-center"><Star size={14} className="text-yellow-400 mr-1" /> {business.rating} ({business.reviewCount})</span>
                        <span className="flex items-center"><MapPin size={14} className="mr-1" /> {business.address}</span>
                    </div>
                </div>
            </div>

            <div className="p-4">
                {/* Progress Steps */}
                <div className="flex items-center space-x-2 mb-6 text-sm overflow-x-auto scrollbar-hide">
                    <button onClick={() => setStep('service')} className={cn("px-3 py-1 rounded-full whitespace-nowrap transition-colors", step === 'service' ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400")}>1. Servicio</button>
                    <span className="text-zinc-600">→</span>
                    <button onClick={() => selectedService && setStep('date')} disabled={!selectedService} className={cn("px-3 py-1 rounded-full whitespace-nowrap transition-colors", step === 'date' ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400")}>2. Fecha</button>
                    <span className="text-zinc-600">→</span>
                    <span className={cn("px-3 py-1 rounded-full whitespace-nowrap transition-colors", (step === 'confirm' || step === 'sms') ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400")}>3. Confirmar</span>
                </div>

                <AnimatePresence mode="wait">
                    {/* Tabs for Service/Reviews */}
                    {step === 'service' && (
                        <motion.div
                            key="service"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex border-b border-zinc-800 mb-6">
                                <button
                                    onClick={() => setActiveTab('services')}
                                    className={cn(
                                        "flex-1 py-3 text-center text-sm font-medium",
                                        activeTab === 'services' ? "text-blue-500 border-b-2 border-blue-500" : "text-zinc-400 hover:text-zinc-200"
                                    )}
                                >
                                    Servicios
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={cn(
                                        "flex-1 py-3 text-center text-sm font-medium",
                                        activeTab === 'reviews' ? "text-blue-500 border-b-2 border-blue-500" : "text-zinc-400 hover:text-zinc-200"
                                    )}
                                >
                                    Reseñas
                                </button>
                            </div>

                            {activeTab === 'services' && (
                                <div className="space-y-4">
                                    {business.services.map((service, idx) => (
                                        <motion.div
                                            key={service.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => handleServiceSelect(service)}
                                            className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-blue-500 transition-all cursor-pointer relative overflow-hidden group"
                                        >
                                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded-full flex items-center">
                                                    <Sparkles size={10} className="mr-1" />
                                                    +50 Pts
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-medium flex items-center">
                                                    {service.name}
                                                    {service.id === 's2' && (
                                                        <span className="ml-2 bg-red-600 text-white text-[10px] px-1 rounded animate-pulse">
                                                            🔥 Oferta Picapollo
                                                        </span>
                                                    )}
                                                </h3>
                                                <div className="text-right">
                                                    {service.id === 's2' ? (
                                                        <>
                                                            <span className="block text-xs text-zinc-500 line-through">RD$ {service.price}</span>
                                                            <span className="font-bold text-red-500">RD$ {service.price * 0.8}</span>
                                                        </>
                                                    ) : (
                                                        <span className="font-bold text-green-400">RD$ {service.price}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-zinc-400 mb-2">{service.description}</p>
                                            <div className="flex items-center text-xs text-zinc-500">
                                                <Clock size={12} className="mr-1" />
                                                {service.duration} min
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="mt-8 pt-6 border-t border-zinc-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold flex items-center">
                                            Reseñas de Clientes
                                            <span className="ml-2 text-xs bg-pink-600 text-white px-2 py-0.5 rounded-full">Nuevo: Video Notes</span>
                                        </h3>
                                        <button
                                            onClick={() => setShowRecorder(true)}
                                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold transition-colors flex items-center"
                                        >
                                            <Upload size={14} className="mr-1" />
                                            Subir Video Reseña
                                        </button>
                                    </div>
                                    {showRecorder && (
                                        <VideoRecorder
                                            onCancel={() => setShowRecorder(false)}
                                            onUploadComplete={(url: string) => {
                                                setShowRecorder(false)
                                                // In a real app, we would add the review to the list here
                                                alert("Video subido! (Simulación)")
                                            }}
                                        />
                                    )}
                                    <VoiceReview
                                        author="Juan Perez"
                                        date="Hace 2 días"
                                        duration="0:15"
                                        rating={5}
                                        comment="El mejor servicio, me dejaron nítido!"
                                        audioUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" // Mock audio
                                    />
                                    <VoiceReview
                                        author="Maria Rodriguez"
                                        date="Hace 1 semana"
                                        duration="0:24"
                                        rating={4}
                                        comment="Muy buen ambiente, pero hay que reservar con tiempo."
                                        audioUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" // Mock audio
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 2: Date & Time Selection */}
                    {step === 'date' && selectedService && (
                        <motion.div
                            key="date"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-semibold">Selecciona Fecha</h2>
                                <button onClick={() => setStep('service')} className="text-xs text-blue-500">Cambiar Servicio</button>
                            </div>

                            <div className="bg-zinc-900 rounded-xl p-2 border border-zinc-800 flex justify-center">
                                <DayPicker
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="text-zinc-100"
                                    modifiersClassNames={{
                                        selected: "bg-blue-600 text-white rounded-full",
                                        today: "text-blue-400 font-bold"
                                    }}
                                />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold mb-3">Horarios Disponibles</h2>
                                <div className="grid grid-cols-3 gap-3">
                                    {loadingSlots ? (
                                        <div className="col-span-3 text-center py-4 text-zinc-500">Cargando horarios...</div>
                                    ) : (
                                        slots.map((slot, idx) => (
                                            <button
                                                key={idx}
                                                disabled={!slot.available}
                                                onClick={() => handleSlotSelect(slot.time)}
                                                className={cn(
                                                    "py-3 rounded-lg text-sm font-medium border transition-all",
                                                    slot.available
                                                        ? "bg-zinc-900 border-zinc-800 hover:border-blue-500 hover:text-blue-500"
                                                        : "bg-zinc-900/50 border-zinc-800/50 text-zinc-600 cursor-not-allowed decoration-zinc-600"
                                                )}
                                            >
                                                {slot.time}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Confirmation & Auth */}
                    {step === 'confirm' && selectedService && selectedSlot && (
                        <motion.div
                            key="confirm"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 text-center">
                                <h2 className="text-xl font-bold mb-2">Resumen de Cita</h2>
                                <div className="space-y-4 my-6">
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Servicio</p>
                                        <p className="font-medium text-lg">{selectedService.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Fecha y Hora</p>
                                        <p className="font-medium text-lg">
                                            {selectedDate && format(selectedDate, 'MMMM d, yyyy')} a las {selectedSlot}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Precio Total</p>
                                        <p className="font-bold text-2xl text-green-400">RD$ {selectedService.price}</p>
                                    </div>
                                </div>

                                {/* Phone Auth Input */}
                                <div className="text-left mb-6">
                                    <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wider">Celular (WhatsApp)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MessageCircle className="text-green-500" size={20} />
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="809-000-0000"
                                            className="w-full bg-black border border-zinc-700 rounded-xl py-4 pl-10 pr-4 text-white placeholder-zinc-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-all"
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-500 mt-2 flex items-center">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                                        Te enviaremos el código de verificación por WhatsApp.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleConfirm}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-600/20 flex items-center justify-center space-x-2"
                                    >
                                        <span>Confirmar y Pagar en Local</span>
                                    </button>

                                    <div className="flex justify-center items-center space-x-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                        {/* Mock Payment Icons using text for now */}
                                        <span className="text-[10px] font-bold text-blue-400 border border-blue-400 px-1 rounded">Popular</span>
                                        <span className="text-[10px] font-bold text-green-400 border border-green-400 px-1 rounded">Banreservas</span>
                                        <span className="text-[10px] font-bold text-blue-300 border border-blue-300 px-1 rounded">Qik</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setStep('date')} className="w-full text-zinc-400 text-sm">Volver a Selección de Fecha</button>
                        </motion.div>
                    )}

                    {/* Step 4: SMS Verification */}
                    {step === 'sms' && (
                        <motion.div
                            key="sms"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="flex flex-col items-center justify-center min-h-[50vh] space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                                    <ShieldCheck size={32} />
                                </div>
                                <h2 className="text-2xl font-bold">Verifica tu Celular</h2>
                                <p className="text-zinc-400 text-sm">Ingresa el código que enviamos a tu WhatsApp</p>
                            </div>

                            <div className="flex space-x-4">
                                {smsCode.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        id={`sms-${idx}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleSmsChange(idx, e.target.value)}
                                        className="w-14 h-16 bg-zinc-900 border border-zinc-700 rounded-xl text-center text-2xl font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    />
                                ))}
                            </div>

                            <button
                                onClick={verifySms}
                                disabled={smsCode.some(d => !d)}
                                className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                            >
                                Verificar y Finalizar
                            </button>
                        </motion.div>
                    )}

                    {/* Step 5: Processing */}
                    {step === 'processing' && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center min-h-[50vh] space-y-6"
                        >
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Clock size={24} className="text-zinc-600 animate-pulse" />
                                </div>
                            </div>
                            <h2 className="text-xl font-medium animate-pulse">Confirmando tu cita...</h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    )
}
