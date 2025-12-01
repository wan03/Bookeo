'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/types'
import { Loader2, Phone, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
    redirectTo?: string
}

export default function AuthClient({ redirectTo }: Props) {
    const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState<UserRole>('consumer')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSignUp, setIsSignUp] = useState(false)

    const router = useRouter()
    const supabase = createClient()
    const redirect = redirectTo || '/'

    const formatPhoneNumber = (value: string) => {
        return value.replace(/\D/g, '')
    }

    const getAuthEmail = () => {
        if (authMethod === 'email') return email
        const cleanPhone = formatPhoneNumber(phoneNumber)
        return `${cleanPhone}@phone.bookeo.com`
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const finalEmail = getAuthEmail()
        const cleanPhone = formatPhoneNumber(phoneNumber)

        if (authMethod === 'phone' && cleanPhone.length < 10) {
            setError('Por favor ingresa un número de teléfono válido')
            setLoading(false)
            return
        }

        if (authMethod === 'email' && cleanPhone.length < 10) {
            setError('El número de teléfono es obligatorio')
            setLoading(false)
            return
        }

        try {
            const { data: { user }, error: signUpError } = await supabase.auth.signUp({
                email: finalEmail,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone_number: cleanPhone
                    }
                }
            })

            if (signUpError) throw signUpError

            if (user) {
                const { error: profileError } = await supabase.from('profiles').insert({
                    id: user.id,
                    email: finalEmail,
                    full_name: fullName,
                    phone_number: cleanPhone,
                    role: role
                })

                if (profileError) {
                    console.error('Profile creation error:', profileError)
                    throw new Error('Failed to create profile. Please try again.')
                }

                if (role === 'business_owner') router.push('/negocio/panel')
                else if (role === 'influencer') router.push('/creador/intercambios')
                else router.push(redirect)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const finalEmail = getAuthEmail()

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: finalEmail,
                password
            })

            if (signInError) {
                console.error('Sign in error:', signInError)
                throw signInError
            }

            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                const userRole = profile?.role

                if (redirect && redirect !== '/') {
                    router.push(redirect)
                } else {
                    if (userRole === 'business_owner' || userRole === 'staff') {
                        router.push('/negocio/panel')
                    }
                    else if (userRole === 'influencer') {
                        router.push('/creador/intercambios')
                    }
                    else {
                        router.push('/')
                    }
                }
            } else {
                console.error('No user found after sign in')
            }
        } catch (err: any) {
            console.error('Catch block error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="p-6 text-center border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-blue-600">Booksy DR</h1>
                    <p className="text-sm text-gray-500 mt-1">Bienvenido a la mejor plataforma de reservas.</p>
                </div>

                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setAuthMethod('phone')}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 transition-colors border-b-2",
                            authMethod === 'phone'
                                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        <Phone size={16} />
                        <span>Teléfono</span>
                    </button>
                    <button
                        onClick={() => setAuthMethod('email')}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 transition-colors border-b-2",
                            authMethod === 'email'
                                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        <Mail size={16} />
                        <span>Email</span>
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setIsSignUp(false)}
                            className={cn(
                                "flex-1 py-2 text-sm font-medium rounded-md shadow-sm transition-all",
                                !isSignUp ? "bg-white text-gray-900" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => setIsSignUp(true)}
                            className={cn(
                                "flex-1 py-2 text-sm font-medium rounded-md shadow-sm transition-all",
                                isSignUp ? "bg-white text-gray-900" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            Registrarse
                        </button>
                    </div>

                    <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
                        {isSignUp && (
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">Nombre Completo</label>
                                <input
                                    id="name"
                                    placeholder="Juan Pérez"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    required
                                />
                            </div>
                        )}

                        {authMethod === 'phone' && (
                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-medium text-gray-700">Teléfono</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="809-555-5555"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    required
                                />
                            </div>
                        )}

                        {authMethod === 'email' && (
                            <>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="tu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        required
                                    />
                                </div>
                                {isSignUp && (
                                    <div className="space-y-2">
                                        <label htmlFor="phone-required" className="text-sm font-medium text-gray-700">Teléfono <span className="text-red-500">*</span></label>
                                        <input
                                            id="phone-required"
                                            type="tel"
                                            placeholder="809-555-5555"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                            required
                                        />
                                        <p className="text-xs text-gray-500">Requerido para confirmar citas.</p>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                required
                            />
                        </div>

                        {isSignUp && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Quiero usar la app como:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setRole('consumer')}
                                        className={cn(
                                            "py-2 text-sm font-medium rounded-md border transition-colors",
                                            role === 'consumer' ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        )}
                                    >
                                        Cliente
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('business_owner')}
                                        className={cn(
                                            "py-2 text-sm font-medium rounded-md border transition-colors",
                                            role === 'business_owner' ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        )}
                                    >
                                        Negocio
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('influencer')}
                                        className={cn(
                                            "py-2 text-sm font-medium rounded-md border transition-colors",
                                            role === 'influencer' ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        )}
                                    >
                                        Creador
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-md font-medium flex items-center justify-center transition-colors" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isSignUp ? 'Crear Cuenta' : 'Entrar'}
                        </button>
                    </form>
                </div>
                <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        Al continuar, aceptas nuestros términos y condiciones.
                    </p>
                </div>
            </div>
        </div>
    )
}
