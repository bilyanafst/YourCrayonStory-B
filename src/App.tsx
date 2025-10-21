import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route,  useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import Footer from "./components/Footer"


const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })))
const Register = lazy(() => import('./pages/auth/Register').then(m => ({ default: m.Register })))
const Profile = lazy(() => import('./pages/auth/Profile').then(m => ({ default: m.Profile })))
const StoryPersonalization = lazy(() => import('./pages/StoryPersonalization').then(m => ({ default: m.StoryPersonalization })))
const ThankYou = lazy(() => import('./pages/ThankYou').then(m => ({ default: m.ThankYou })))
const Checkout = lazy(() => import('./pages/Checkout'))
const MyStories = lazy(() => import('./pages/MyStories').then(m => ({ default: m.MyStories })))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const NewTemplate = lazy(() => import('./pages/admin/NewTemplate').then(m => ({ default: m.NewTemplate })))
const EditTemplate = lazy(() => import('./pages/admin/EditTemplate').then(m => ({ default: m.EditTemplate })))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AuthRedirectHandler />
          <Toaster position="top-right" />
          <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/story/:slug" element={<StoryPersonalization />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route
              path="/auth/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-stories"
              element={
                <ProtectedRoute>
                  <MyStories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/new-template"
              element={
                <AdminRoute>
                  <NewTemplate />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/edit-template/:slug"
              element={
                <AdminRoute>
                  <EditTemplate />
                </AdminRoute>
              }
            />
          </Routes>
        </Suspense>
        <Footer />
      </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App