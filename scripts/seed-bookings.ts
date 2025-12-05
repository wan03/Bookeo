import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load env vars from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase Environment Variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedBookings() {
    console.log('📅 Seeding Bookings...')

    // 1. Get Test User and Business
    const { data: consumer } = await supabase.from('profiles').select('id').eq('email', '8095550001@phone.bookeo.com').single()
    const { data: owner } = await supabase.from('profiles').select('id').eq('email', '8095550002@phone.bookeo.com').single()

    if (!consumer || !owner) {
        console.error('❌ Test users not found. Run create-test-users.ts first.')
        return
    }
    console.log('Found Owner ID:', owner.id)

    const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', owner.id).single()

    if (!business) {
        console.error('❌ Test business not found.')
        return
    }
    console.log('Found Business:', business.id)

    const { data: services } = await supabase.from('services').select('id, name, price').eq('business_id', business.id)
    console.log('Found Services:', services)

    const service = services?.[0]

    if (!service) {
        console.error('❌ Test service not found.')
        return
    }

    // 2. Create Bookings
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    const bookings = [
        {
            business_id: business.id,
            customer_id: consumer.id,
            service_id: service.id,
            start_time: tomorrow.toISOString(),
            end_time: new Date(tomorrow.getTime() + 30 * 60000).toISOString(), // 30 mins later
            status: 'pending',
            price: service.price,
            payment_status: 'unpaid'
        },
        {
            business_id: business.id,
            customer_id: consumer.id,
            service_id: service.id,
            start_time: new Date(tomorrow.getTime() + 60 * 60000).toISOString(), // 1 hour later
            end_time: new Date(tomorrow.getTime() + 90 * 60000).toISOString(),
            status: 'confirmed',
            price: service.price,
            payment_status: 'paid'
        },
        {
            business_id: business.id,
            customer_id: consumer.id,
            service_id: service.id,
            start_time: new Date(tomorrow.getTime() + 120 * 60000).toISOString(), // 2 hours later
            end_time: new Date(tomorrow.getTime() + 150 * 60000).toISOString(),
            status: 'cancelled',
            price: service.price,
            payment_status: 'paid' // Assuming refunded or paid before cancel
        }
    ]

    for (const booking of bookings) {
        // Check overlap to avoid duplicates if running multiple times
        const { data: existing } = await supabase
            .from('bookings')
            .select('id')
            .eq('business_id', booking.business_id)
            .eq('start_time', booking.start_time)
            .single()

        if (!existing) {
            const { error } = await supabase.from('bookings').insert(booking)
            if (error) console.error(`❌ Error creating booking: ${error.message}`)
            else console.log(`✅ Created ${booking.status} booking`)
        } else {
            console.log(`ℹ️ Booking at ${booking.start_time} already exists`)
        }
    }
}

seedBookings().catch(console.error)
