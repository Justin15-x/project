import { supabase } from '../lib/supabase'

// --- Repository Pattern -----------------------------------------------
// Centraliza todas las consultas relacionadas con la tabla "dashboard_data"
// en un único módulo. Si mañana cambia el origen de los datos (otra tabla,
// otra vista, un cache), solo se modifica este archivo: los componentes de
// UI nunca llaman a Supabase directamente.
// ------------------------------------------------------------------------

const TABLE_NAME = 'dashboard_data'

/**
 * Obtiene los registros de la tabla dashboard_data ordenados por fecha
 * de creación descendente.
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function getDashboardItems() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('id, title, description, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    // No se expone el error crudo de Postgres al usuario final.
    console.error('Error al obtener dashboard_data:', error.message)
    return { data: [], error }
  }

  return { data: data ?? [], error: null }
}
