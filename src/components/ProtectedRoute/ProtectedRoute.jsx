import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Protege rutas privadas: si no hay sesión activa, redirige a /login.
// Mientras se resuelve la sesión inicial, muestra un estado de carga simple
// para evitar un "parpadeo" hacia /login antes de confirmar el estado real.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="page-center" role="status" aria-live="polite">
        <p>Cargando sesión...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
