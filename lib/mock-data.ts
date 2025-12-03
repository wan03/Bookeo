import { Business, Service, TimeSlot, VideoPost, BarterOffer, Appointment } from '@/types'

// --- VIDEOS (Feed) ---
export const MOCK_VIDEOS: VideoPost[] = [
    {
        id: 1,
        businessId: '1',
        businessName: "High Level Cuts",
        service: "Cerquillo & Fade",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        location: "Piantini, SD",
        rating: 4.9,
        likes: 1240,
        description: "Activo con el corte del fin de semana! 🔥🇩🇴 #barber #dr #estilo",
        price: "RD$ 800",
        hasGenerator: true,
        isVerified: true,
        tags: ['Corte', 'Barba']
    },
    {
        id: 2,
        businessId: '2',
        businessName: "Hola Johis Beauty",
        service: "Uñas Acrílicas",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        location: "Santiago",
        rating: 5.0,
        likes: 850,
        description: "Vibras de verano ✨💅 Diseño exclusivo para @maria. #uñas #santiago #belleza",
        price: "RD$ 1500",
        hasGenerator: false,
        isVerified: true,
        tags: ['Uñas', 'Diseño']
    },
    {
        id: 3,
        businessId: '3',
        businessName: "Virginia Spa",
        service: "Masaje Relajante",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        location: "Bella Vista, SD",
        rating: 5.0,
        likes: 2100,
        description: "Escápate del estrés de la ciudad. 💆‍♀️🍃 #spa #relax #piantini",
        price: "RD$ 2500",
        hasGenerator: true,
        isVerified: true,
        tags: ['Masaje', 'Spa']
    },
    {
        id: 4,
        businessId: '4',
        businessName: "Flow Urbano Cuts",
        service: "Diseño Freestyle",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        location: "Santo Domingo Este",
        rating: 4.7,
        likes: 3200,
        description: "El verdadero arte en la cabeza. 🎨💈 Pregunta por el combo. #freestyle #barbershop",
        price: "RD$ 1200",
        hasGenerator: true,
        isVerified: false,
        tags: ['Freestyle', 'Arte']
    },
    {
        id: 5,
        businessId: '5',
        businessName: "Glamour Hair Salon",
        service: "Balayage & Color",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        location: "Bella Vista, SD",
        rating: 4.9,
        likes: 1500,
        description: "Transformación total! Rubio perfecto sin dañar tu cabello. 👱‍♀️✨ #balayage #color #hair",
        price: "RD$ 4500",
        hasGenerator: true,
        isVerified: true,
        tags: ['Color', 'Cabello']
    },
    {
        id: 6,
        businessId: '1',
        businessName: "High Level Cuts",
        service: "Barba & Toalla Caliente",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        location: "Piantini, SD",
        rating: 4.9,
        likes: 980,
        description: "El ritual que te mereces. Relájate y sal nítido. 🧖‍♂️💈 #barba #relax",
        price: "RD$ 600",
        hasGenerator: true,
        isVerified: true,
        tags: ['Barba', 'Spa']
    },
    {
        id: 7,
        businessId: '6',
        businessName: "Tattoo Art DR",
        service: "Tatuaje Realista",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        location: "Zona Colonial",
        rating: 5.0,
        likes: 4500,
        description: "Arte en la piel. Agenda abierta para este mes. 💉🎨 #tattoo #ink #zonacolonial",
        price: "RD$ 5000+",
        hasGenerator: false,
        isVerified: true,
        tags: ['Tattoo', 'Arte']
    },
    {
        id: 8,
        businessId: '2',
        businessName: "Hola Johis Beauty",
        service: "Pedicure Spa",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        location: "Santiago",
        rating: 5.0,
        likes: 720,
        description: "Tus pies también merecen amor. 🦶✨ #pedicure #spa #santiago",
        price: "RD$ 1000",
        hasGenerator: false,
        isVerified: true,
        tags: ['Pies', 'Spa']
    },
    {
        id: 9,
        businessId: '7',
        businessName: "Body Shop Athletic Club",
        service: "Clase de Prueba",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        location: "Naco, SD",
        rating: 4.9,
        likes: 2800,
        description: "Rompe tus límites! Primera clase gratis. 💪🏋️‍♂️ #crossfit #fitness #naco",
        price: "Gratis",
        hasGenerator: true,
        isVerified: true,
        tags: ['Fitness', 'Gym']
    },
    {
        id: 10,
        businessId: '3',
        businessName: "Virginia Spa",
        service: "Facial Profundo",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
        location: "Bella Vista, SD",
        rating: 5.0,
        likes: 1800,
        description: "Piel radiante en 60 minutos. ✨🧖‍♀️ #facial #skincare #glow",
        price: "RD$ 3000",
        hasGenerator: true,
        isVerified: true,
        tags: ['Facial', 'Skincare']
    },
    {
        id: 11,
        businessId: '8',
        businessName: "GS Hairdresser",
        service: "Corte Ejecutivo",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
        location: "Av. Roberto Pastoriza, SD",
        rating: 5.0,
        likes: 1100,
        description: "Corte clásico para el hombre moderno. Atención de primera. ✂️👔 #barber #ejecutivo",
        price: "RD$ 1000",
        hasGenerator: true,
        isVerified: true,
        tags: ['Corte', 'Ejecutivo']
    },
    {
        id: 12,
        businessId: '9',
        businessName: "Skin Studio",
        service: "Laser Hair Removal",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
        location: "Piantini, SD",
        rating: 5.0,
        likes: 950,
        description: "Olvídate de la rasuradora. Piel suave para siempre. ✨🚫🪒 #laser #skincare",
        price: "RD$ 2000",
        hasGenerator: true,
        isVerified: true,
        tags: ['Laser', 'Skincare']
    }
]

