import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}
