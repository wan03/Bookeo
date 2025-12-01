import { createClient } from '@supabase/supabase-js'
import { MOCK_BUSINESSES, MOCK_VIDEOS, MOCK_OFFERS, MOCK_USER } from '../lib/mock-data'
import { randomUUID } from 'crypto'

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use Service Key for bypassing RLS

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase Environment Variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
    console.log('🌱 Starting Seed...')

    // 1. Create/Get User Profile
    console.log('Creating User Profile...')
    const userId = randomUUID() // In real app, this comes from Auth. For seed, we fake it or use existing if we could.
    // Note: Inserting into profiles usually requires an auth.user. 
    // For this seed, we might just insert into public.profiles if foreign key allows, 
    // OR we skip auth and just populate tables that don't strictly enforce auth FKs if we modified schema.
    // However, schema has `references auth.users`. 
    // To properly seed, we should ideally create a user in auth.users first, but that's complex via client.
    // WORKAROUND: We will assume the schema for profiles allows inserting if we disable triggers or if we just want data.
    // Actually, let's try to insert. If it fails due to FK, we might need to create a dummy auth user first using admin api.

    const { data: user, error: userError } = await supabase.auth.admin.createUser({
        email: MOCK_USER.email,
        password: 'password123',
        email_confirm: true,
        user_metadata: { full_name: MOCK_USER.name }
    })

    let profileId = user?.user?.id

    if (userError) {
        console.warn('User creation failed (might exist):', userError.message)
        // Try to find existing user by email
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) {
            console.error('Could not list users:', listError.message)
        } else {
            const existingUser = users.find(u => u.email === MOCK_USER.email)
            if (existingUser) {
                profileId = existingUser.id
                console.log('Found existing user ID:', profileId)
            }
        }
    }

    if (!profileId) {
        console.log('⚠️ Could not create auth user. Using random UUID for profile (might fail FK constraints).')
        profileId = randomUUID()
    }

    // Upsert Profile
    await supabase.from('profiles').upsert({
        id: profileId,
        email: MOCK_USER.email,
        full_name: MOCK_USER.name,
        phone_number: MOCK_USER.phone,
        avatar_url: MOCK_USER.avatarUrl,
        role: 'consumer'
    })

    // 2. Businesses
    console.log('Seeding Businesses...')
    const businessIdMap = new Map<string, string>()

    for (const [key, biz] of Object.entries(MOCK_BUSINESSES)) {
        const newId = randomUUID()
        businessIdMap.set(key, newId)

        const { error } = await supabase.from('businesses').insert({
            id: newId,
            owner_id: profileId, // Assign all to our mock user for easy testing
            name: biz.name,
            description: biz.description,
            address: biz.address,
            // coordinates: ... (skip for now or mock)
            category: 'barber', // Defaulting for simplicity, or map from mock if we had it
            is_verified: true,
            has_generator: true,
            image_url: biz.imageUrl,
            rating: biz.rating,
            review_count: biz.reviewCount
        })

        if (error) console.error(`Error inserting business ${biz.name}:`, error.message)

        // 3. Services
        if (biz.services) {
            const servicesData = biz.services.map(s => ({
                business_id: newId,
                name: s.name,
                description: s.description,
                price: s.price,
                duration_minutes: s.duration
            }))

            const { error: sError } = await supabase.from('services').insert(servicesData)
            if (sError) console.error(`Error inserting services for ${biz.name}:`, sError.message)
        }
    }

    // 4. Reviews (from Videos)
    console.log('Seeding Reviews/Videos...')
    for (const video of MOCK_VIDEOS) {
        const businessUUID = businessIdMap.get(String(video.businessId))
        if (!businessUUID) continue

        await supabase.from('reviews').insert({
            business_id: businessUUID,
            user_id: profileId,
            rating: video.rating,
            comment: video.description,
            video_url: video.videoUrl,
            is_verified_purchase: true
        })
    }

    // 5. Barter Offers
    console.log('Seeding Barter Offers...')
    for (const offer of MOCK_OFFERS) {
        // We need to find which business this offer belongs to. 
        // MOCK_OFFERS has businessName but not ID. We can try to match by name.
        // Or just skip linking strictly for now if we don't have the map.
        // Let's try to find the business UUID by name from our map.

        // Reverse lookup or just iterate
        let matchBizId = null
        for (const [oldId, newId] of businessIdMap.entries()) {
            if (MOCK_BUSINESSES[oldId].name === offer.businessName) {
                matchBizId = newId
                break
            }
        }

        if (matchBizId) {
            await supabase.from('barter_offers').insert({
                business_id: matchBizId,
                service_name: offer.serviceName,
                description: offer.description,
                image_url: offer.imageUrl,
                value: offer.value,
                min_followers: offer.minFollowers,
                platform: offer.platform,
                tags: offer.tags,
                status: 'active'
            })
        }
    }

    console.log('✅ Seed Complete!')
}

seed().catch(console.error)