// --- BUSINESSES (Booking) ---
export const MOCK_BUSINESSES: Record<string, Business> = {
    '1': {
        id: '1',
        name: "High Level Cuts",
        description: "La barbería más dura de Piantini. Ambiente exclusivo, aire full, y los mejores barberos de la zona. Especialistas en cerquillos y fades.",
        address: "Calle Federico Geraldino, Piantini, Santo Domingo",
        imageUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
        rating: 4.9,
        reviewCount: 342,
        services: [
            { id: 's1', name: "Cerquillo Clásico", description: "Corte con navaja y estilo", price: 800, duration: 45 },
            { id: 's2', name: "Arreglo de Barba", description: "Toalla caliente y perfilado", price: 600, duration: 30 },
            { id: 's3', name: "El Completo", description: "Corte + Barba + Facial + Bebida", price: 1800, duration: 90 },
            { id: 's4', name: "Corte Niño", description: "Para los pequeños de la casa", price: 500, duration: 30 },
        ]
    },
    '2': {
        id: '2',
        name: "Hola Johis Beauty",
        description: "Expertas en uñas acrílicas, gel, y diseño. Déjanos consentirte con las últimas tendencias en Santiago.",
        address: "Jardín Plaza, Av. Padre Ramón Dubert, Santiago",
        imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80",
        rating: 5.0,
        reviewCount: 215,
        services: [
            { id: 's1', name: "Full Set Acrílico", description: "Diseño básico incluido", price: 1500, duration: 90 },
            { id: 's2', name: "Manicure Gel", description: "Limpieza y esmaltado en gel", price: 800, duration: 45 },
            { id: 's3', name: "Pedicure Spa", description: "Hidratación profunda", price: 1000, duration: 60 },
        ]
    },
    '3': {
        id: '3',
        name: "Virginia Spa",
        description: "El primer spa formal de RD. Un oasis de relajación y bienestar con más de 50 años de experiencia.",
        address: "Av. Sarasota, Bella Vista, Santo Domingo",
        imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
        rating: 5.0,
        reviewCount: 520,
        services: [
            { id: 's1', name: "Masaje Relajante", description: "60 minutos de aromaterapia", price: 2500, duration: 60 },
            { id: 's2', name: "Facial Profundo", description: "Limpieza y extracción", price: 3000, duration: 75 },
            { id: 's3', name: "Día de Spa", description: "Masaje + Facial + Exfoliación", price: 5500, duration: 180 },
        ]
    },
    '4': {
        id: '4',
        name: "Flow Urbano Cuts",
        description: "Donde nace el estilo. Especialistas en diseños freestyle y colorimetría para hombres.",
        address: "Av. Venezuela, Santo Domingo Este",
        imageUrl: "https://images.unsplash.com/photo-1503951914205-98c43ce651f9?w=800&q=80",
        rating: 4.7,
        reviewCount: 180,
        services: [
            { id: 's1', name: "Corte Freestyle", description: "Diseño personalizado", price: 1200, duration: 60 },
            { id: 's2', name: "Tinte Fantasía", description: "Colores vibrantes", price: 2000, duration: 90 },
            { id: 's3', name: "Corte Clásico", description: "Degradado limpio", price: 700, duration: 45 },
        ]
    },
    '5': {
        id: '5',
        name: "Glamour Hair Salon",
        description: "Tu cabello en las mejores manos. Balayage, Keratina, y cortes modernos.",
        address: "Av. Sarasota, Bella Vista",
        imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
        rating: 4.9,
        reviewCount: 410,
        services: [
            { id: 's1', name: "Balayage", description: "Incluye matizado y secado", price: 4500, duration: 240 },
            { id: 's2', name: "Corte Dama", description: "Lavado y secado incluido", price: 1200, duration: 60 },
            { id: 's3', name: "Cirugía Capilar", description: "Alisado progresivo", price: 3500, duration: 180 },
        ]
    },
    '7': {
        id: '7',
        name: "Body Shop Athletic Club",
        description: "El club atlético más completo de Santo Domingo. Entrena con los mejores equipos y clases grupales.",
        address: "Calle Fantino Falco, Naco, Santo Domingo",
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
        rating: 4.9,
        reviewCount: 850,
        services: [
            { id: 's1', name: "Day Pass", description: "Acceso total por un día", price: 1500, duration: 0 },
            { id: 's2', name: "Clase de Pilates", description: "Grupo pequeño", price: 800, duration: 60 },
            { id: 's3', name: "Entrenamiento Personal", description: "1 hora con coach certificado", price: 2000, duration: 60 },
        ]
    },
    '8': {
        id: '8',
        name: "GS Hairdresser",
        description: "Excelencia en barbería clásica y moderna. Un espacio diseñado para el caballero.",
        address: "Av. Roberto Pastoriza, Santo Domingo",
        imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80",
        rating: 5.0,
        reviewCount: 120,
        services: [
            { id: 's1', name: "Corte Ejecutivo", description: "Lavado + Corte + Peinado", price: 1000, duration: 45 },
            { id: 's2', name: "Afeitado Real", description: "Navaja y toallas calientes", price: 800, duration: 30 },
        ]
    },
    '9': {
        id: '9',
        name: "Skin Studio",
        description: "Centro de rejuvenecimiento y cuidado de la piel. Tecnología de punta para resultados visibles.",
        address: "Av. Winston Churchill, Piantini, Santo Domingo",
        imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
        rating: 5.0,
        reviewCount: 95,
        services: [
            { id: 's1', name: "Laser Hair Removal (Axilas)", description: "Sesión individual", price: 2000, duration: 30 },
            { id: 's2', name: "Limpieza Facial Profunda", description: "Con microdermoabrasión", price: 3500, duration: 60 },
        ]
    }
}

