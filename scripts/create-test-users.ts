import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load env vars from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase Environment Variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const TEST_USERS = [
    {
        email: '8095550001@phone.bookeo.com',
        password: 'password123',
        phone: '8095550001',
        name: 'Test Consumer',
        role: 'consumer'
    },
    {
        email: '8095550002@phone.bookeo.com',
        password: 'password123',
        phone: '8095550002',
        name: 'Test Owner',
        role: 'business_owner'
    },
    {
        email: '8095550003@phone.bookeo.com',
        password: 'password123',
        phone: '8095550003',
        name: 'Test Staff',
        role: 'staff'
    },
    {
        email: '8095550004@phone.bookeo.com',
        password: 'password123',
        phone: '8095550004',
        name: 'Test Influencer',
        role: 'influencer'
    },
    {
        email: '8095550005@phone.bookeo.com',
        password: 'password123',
        phone: '8095550005',
        name: 'Test Admin',
        role: 'admin'
    }
]

async function createTestUsers() {
    console.log('🚀 Creating Test Users...')

    const results = []

    for (const user of TEST_USERS) {
        console.log(`Processing ${user.role}: ${user.email}`)

        let userId = null;
        let authError = null;

        // Try to create user first
        const { data: authDataCreate, error: createError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
                full_name: user.name,
                phone_number: user.phone,
                role: user.role
            }
        })

        userId = authDataCreate.user?.id

        if (createError) {
            console.warn(`⚠️ Auth user creation failed for ${user.email}: ${createError.message}`)
            // Try to find if user exists
            const { data: { users } } = await supabase.auth.admin.listUsers()
            const existing = users.find(u => u.email === user.email)
            if (existing) {
                console.log(`   Found existing user ID: ${existing.id}`)
                userId = existing.id

                // Update metadata if needed
                await supabase.auth.admin.updateUserById(userId, {
                    user_metadata: {
                        full_name: user.name,
                        phone_number: user.phone,
                        role: user.role
                    }
                })
            } else {
                console.error(`   Could not find or create user ${user.email}`)
                continue
            }
        }

        if (userId) {
            // 2. Upsert Profile
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: userId,
                email: user.email,
                full_name: user.name,
                phone_number: user.phone,
                role: user.role
            })

            if (profileError) {
                console.error(`   ❌ Profile update failed: ${profileError.message}`)
            } else {
                console.log(`   ✅ Profile updated for ${user.role}`)
                results.push(user)

                // 3. Create Business for Owner
                if (user.role === 'business_owner') {
                    console.log('   🏢 Creating Business for Owner...')

                    // Check if business exists
                    const { data: existingBusiness } = await supabase
                        .from('businesses')
                        .select()
                        .eq('owner_id', userId)
                        .single()

                    let business = existingBusiness

                    if (!business) {
                        const { data: newBusiness, error: businessError } = await supabase
                            .from('businesses')
                            .insert({
                                owner_id: userId,
                                name: 'Test Barbershop',
                                slug: 'test-barbershop',
                                description: 'Best cuts in town',
                                address: '123 Test St',
                                category: 'barber'
                            })
                            .select()
                            .single()

                        if (businessError) {
                            console.error(`   ❌ Business creation failed: ${businessError.message}`)
                        } else {
                            business = newBusiness
                        }
                    }

                    if (business) {
                        console.log(`   ✅ Business ready: ${business.name}`)

                        // 4. Create Service
                        // Check if service exists
                        const { data: existingService } = await supabase
                            .from('services')
                            .select()
                            .eq('business_id', business.id)
                            .eq('name', 'Test Haircut')
                            .single()

                        if (!existingService) {
                            const { error: serviceError } = await supabase
                                .from('services')
                                .insert({
                                    business_id: business.id,
                                    name: 'Test Haircut',
                                    price: 500,
                                    duration_minutes: 30
                                })

                            if (serviceError) console.error(`   ❌ Service creation failed: ${serviceError.message}`)
                            else console.log('   ✅ Service created')
                        } else {
                            console.log('   ✅ Service already exists')
                        }

                        // 5. Create Resource
                        const { data: existingResource } = await supabase
                            .from('business_resources')
                            .select()
                            .eq('business_id', business.id)
                            .eq('name', 'Chair 1')
                            .single()

                        if (!existingResource) {
                            const { error: resourceError } = await supabase
                                .from('business_resources')
                                .insert({
                                    business_id: business.id,
                                    name: 'Chair 1',
                                    type: 'chair'
                                })

                            if (resourceError) console.error(`   ❌ Resource creation failed: ${resourceError.message}`)
                            else console.log('   ✅ Resource created')
                        } else {
                            console.log('   ✅ Resource already exists')
                        }
                    }
                }
            }
        }
    }

    // 6. Link Staff to Business & Create Video Review
    console.log('🔗 Linking Staff and Creating Content...')
    const { data: staffUser } = await supabase.from('profiles').select('id').eq('email', '8095550003@phone.bookeo.com').single()
    const { data: ownerUser } = await supabase.from('profiles').select('id').eq('email', '8095550002@phone.bookeo.com').single()
    const { data: consumerUser } = await supabase.from('profiles').select('id').eq('email', '8095550001@phone.bookeo.com').single()

    if (ownerUser) {
        const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', ownerUser.id).single()

        if (business) {
            // Link Staff
            if (staffUser) {
                const { data: existingStaff } = await supabase.from('staff').select().eq('profile_id', staffUser.id).eq('business_id', business.id).single()
                if (!existingStaff) {
                    const { error: staffError } = await supabase.from('staff').insert({
                        business_id: business.id,
                        profile_id: staffUser.id,
                        name: 'Test Staff',
                        specialties: ['Hair', 'Beard']
                    })
                    if (staffError) console.error(`   ❌ Staff linking failed: ${staffError.message}`)
                    else console.log('   ✅ Staff linked')
                } else {
                    console.log('   ✅ Staff already linked')
                }
            }

            // Create Video Review
            if (consumerUser) {
                const { data: existingReview } = await supabase.from('reviews').select().eq('business_id', business.id).eq('user_id', consumerUser.id).not('video_url', 'is', null).single()
                if (!existingReview) {
                    const { error: reviewError } = await supabase.from('reviews').insert({
                        business_id: business.id,
                        user_id: consumerUser.id,
                        rating: 5,
                        comment: 'Best cut ever!',
                        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                        is_verified_purchase: true
                    })
                    if (reviewError) console.error(`   ❌ Review creation failed: ${reviewError.message}`)
                    else console.log('   ✅ Video Review created')
                } else {
                    console.log('   ✅ Video Review already exists')
                }
            }
        }
    }

    // 7. Create Barter Offer
    console.log('🤝 Creating Barter Offer...')
    if (ownerUser) {
        const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', ownerUser.id).single()
        if (business) {
            const { data: existingOffer } = await supabase.from('barter_offers').select().eq('business_id', business.id).eq('service_name', 'Corte Gratis x Story').single()
            if (!existingOffer) {
                const { error: offerError } = await supabase.from('barter_offers').insert({
                    business_id: business.id,
                    service_name: 'Corte Gratis x Story',
                    description: 'Te regalamos un corte a cambio de una mención en tu story.',
                    value: 500,
                    min_followers: 1000,
                    platform: 'instagram',
                    tags: ['haircut', 'barber'],
                    status: 'active'
                })
                if (offerError) console.error(`   ❌ Barter offer creation failed: ${offerError.message}`)
                else console.log('   ✅ Barter offer created')
            } else {
                console.log('   ✅ Barter offer already exists')
            }

            // Add Business Operating Hours
            // Delete existing to ensure fresh start (including weekends)
            await supabase.from('business_operating_hours').delete().eq('business_id', business.id)

            const { error: hoursError } = await supabase.from('business_operating_hours').insert([
                { business_id: business.id, day_of_week: 1, open_time: '09:00', close_time: '18:00', is_closed: false },
                { business_id: business.id, day_of_week: 2, open_time: '09:00', close_time: '18:00', is_closed: false },
                { business_id: business.id, day_of_week: 3, open_time: '09:00', close_time: '18:00', is_closed: false },
                { business_id: business.id, day_of_week: 4, open_time: '09:00', close_time: '18:00', is_closed: false },
                { business_id: business.id, day_of_week: 5, open_time: '09:00', close_time: '18:00', is_closed: false },
                { business_id: business.id, day_of_week: 6, open_time: '10:00', close_time: '16:00', is_closed: false }, // Saturday
                { business_id: business.id, day_of_week: 0, open_time: '10:00', close_time: '14:00', is_closed: false }  // Sunday
            ])
            if (hoursError) console.error(`   ❌ Business operating hours creation failed: ${hoursError.message}`)
            else console.log('   ✅ Business operating hours created/updated')
        }
    }

    // Write to Artifacts
    const artifactPath = path.join(process.cwd(), 'TEST_USERS.md')
    let content = '# Test Users Credentials\n\n'
    content += '| Role | Name | Email | Phone | Password |\n'
    content += '|---|---|---|---|---|\n'

    results.forEach(u => {
        content += `| ${u.role} | ${u.name} | ${u.email} | ${u.phone} | ${u.password} |\n`
    })

    fs.writeFileSync(artifactPath, content)
    console.log(`\n📄 Credentials saved to ${artifactPath}`)
}

createTestUsers().catch(console.error)
