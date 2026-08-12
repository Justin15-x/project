import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // No exponemos valores, solo advertimos en consola para facilitar el debug local.
  console.error(
    'Faltan variables de entorno de Supabase. Verifica tu archivo .env (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY).'
  )
}

// Cliente único de Supabase para toda la aplicación.
// Utiliza exclusivamente la clave pública "anon". Nunca la service role key.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
