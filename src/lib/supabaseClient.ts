import { createClient } from '@supabase/supabase-js';

// 1. Obtenemos las credenciales de las variables de entorno
// Usamos "NEXT_PUBLIC_" para que estén disponibles en el navegador (Cliente)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 2. Validación de seguridad (Best Practice)
// Esto evita que la app arranque si faltan las llaves, ahorrándote horas de debug
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Error Crítico: Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el archivo .env.local'
  );
}

// 3. Exportamos la instancia lista para usar
export const supabase = createClient(supabaseUrl, supabaseAnonKey);