import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { signIn, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Si el usuario ya inició sesión y visita /login, se le redirige al Dashboard.
  if (!loading && isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={redirectTo} replace />
  }

  function validate() {
    if (!email.trim()) return 'El correo electrónico es obligatorio.'
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Ingresa un correo electrónico válido.'
    if (!password) return 'La contraseña es obligatoria.'
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.'
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    const validationError = validate()
    if (validationError) {
      setFormError(validationError)
      return
    }

    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      // Mensaje genérico: no revelamos si fue el correo o la contraseña
      // lo que falló, para no filtrar información sensible.
      setFormError('Credenciales inválidas. Verifica tu correo y contraseña.')
      console.error('Error de autenticación:', error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-center">
      <div className="card card--login">
        <div className="card__eyebrow">Acceso</div>
        <h1>Inicia sesión</h1>
        <p className="card__subtitle">Usa tu cuenta registrada en Supabase Auth.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>Correo electrónico</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              placeholder="usuario@correo.com"
            />
          </label>

          <label className="field">
            <span>Contraseña</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              placeholder="••••••••"
            />
          </label>

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
