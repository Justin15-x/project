import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../src/components/ProtectedRoute/ProtectedRoute'

const mockUseAuth = vi.fn()

vi.mock('../src/context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth()
}))

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<div>Página de login</div>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Contenido protegido</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('redirige a /login cuando no hay usuario autenticado', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: false })

    renderProtected()

    expect(screen.getByText('Página de login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('muestra el contenido protegido cuando el usuario está autenticado', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, loading: false })

    renderProtected()

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  it('muestra un estado de carga mientras se resuelve la sesión', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: true })

    renderProtected()

    expect(screen.getByText(/cargando sesión/i)).toBeInTheDocument()
  })
})
