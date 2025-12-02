'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAvailableSlots(businessId: string, serviceId: string, date: Date) {
    const supabase = await createClient()

    // 1. Get Service Duration
    const { data: service } = await supabase
        .from('services')
        .select('duration_minutes')
        .eq('id', serviceId)
        .single()

    if (!service) return []
    const durationMinutes = service.duration_minutes

    // 2. Get Operating Hours for the specific day of week
    const dayOfWeek = date.getDay() // 0 = Sunday
    const { data: operatingHours } = await supabase
        .from('business_operating_hours')
        .select('*')
        .eq('business_id', businessId)
        .eq('day_of_week', dayOfWeek)
        .single()

    // Default hours if not set: 9am - 6pm, closed on Sunday (0)
    let startHour = 9
    let endHour = 18
    let isClosed = dayOfWeek === 0

    if (operatingHours) {
        if (operatingHours.is_closed) return []
        startHour = parseInt(operatingHours.open_time.split(':')[0])
        endHour = parseInt(operatingHours.close_time.split(':')[0])
    } else if (isClosed) return []

    // 3. Get Existing Bookings for that day
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data: bookings } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('business_id', businessId)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())

    // 4. Get Blocked Times for that day
    const { data: blockedTimes } = await supabase
        .from('business_blocked_time')
        .select('start_time, end_time')
        .eq('business_id', businessId)
        .or(`start_time.gte.${startOfDay.toISOString()},end_time.lte.${endOfDay.toISOString()}`)

    // 5. Generate Slots
    const slots: string[] = []

    // Create a date object for the start time
    let currentSlot = new Date(date)
    currentSlot.setHours(startHour, 0, 0, 0)

    const endTime = new Date(date)
    endTime.setHours(endHour, 0, 0, 0)

    while (currentSlot < endTime) {
        const slotStart = currentSlot
        const slotEnd = new Date(currentSlot.getTime() + durationMinutes * 60000)

        if (slotEnd > endTime) break

        // Check collision with existing bookings
        const isBooked = bookings?.some((booking: any) => {
            const bookingStart = new Date(booking.start_time)
            const bookingEnd = new Date(booking.end_time)
            return (slotStart < bookingEnd && slotEnd > bookingStart)
        })

        // Check collision with blocked times
        const isBlocked = blockedTimes?.some((blocked: any) => {
            const blockedStart = new Date(blocked.start_time)
            const blockedEnd = new Date(blocked.end_time)
            return (slotStart < blockedEnd && slotEnd > blockedStart)
        })

        if (!isBooked && !isBlocked) {
            slots.push(slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        }

        currentSlot = new Date(currentSlot.getTime() + 30 * 60000)
    }

    return slots
}

export async function getUserAppointments() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
            *,
            businesses (name, address, image_url),
            services (name, price, duration_minutes)
        `)
        .eq('customer_id', user.id)
        .order('start_time', { ascending: true })

    if (error) {
        console.error('Error fetching user appointments:', error)
        return []
    }

    return bookings.map((b: any) => ({
        id: b.id,
        businessId: b.business_id,
        businessName: b.businesses?.name || 'Unknown Business',
        serviceName: b.services?.name || 'Unknown Service',
        date: b.start_time,
        time: new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: b.status,
        price: b.services?.price || 0,
        location: b.businesses?.address || '',
        clientName: '', // Not needed for client view
        avatar: b.businesses?.image_url || ''
    }))
}

export async function getBusinesses(query: string = '', category: string | null = null) {
    const supabase = await createClient()

    let dbQuery = supabase
        .from('businesses')
        .select(`
            *,
            services (id, name, price)
        `)

    if (query) {
        dbQuery = dbQuery.ilike('name', `%${query}%`)
    }

    if (category) {
        dbQuery = dbQuery.eq('category', category)
    }

    const { data, error } = await dbQuery

    if (error) {
        console.error('Error fetching businesses:', error)
        return []
    }

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
            price: s.price
        }))
    }))
}

export async function getBusinessClients(businessId: string) {
    const supabase = await createClient()

    // Fetch unique customers from bookings
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
            customer_id,
            start_time,
            profiles:customer_id (full_name, phone_number, email)
        `)
        .eq('business_id', businessId)
        .order('start_time', { ascending: false })

    if (error) {
        console.error('Error fetching clients:', error)
        return []
    }

    // Process bookings to get unique clients and stats
    const clientsMap = new Map()

    bookings.forEach((b: any) => {
        if (!b.profiles) return

        const clientId = b.customer_id
        if (!clientsMap.has(clientId)) {
            clientsMap.set(clientId, {
                id: clientId,
                name: b.profiles.full_name || 'Unknown',
                phone: b.profiles.phone_number || '',
                email: b.profiles.email || '',
                visits: 0,
                lastVisit: b.start_time
            })
        }

        const client = clientsMap.get(clientId)
        client.visits += 1
        // Keep the most recent visit (bookings are ordered desc)
        if (new Date(b.start_time) > new Date(client.lastVisit)) {
            client.lastVisit = b.start_time
        }
    })

    return Array.from(clientsMap.values()).map(c => ({
        ...c,
        lastVisit: new Date(c.lastVisit).toLocaleDateString()
    }))
}

