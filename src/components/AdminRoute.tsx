import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading, isAdmin } = useAuth()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    if (!loading) {
      setHasChecked(true)
      if (!user) {
        toast.error('Please log in to access this page')
      } else if (!isAdmin) {
        toast.error('Access denied')
      }
    }
  }, [loading, user, isAdmin])

  if (loading || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
