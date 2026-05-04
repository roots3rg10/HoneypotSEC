import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, token, ready } = useAuth()

  if (!ready) return null

  if (!token || !user) return <Navigate to="/login" replace />

  if (requiredRole && user.role !== requiredRole) return <Navigate to="/dashboard" replace />

  return children
}