export async function getBusinessBarterOffers(businessId: string) {
    const supabase = await createClient()

    const { data: offers, error } = await supabase
        .from('barter_offers')
        .select(`
            *,
            barter_applications (count)
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching barter offers:', error)
        return []
    }

    return offers.map((o: any) => ({
        id: o.id,
        serviceName: o.service_name,
        description: o.description,
        value: o.value,
        minFollowers: o.min_followers,
        platform: o.platform,
        applicants: o.barter_applications?.[0]?.count || 0,
        status: o.status,
        audienceType: o.audience_type,
        categoryTags: o.category_tags || [],
        maxApplications: o.max_applications,
        expiresAt: o.expires_at
    }))
}

export async function createBarterOffer(businessId: string, offer: any) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('barter_offers')
        .insert({
            business_id: businessId,
            service_name: offer.serviceName,
            description: offer.description,
            value: offer.value,
            min_followers: offer.minFollowers,
            platform: offer.platform,
            audience_type: offer.audienceType,
            category_tags: offer.categoryTags,
            max_applications: offer.maxApplications,
            expires_at: offer.expiresAt
        })

    if (error) {
        console.error('Error creating barter offer:', error)
        throw error
    }
}

export async function getInfluencerApplications() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: applications, error } = await supabase
        .from('barter_applications')
        .select(`
            *,
            barter_offers (service_name, business_id, businesses (name))
        `)
        .eq('influencer_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching applications:', error)
        return []
    }

    return applications.map((app: any) => ({
        id: app.id,
        serviceName: app.barter_offers?.service_name || 'Unknown Service',
        businessName: app.barter_offers?.businesses?.name || 'Unknown Business',
        status: app.status,
        submittedAt: new Date(app.created_at).toLocaleDateString(),
        videoUrl: app.review_video_url
    }))
}

export async function submitContent(applicationId: string, contentUrl: string, platform: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // 1. Get application details
    const { data: application } = await supabase
        .from('barter_applications')
        .select('*, barter_offers(business_id)')
        .eq('id', applicationId)
        .single()

    if (!application) throw new Error('Application not found')

    // 2. Create content submission
    const { error } = await supabase
        .from('content_submissions')
        .insert({
            application_id: applicationId,
            influencer_id: user.id,
            business_id: application.barter_offers.business_id,
            content_url: contentUrl,
            platform: platform,
            status: 'submitted',
            submitted_at: new Date().toISOString()
        })

    if (error) {
        console.error('Error submitting content:', error)
        throw error
    }
}

export async function getOperatingHours(businessId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('business_operating_hours')
        .select('*')
        .eq('business_id', businessId)
        .order('day_of_week')

    if (error) {
        console.error('Error fetching operating hours:', error)
        return []
    }
    return data
}

export async function updateOperatingHours(businessId: string, dayOfWeek: number, openTime: string, closeTime: string, isClosed: boolean) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('business_operating_hours')
        .upsert({
            business_id: businessId,
            day_of_week: dayOfWeek,
            open_time: openTime,
            close_time: closeTime,
            is_closed: isClosed
        }, { onConflict: 'business_id, day_of_week' })

    if (error) {
        console.error('Error updating operating hours:', error)
        throw error
    }
}

export async function getBlockedTimes(businessId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('business_blocked_time')
        .select('*')
        .eq('business_id', businessId)
        .gte('end_time', new Date().toISOString())
        .order('start_time')

    if (error) {
        console.error('Error fetching blocked times:', error)
        return []
    }
    return data
}

export async function addBlockedTime(businessId: string, startTime: Date, endTime: Date, reason: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('business_blocked_time')
        .insert({
            business_id: businessId,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            reason
        })
        .select()
        .single()

    if (error) {
        console.error('Error adding blocked time:', error)
        throw error
    }
    return data
}

export async function deleteBlockedTime(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('business_blocked_time')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting blocked time:', error)
        throw error
    }
    if (error) throw error
}

export async function getMyBusiness() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 1. Try as Owner
    let { data } = await supabase
        .from('businesses')
        .select('*, services(*, service_resources(resource_id))')
        .eq('owner_id', user.id)
        .single()

    // 2. If not owner, try as Staff
    if (!data) {
        const { data: staffData } = await supabase
            .from('staff')
            .select('business_id')
            .eq('profile_id', user.id)
            .single()

        if (staffData) {
            const { data: businessData } = await supabase
                .from('businesses')
                .select('*, services(*, service_resources(resource_id))')
                .eq('id', staffData.business_id)
                .single()
            data = businessData
        }
    }

    if (data && data.services) {
        data.services = data.services.map((service: any) => ({
            ...service,
            resourceIds: service.service_resources?.map((sr: any) => sr.resource_id) || []
        }))
    }

    return data
}

export async function addService(businessId: string, service: any) {
    const supabase = await createClient()
    const { resourceIds, duration, ...serviceData } = service

    const dbService = {
        ...serviceData,
        duration_minutes: duration,
        business_id: businessId
    }

    const { data, error } = await supabase
        .from('services')
        .insert(dbService)
        .select()
        .single()

    if (error) {
        console.error('Error adding service:', error)
        throw error
    }

    if (resourceIds && resourceIds.length > 0) {
        const resourceLinks = resourceIds.map((rId: string) => ({
            service_id: data.id,
            resource_id: rId
        }))

        const { error: linkError } = await supabase
            .from('service_resources')
            .insert(resourceLinks)

        if (linkError) throw linkError
    }

    // Return with duration property to match frontend type
    return { ...data, duration: data.duration_minutes }
}

export async function updateService(id: string, updates: any) {
    const supabase = await createClient()
    const { resourceIds, duration, ...serviceUpdates } = updates

    const dbUpdates: any = { ...serviceUpdates }
    if (duration !== undefined) {
        dbUpdates.duration_minutes = duration
    }

    const { error } = await supabase
        .from('services')
        .update(dbUpdates)
        .eq('id', id)

    if (error) throw error

    if (resourceIds) {
        // Delete existing links
        await supabase
            .from('service_resources')
            .delete()
            .eq('service_id', id)

        // Add new links
        if (resourceIds.length > 0) {
            const resourceLinks = resourceIds.map((rId: string) => ({
                service_id: id,
                resource_id: rId
            }))

            const { error: linkError } = await supabase
                .from('service_resources')
                .insert(resourceLinks)

            if (linkError) throw linkError
        }
    }
}

export async function deleteService(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function addBusinessResource(businessId: string, name: string, type: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('business_resources')
        .insert({ business_id: businessId, name, type })

    if (error) throw error
}

export async function deleteBusinessResource(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('business_resources')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function addBusinessStaff(businessId: string, name: string, specialties: string[]) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('staff')
        .insert({ business_id: businessId, name, specialties })

    if (error) {
        console.error('Error adding staff:', error)
        throw error
    }
}

export async function deleteBusinessStaff(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function updateBusinessRevenueGoal(businessId: string, goal: number) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('businesses')
        .update({ monthly_revenue_goal: goal })
        .eq('id', businessId)

    if (error) throw error
}

export async function toggleBusinessFlashSale(businessId: string, active: boolean, durationHours: number = 3) {
    const supabase = await createClient()
    const endsAt = active ? new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString() : null

    const { error } = await supabase
        .from('businesses')
        .update({
            flash_sale_active: active,
            flash_sale_ends_at: endsAt
        })
        .eq('id', businessId)

    if (error) {
        console.error('Error toggling flash sale:', error)
        throw error
    }
}
