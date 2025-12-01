import { createClient } from '@/lib/supabase/server'
import { Business, Service, VideoPost, BarterOffer, Appointment, BusinessResource, ClientStats, StaffMember } from '@/types'

// Helper to get client
async function getClient() {
    return await createClient()
}

export async function getBusinesses(): Promise<Business[]> {
    const supabase = await getClient()
    const { data, error } = await supabase
        .from('businesses')
        .select(`
            *,
            services (*)
        `)

    if (error) {
        console.error('Error fetching businesses:', error)
        return []
    }

    // Map DB shape to App Type
    return data.map((b: any) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        address: b.address,
        imageUrl: b.image_url,
        rating: b.rating,
        reviewCount: b.review_count,
        services: b.services.map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            price: s.price,
            duration: s.duration_minutes
        }))
    }))
}

export async function getBusinessById(id: string): Promise<Business | null> {
    const supabase = await getClient()
    const { data, error } = await supabase
        .from('businesses')
        .select(`
            *,
            services (*)
        `)
        .eq('id', id)
        .single()

    if (error || !data) return null

    return {
        id: data.id,
        name: data.name,
        description: data.description,
        address: data.address,
        imageUrl: data.image_url,
        rating: data.rating,
        reviewCount: data.review_count,
        services: data.services.map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            price: s.price,
            duration: s.duration_minutes
        }))
    }
}

export async function getVideoFeed(): Promise<VideoPost[]> {
    const supabase = await getClient()
    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            businesses (name, has_generator, is_verified)
        `)
        .not('video_url', 'is', null)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching feed:', error)
        return []
    }

    return data.map((r: any) => ({
        id: r.id,
        businessId: r.business_id,
        businessName: r.businesses?.name || 'Unknown',
        service: 'Service', // TODO: Link review to service in schema if needed
        videoUrl: r.video_url,
        location: 'Santo Domingo', // Placeholder or fetch from business
        rating: r.rating,
        likes: 0, // Not in schema yet
        description: r.comment,
        price: 'RD$ 0', // Placeholder
        hasGenerator: r.businesses?.has_generator || false,
        isVerified: r.businesses?.is_verified || false,
        tags: []
    }))
}

export async function getBarterOffers(): Promise<BarterOffer[]> {
    const supabase = await getClient()
    const { data, error } = await supabase
        .from('barter_offers')
        .select(`
            *,
            businesses (name, address)
        `)
        .eq('status', 'active')

    if (error) return []

    return data.map((o: any) => ({
        id: o.id,
        businessName: o.businesses?.name || 'Unknown',
        serviceName: o.service_name,
        description: o.description,
        imageUrl: o.image_url,
        location: o.businesses?.address || 'Santo Domingo',
        value: o.value,
        minFollowers: o.min_followers,
        platform: o.platform as any,
        tags: o.tags || []
    }))
}

export async function getAppointments(businessId: string): Promise<Appointment[]> {
    const supabase = await getClient()
    const { data, error } = await supabase
        .from('bookings')
        .select(`
            *,
            profiles:customer_id (full_name, avatar_url),
            services (name, price)
        `)
        .eq('business_id', businessId)
        .order('start_time', { ascending: true })

    if (error) {
        console.error('Error fetching appointments:', error)
        return []
    }

    return data.map((b: any) => ({
        id: b.id,
        businessId: b.business_id,
        businessName: '', // Not needed for business view usually
        serviceName: b.services?.name || 'Unknown Service',
        date: b.start_time,
        time: new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: b.status,
        price: b.services?.price || 0,
        location: '', // Not needed
        clientName: b.profiles?.full_name || 'Unknown Client',
        avatar: b.profiles?.avatar_url || 'JP' // Fallback avatar
    }))
}

export async function getBusinessResources(businessId: string): Promise<BusinessResource[]> {
    const supabase = await getClient()
    const { data, error } = await supabase
        .from('business_resources')
        .select('*')
        .eq('business_id', businessId)

    if (error) return []
    return data as BusinessResource[]
}

export async function getClientStats(businessId: string): Promise<ClientStats[]> {
    const supabase = await getClient()
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select('customer_id, start_time, status, profiles(full_name, email, phone_number, avatar_url)')
        .eq('business_id', businessId)

    if (error) return []

    const statsMap = new Map<string, ClientStats>()

    bookings.forEach((b: any) => {
        if (!b.profiles) return
        const id = b.customer_id
        if (!statsMap.has(id)) {
            statsMap.set(id, {
                id,
                name: b.profiles.full_name,
                email: b.profiles.email,
                phone: b.profiles.phone_number,
                totalVisits: 0,
                lastVisit: null,
                noShowCount: 0,
                avatarUrl: b.profiles.avatar_url
            })
        }
        const stats = statsMap.get(id)!
        if (b.status === 'completed') {
            stats.totalVisits++
            if (!stats.lastVisit || new Date(b.start_time) > new Date(stats.lastVisit)) {
                stats.lastVisit = b.start_time
            }
        }
        if (b.status === 'no_show') {
            stats.noShowCount++
        }
    })

    return Array.from(statsMap.values())
}

export async function toggleFlashSale(businessId: string, active: boolean, durationHours: number = 3) {
    const supabase = await getClient()
    const endsAt = active ? new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString() : null

    await supabase.from('businesses').update({
        flash_sale_active: active,
        flash_sale_ends_at: endsAt
    }).eq('id', businessId)
}

export async function updateRevenueGoal(businessId: string, goal: number) {
    const supabase = await getClient()
    await supabase.from('businesses').update({ monthly_revenue_goal: goal }).eq('id', businessId)
}

export async function addResource(businessId: string, name: string, type: string) {
    const supabase = await getClient()
    await supabase.from('business_resources').insert({ business_id: businessId, name, type })
}

export async function deleteResource(id: string) {
    const supabase = await getClient()
    await supabase.from('business_resources').delete().eq('id', id)
}

export async function getStaff(businessId: string): Promise<StaffMember[]> {
    const supabase = await getClient()
    const { data, error } = await supabase
        .from('staff')
        .select('*, profiles(avatar_url)')
        .eq('business_id', businessId)

    if (error) return []
    return data.map((s: any) => ({
        id: s.id,
        name: s.name,
        specialties: s.specialties || [],
        avatarUrl: s.profiles?.avatar_url
    }))
}

export async function addStaff(businessId: string, name: string, specialties: string[]) {
    const supabase = await getClient()
    await supabase.from('staff').insert({ business_id: businessId, name, specialties })
}

export async function deleteStaff(id: string) {
    const supabase = await getClient()
    await supabase.from('staff').delete().eq('id', id)
}
