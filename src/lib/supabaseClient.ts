import { createClient } from '@supabase/supabase-js';

// 1. Obtenemos las credenciales de las variables de entorno
// Usamos "NEXT_PUBLIC_" para que estén disponibles en el navegador (Cliente)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 2. Validación de seguridad (Best Practice)
// Esto evita que la app arranque si faltan las llaves, ahorrándote horas de debug
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Advertencia: Faltan variables de entorno de Supabase (URL/Key). La app no podrá conectar con la base de datos.');
}

// 3. Exportamos la instancia lista para usar
export const supabase = createClient(supabaseUrl, supabaseAnonKey);