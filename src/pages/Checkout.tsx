import React, { useEffect, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Loader2, Trash2 } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export function Checkout() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { cartItems, removeFromCart, getTotalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [deliveryEmail, setDeliveryEmail] = useState('')

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/auth/login" state={{ from: { pathname: '/checkout' } }} replace />
  }

  // Show loading while checking auth
  if (authLoading) {
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
    if (cartItems.length === 0) {
      navigate('/')
    }
    // Prefill with user's email
    if (user?.email) {
      setDeliveryEmail(user.email)
    }
  }, [cartItems.length, navigate, user?.email])

  const handleStripeCheckout = async () => {
    setLoading(true)
    
    try {
      if (!user) {
        throw new Error('User not authenticated')
      }

      if (!deliveryEmail.trim()) {
        throw new Error('Delivery email is required')
      }

      // Create Stripe checkout session
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          userId: user.id,
          deliveryEmail: deliveryEmail.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>
          
          {/* Delivery Email Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Delivery Information</h3>
            <div>
              <label htmlFor="deliveryEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email for PDF delivery
              </label>
              <input
                id="deliveryEmail"
                type="email"
                value={deliveryEmail}
                onChange={(e) => setDeliveryEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter email address"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Your personalized coloring books will be sent to this email address
              </p>
            </div>
          </div>

          {/* Cart Items */}
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

          {/* Total */}
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-indigo-600">
                €{getTotalPrice().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleStripeCheckout}
            disabled={loading || !deliveryEmail.trim()}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Proceed to Payment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}