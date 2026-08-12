import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth()

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <span className="navbar__logo" aria-hidden="true">◆</span>
        <span>Dental Dashboard</span>
      </div>

      {isAuthenticated && (
        <div className="navbar__actions">
          <span className="navbar__user">{user?.email}</span>
          <button type="button" className="btn btn--ghost" onClick={signOut}>
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  )
}
