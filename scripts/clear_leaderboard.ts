
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearLeaderboard() {
    console.log('Clearing leaderboard...');

    // Delete all rows where id is greater than 0 (assuming id is int)
    // or simple delete without where usually requires a where clause in Suapbase for safety
    // We can use .neq('id', -1) or similar if 'id' exists.
    // Or just deleting everything.

    // Note: Supabase JS delete requires a filter.
    // We'll check the table structure or assume there's a primary key or column to filter.
    // We'll try to delete where created_at is not null, which should be everything.

    // Better approach: fetch all and delete by ID? No, that's slow.
    // Standard way: .delete().neq('id', 0) (if id is numeric > 0)

    const { error } = await supabase
        .from('leaderboard')
        .delete()
        .neq('score', -1); // Deletes everything (assuming scores >= 0)

    if (error) {
        console.error('Error clearing leaderboard:', error);
    } else {
        console.log('Leaderboard cleared successfully.');
    }
}

clearLeaderboard();