// --- OFFERS (Barter) ---
export const MOCK_OFFERS: BarterOffer[] = [
    {
        id: '1',
        businessName: "High Level Cuts",
        serviceName: "Corte VIP + Barba",
        description: "Buscamos influencers de lifestyle para promocionar nuestro nuevo local en Piantini.",
        imageUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
        location: "Piantini, SD",
        value: 1500,
        minFollowers: 5000,
        platform: "Instagram",
        tags: ["Lifestyle", "Men's Grooming"],
        audienceType: 'universal',
        categoryTags: [],
        maxApplications: 10
    },
    {
        id: '2',
        businessName: "Hola Johis Beauty",
        serviceName: "Full Set Acrílico",
        description: "Necesitamos contenido de alta calidad para nuestros reels. Intercambio por set completo.",
        imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80",
        location: "Santiago",
        value: 2500,
        minFollowers: 10000,
        platform: "TikTok",
        tags: ["Beauty", "Nails", "Fashion"],
        audienceType: 'universal',
        categoryTags: [],
        maxApplications: 10
    },
    {
        id: '3',
        businessName: "Virginia Spa",
        serviceName: "Masaje Relajante 1h",
        description: "Ven a probar nuestra nueva cabina de aromaterapia. Solo requerimos 3 stories.",
        imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
        location: "Bella Vista, SD",
        value: 3000,
        minFollowers: 15000,
        platform: "Instagram",
        tags: ["Wellness", "Travel"],
        audienceType: 'universal',
        categoryTags: [],
        maxApplications: 10
    },
    {
        id: '4',
        businessName: "Tattoo Art DR",
        serviceName: "Mini Tattoo (5cm)",
        description: "Tatuaje minimalista gratis a cambio de un Reel del proceso.",
        imageUrl: "https://images.unsplash.com/photo-1590246130793-2e1f5cd801c6?w=800&q=80",
        location: "Zona Colonial",
        value: 4000,
        minFollowers: 20000,
        platform: "Instagram",
        tags: ["Art", "Tattoo", "Alternative"],
        audienceType: 'universal',
        categoryTags: [],
        maxApplications: 10
    },
    {
        id: '5',
        businessName: "La Cassina",
        serviceName: "Cena para 2",
        description: "Degustación de nuestro nuevo menú de temporada.",
        imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
        location: "Piantini, SD",
        value: 6000,
        minFollowers: 50000,
        platform: "Instagram",
        tags: ["Foodie", "Luxury", "Lifestyle"],
        audienceType: 'universal',
        categoryTags: [],
        maxApplications: 10
    },
    {
        id: '6',
        businessName: "Body Shop Athletic Club",
        serviceName: "Membresía 1 Mes",
        description: "Buscamos gente fit para documentar su progreso por un mes.",
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
        location: "Naco, SD",
        value: 4500,
        minFollowers: 8000,
        platform: "TikTok",
        tags: ["Fitness", "Health", "Sports"],
        audienceType: 'universal',
        categoryTags: [],
        maxApplications: 10
    },
    {
        id: '7',
        businessName: "Glamour Hair Salon",
        serviceName: "Hidratación Profunda",
        description: "Recupera el brillo de tu cabello. Ideal para modelos.",
        imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80",
        location: "Bella Vista, SD",
        value: 2000,
        minFollowers: 5000,
        platform: "Instagram",
        tags: ["Beauty", "Hair"],
        audienceType: 'universal',
        categoryTags: [],
        maxApplications: 10
    },
    {
        id: '8',
        businessName: "EcoWash Car Detailing",
        serviceName: "Lavado Premium + Cera",
        description: "Deja tu máquina nueva. Video del antes y después.",
        imageUrl: "https://images.unsplash.com/photo-1520340356584-7db00e71dca8?w=800&q=80",
        location: "Los Prados, SD",
        value: 1800,
        minFollowers: 10000,
        platform: "TikTok",
        tags: ["Cars", "Detailing"],
        audienceType: 'universal',
        categoryTags: [],
        maxApplications: 10
    }
]

