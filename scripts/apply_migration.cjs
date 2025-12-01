const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

async function main() {
    let dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.log('DATABASE_URL not found, trying default local Supabase URL...');
        dbUrl = 'postgresql://postgres:postgres@localhost:54322/postgres';
    }

    const client = new Client({
        connectionString: dbUrl,
    });

    try {
        await client.connect();
        const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/20231125000000_availability.sql');
        const sql = fs.readFileSync(migrationPath, 'utf-8');

        console.log('Applying migration...');
        await client.query(sql);
        console.log('Migration applied successfully!');
    } catch (err) {
        console.error('Error applying migration:', err);
    } finally {
        await client.end();
    }
}

main();
