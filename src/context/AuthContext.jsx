import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// --- Context Pattern -------------------------------------------------------
// Centraliza el estado de autenticación (usuario, sesión, estado de carga)
// para que cualquier componente del árbol pueda leerlo sin pasar props
// manualmente por cada nivel ("prop drilling"). Se resuelve aquí una sola
// vez y se consume mediante el hook useAuth().
// -----------------------------------------------------------------------

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // 1. Recupera la sesión activa (si existe) al cargar la aplicación.
    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session)
        setLoading(false)
      }
    })

    // 2. Se suscribe a cambios de sesión (login, logout, refresh de token).
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(false)
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user: session?.user ?? null,
    isAuthenticated: Boolean(session),
    loading,
    signIn,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook de conveniencia para consumir el contexto con un error claro
// si se usa fuera del proveedor.
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>')
  }
  return context
}
