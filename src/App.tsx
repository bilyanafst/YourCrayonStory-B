import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/Home'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { Profile } from './pages/auth/Profile'
import { StoryPersonalization } from './pages/StoryPersonalization'
import { ThankYou } from './pages/ThankYou'

const Checkout = lazy(() => import('./pages/Checkout'))

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
      <div className="flex items-center space-x-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-gray-600">Loading...</span>
      </div>
    </div>
  )
}

function AuthRedirectHandler() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      const redirectPath = localStorage.getItem('redirectAfterLogin')
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin')
        navigate(redirectPath, { replace: true })
      }
    }
  }, [user, loading, navigate])

  return null
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthRedirectHandler />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/story/:slug" element={<StoryPersonalization />} />
          <Route path="/checkout" element={
            <Suspense fallback={<LoadingFallback />}>
              <Checkout />
            </Suspense>
          } />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route
            path="/auth/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App