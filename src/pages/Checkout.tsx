import React, { useEffect, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../contexts/AuthContext'
import { CheckoutForm } from '../components/CheckoutForm'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

export function Checkout() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { cartItems, removeFromCart, getTotalPrice } = useCart()
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [billingEmail, setBillingEmail] = useState('')
  const [billingName, setBillingName] = useState('')
  const [cartLoaded, setCartLoaded] = useState(false)

  useEffect(() => {
    const checkCart = setTimeout(() => {
      setCartLoaded(true)
      if (cartItems.length === 0) {
        navigate('/')
      }
    }, 100)
    return () => clearTimeout(checkCart)
  }, [cartItems.length, navigate])

  useEffect(() => {
    if (user?.email) {
      setBillingEmail(user.email)
    }
    if (user?.user_metadata?.full_name) {
      setBillingName(user.user_metadata.full_name)
    }
  }, [user])

  if (!authLoading && !user) {
    return <Navigate to="/auth/login" state={{ from: { pathname: '/checkout' } }} replace />
  }

  if (authLoading || !cartLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (user && cartItems.length > 0 && !clientSecret) {
      createPaymentIntent()
    }
  }, [user, cartItems, clientSecret])

  const createPaymentIntent = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          userId: user?.id,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { clientSecret } = await response.json()
      setClientSecret(clientSecret)
    } catch (error) {
      console.error('Payment intent error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return null
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#4f46e5',
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Continue Shopping</span>
            </button>
            <div className="flex items-center space-x-3">
              <img
                src="/YourCrayonStory.png"
                alt="Your Crayon Story"
                className="h-8 w-8"
              />
              <span className="font-bold text-gray-900">Your Crayon Story</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  {item.coverImage && (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600">
                      For: <strong>{item.childName}</strong> ({item.gender})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">€{item.price.toFixed(2)}</p>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-red-500 hover:text-red-700 transition-colors mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-indigo-600">
                  €{getTotalPrice().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing & Payment</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="billingName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="billingName"
                  type="text"
                  value={billingName}
                  onChange={(e) => setBillingName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="billingEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email for PDF delivery
                </label>
                <input
                  id="billingEmail"
                  type="email"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter email address"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your personalized coloring books will be sent to this email
                </p>
              </div>
            </div>

            {loading || !clientSecret ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                <CheckoutForm
                  billingEmail={billingEmail}
                  billingName={billingName}
                  cartItems={cartItems}
                  totalAmount={getTotalPrice()}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
