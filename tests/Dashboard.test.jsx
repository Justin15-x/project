import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Dashboard from '../src/pages/Dashboard/Dashboard'

// Mock del usuario autenticado (Context Pattern) sin depender de Supabase real.
vi.mock('../src/context/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: { email: 'estudiante@escuela.edu' },
    isAuthenticated: true
  })
}))

// Mock del Repository Pattern: simula datos ya obtenidos de dashboard_data.
vi.mock('../src/services/dashboardRepository.js', () => ({
  getDashboardItems: vi.fn().mockResolvedValue({
    data: [
      {
        id: 1,
        title: 'Bienvenida',
        description: 'Registro de ejemplo desde Supabase',
        created_at: '2026-01-01T00:00:00.000Z'
      }
    ],
    error: null
  })
}))

describe('Dashboard', () => {
  it('muestra el correo del usuario autenticado y el estado de sesión', async () => {
    render(<Dashboard />)

    expect(await screen.findByText(/estudiante@escuela.edu/i)).toBeInTheDocument()
    expect(screen.getByText('Autenticado')).toBeInTheDocument()
  })

  it('muestra los registros obtenidos desde dashboard_data', async () => {
    render(<Dashboard />)

    expect(await screen.findByText('Bienvenida')).toBeInTheDocument()
    expect(screen.getByText('Registro de ejemplo desde Supabase')).toBeInTheDocument()
  })
})
