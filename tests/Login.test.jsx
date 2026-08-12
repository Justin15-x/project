import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../src/pages/Login/Login'

// Mock del AuthContext: aislamos el componente Login de Supabase real.
vi.mock('../src/context/AuthContext.jsx', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    loading: false,
    signIn: vi.fn().mockResolvedValue(undefined)
  })
}))

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

describe('Login', () => {
  it('muestra el formulario de inicio de sesión con sus campos principales', () => {
    renderLogin()

    expect(screen.getByRole('heading', { name: /inicia sesión/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('muestra un error de validación si se envía el formulario vacío', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/correo electrónico es obligatorio/i)
  })

  it('muestra un error de validación si el correo no tiene formato válido', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/correo electrónico/i), 'correo-invalido')
    await user.type(screen.getByLabelText(/contraseña/i), '123456')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/correo electrónico válido/i)
  })
})