export const MOCK_SLOTS: TimeSlot[] = [
    { time: "09:00", available: true },
    { time: "09:45", available: true },
    { time: "10:30", available: false },
    { time: "11:15", available: true },
    { time: "13:00", available: true },
    { time: "13:45", available: true },
    { time: "14:30", available: true },
    { time: "15:15", available: false },
    { time: "16:00", available: true },
]

// --- USER & APPOINTMENTS (Profile/Citas) ---
export const MOCK_USER = {
    id: 'u1',
    name: "Juan Perez",
    email: "juan.perez@example.com",
    phone: "+1 (809) 555-0123",
    avatarUrl: "https://i.pravatar.cc/150?u=u1",
    stats: {
        appointments: 12,
        reviews: 5,
        favorites: 8
    }
}



export const MOCK_APPOINTMENTS: Appointment[] = [
    {
        id: 'a1',
        businessId: '1',
        businessName: "High Level Cuts",
        serviceName: "Cerquillo & Fade",
        date: new Date().toISOString(), // Today
        time: "16:00",
        status: 'confirmed',
        price: 800,
        location: "Piantini, SD"
    },
    {
        id: 'a2',
        businessId: '2',
        businessName: "Hola Johis Beauty",
        serviceName: "Manicure Gel",
        date: "2023-10-12T10:00:00Z",
        time: "10:00",
        status: 'completed',
        price: 800,
        location: "Santiago"
    },
    {
        id: 'a3',
        businessId: '4',
        businessName: "Flow Urbano Cuts",
        serviceName: "Corte Freestyle",
        date: "2023-09-25T14:30:00Z",
        time: "14:30",
        status: 'completed',
        price: 1200,
        location: "Santo Domingo Este"
    }
]

export const MOCK_CATEGORIES = [
    { id: 'barber', name: 'Barbería', icon: '✂️' },
    { id: 'salon', name: 'Salón', icon: '💇‍♀️' },
    { id: 'nails', name: 'Uñas', icon: '💅' },
    { id: 'spa', name: 'Spa', icon: '🧖‍♀️' },
    { id: 'tattoo', name: 'Tatuajes', icon: '💉' },
    { id: 'fitness', name: 'Fitness', icon: '🏋️‍♂️' },
    { id: 'makeup', name: 'Maquillaje', icon: '💄' },
    { id: 'brows', name: 'Cejas', icon: '👁️' }
]
