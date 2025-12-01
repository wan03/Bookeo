import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase Environment Variables')
    process.exit(1)
}

// Use the ANON key to simulate client-side login
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyLogin() {
    const email = '8095550002@phone.bookeo.com'
    const password = 'password123'

    console.log(`Attempting login for ${email}...`)

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        console.error('❌ Login failed:', error.message)
        return
    }

    console.log('✅ Login successful!')
    console.log('User ID:', data.user.id)

    // Check profile access (RLS test)
    console.log('Checking profile access...')
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

    if (profileError) {
        console.error('❌ Profile fetch failed:', profileError.message)
    } else {
        console.log('✅ Profile fetched:', profile)
    }
}

verifyLogin().catch(console.error)
