import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase Environment Variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('Supabase URL:', supabaseUrl)

const TEST_EMAILS = [
    'consumer@test.com',
    'owner@test.com',
    'staff@test.com',
    'influencer@test.com',
    'admin@test.com'
]

async function deleteTestUsers() {
    console.log('🗑️  Deleting old test users...')

    const { data: { users } } = await supabase.auth.admin.listUsers()

    for (const email of TEST_EMAILS) {
        const user = users.find(u => u.email === email)
        if (user) {
            await supabase.auth.admin.deleteUser(user.id)
            console.log(`   ✅ Deleted ${email}`)
        }
    }

    console.log('✨ Cleanup complete!')
}

deleteTestUsers().catch(console.error)
