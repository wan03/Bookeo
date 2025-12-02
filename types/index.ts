export type UserRole = 'consumer' | 'business_owner' | 'staff' | 'admin' | 'influencer';

export interface Business {
    id: string
    name: string
    description: string
    address: string
    imageUrl: string
    rating: number
    reviewCount: number
    services: Service[]
    monthlyRevenueGoal?: number
    flashSaleActive?: boolean
    flashSaleEndsAt?: string
}

export interface BusinessResource {
    id: string
    name: string
    type: 'room' | 'equipment' | 'chair' | 'other'
}

export interface ClientStats {
    id: string
    name: string
    email: string
    phone: string
    totalVisits: number
    lastVisit: string | null
    noShowCount: number
    avatarUrl?: string
}

export interface StaffMember {
    id: string
    name: string
    specialties: string[]
    avatarUrl?: string
}

export interface Service {
    id: string
    name: string
    description: string
    price: number
    duration: number // in minutes
    resourceIds?: string[]
}

export interface TimeSlot {
    time: string // "09:00"
    available: boolean
}

export interface VideoPost {
    id: number | string
    businessId: string
    businessName: string
    service: string
    videoUrl: string
    location: string
    rating: number
    likes: number
    description: string
    price: string
    hasGenerator: boolean
    isVerified: boolean
    tags: string[]
}

export type AudienceType = 'universal' | 'influencer_only';

export interface InfluencerProfile {
    id: string;
    instagramHandle?: string;
    tiktokHandle?: string;
    instagramFollowers: number;
    tiktokFollowers: number;
    isVerified: boolean;
    reputationScore: number;
    badges: string[];
    nicheTags: string[];
}

export type ContentStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'posted';

export interface ContentSubmission {
    id: string;
    applicationId: string;
    influencerId: string;
    businessId: string;
    contentUrl?: string;
    platform: string;
    status: ContentStatus;
    feedback?: string;
    submittedAt?: string;
    approvedAt?: string;
    createdAt: string;
}

export interface BarterOffer {
    id: string
    businessName: string
    serviceName: string
    description: string
    imageUrl: string
    location: string
    value: number
    minFollowers: number
    platform: 'Instagram' | 'TikTok' | 'YouTube'
    tags: string[]
    audienceType: AudienceType
    categoryTags: string[]
    maxApplications: number
    expiresAt?: string
}

export interface Appointment {
    id: string
    businessId: string
    businessName: string
    serviceName: string
    date: string // ISO string
    time: string
    status: 'confirmed' | 'completed' | 'cancelled' | 'pending' | 'no_show'
    price: number
    location: string
    clientName?: string
    avatar?: string
}
