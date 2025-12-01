import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')

const getEnv = (key: string) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`))
    return match ? match[1] : ''
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    const { data: businesses, error } = await supabase
        .from('businesses')
        .select('id, name')

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('Businesses:', JSON.stringify(businesses, null, 2))
}

main()
