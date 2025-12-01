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

async function checkProfile() {
    console.log('Checking profile for owner...')

    // Get user by email (using admin api to find the ID)
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) {
        console.error('Error listing users:', userError)
        return
    }

    console.log(`Found ${users.length} users:`)
    users.forEach(u => console.log(`- ${u.email} (${u.id})`))

    const ownerUser = users.find(u => u.email?.includes('8095550002'))

    if (!ownerUser) {
        console.error('Owner user not found in Auth!')
        return
    }

    console.log('Auth User Found:', ownerUser.id, ownerUser.email)

    // Check profile table
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', ownerUser.id)
        .single()

    if (profileError) {
        console.error('Error fetching profile:', profileError)
    } else {
        console.log('Profile Found:', profile)
    }
}

checkProfile().catch(console.error)
