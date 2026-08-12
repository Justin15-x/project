import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getDashboardItems } from '../../services/dashboardRepository'

const today = new Date().toLocaleDateString('es-MX', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth()
  const [items, setItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      const { data, error } = await getDashboardItems()
      if (!isMounted) return

      if (error) {
        setFetchError('No se pudo cargar la información desde Supabase.')
      } else {
        setItems(data)
      }
      setLoadingItems(false)
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="dashboard">
      <section className="card card--summary">
        <div className="card__eyebrow">Sesión activa</div>
        <h1>Bienvenido{user?.email ? `, ${user.email}` : ''}</h1>

        <dl className="summary-grid">
          <div>
            <dt>Estado de sesión</dt>
            <dd>{isAuthenticated ? 'Autenticado' : 'No autenticado'}</dd>
          </div>
          <div>
            <dt>Fecha actual</dt>
            <dd className="capitalize">{today}</dd>
          </div>
          <div>
            <dt>Proveedor de autenticación</dt>
            <dd>Supabase Auth</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <div className="card__eyebrow">Datos de Supabase</div>
        <h2>Resumen de dashboard_data</h2>

        {loadingItems && <p>Cargando información...</p>}
        {fetchError && (
          <p className="form-error" role="alert">
            {fetchError}
          </p>
        )}

        {!loadingItems && !fetchError && items.length === 0 && (
          <p>No hay registros disponibles todavía. Inserta datos en la tabla dashboard_data.</p>
        )}

        {!loadingItems && items.length > 0 && (
          <ul className="data-list">
            {items.map((item) => (
              <li key={item.id} className="data-list__item">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <time dateTime={item.created_at}>
                  {new Date(item.created_at).toLocaleDateString('es-MX')}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
