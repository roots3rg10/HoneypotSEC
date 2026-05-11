import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, token, ready } = useAuth()

  if (!ready) return null
  if (!token || !user) return <Navigate to="/login" replace />

  // Cliente intentando acceder a rutas de admin/employee
  if (user.role === 'client' && requiredRole !== 'client') {
    return <Navigate to="/client/dashboard" replace />
  }

  // Admin/employee intentando acceder a rutas de cliente
  if (user.role !== 'client' && requiredRole === 'client') {
    return <Navigate to="/dashboard" replace />
  }

  if (requiredRole && user.role !== requiredRole && requiredRole !== 'client') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
