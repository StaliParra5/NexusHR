import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Variables de entorno de Supabase no definidas. La conexión fallará.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
