import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return null
  }

  // If user is logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  // If not logged in, show the public page
  return children
}

export default PublicRoute
