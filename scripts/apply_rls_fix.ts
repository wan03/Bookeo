import { Client } from 'pg'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function main() {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
        console.error('DATABASE_URL not found in .env.local')
        process.exit(1)
    }

    const client = new Client({
        connectionString: dbUrl,
    })

    try {
        await client.connect()
        const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/20231126000000_fix_profiles_rls.sql')
        const sql = fs.readFileSync(migrationPath, 'utf-8')

        console.log('Applying migration...')
        await client.query(sql)
        console.log('Migration applied successfully!')
    } catch (err) {
        console.error('Error applying migration:', err)
    } finally {
        await client.end()
    }
}

main()
