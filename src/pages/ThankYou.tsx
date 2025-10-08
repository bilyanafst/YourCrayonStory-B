import React, { useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { CheckCircle, Home, Mail, Gift } from 'lucide-react'
import { useCart } from '../hooks/useCart'

export function ThankYou() {
  const navigate = useNavigate()
  const location = useLocation()
  const { clearCart } = useCart()
  const childName = location.state?.childName
  const isGift = location.state?.isGift

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {isGift ? 'Gift Purchased Successfully!' : childName ? `Thanks, ${childName}!` : 'Thank You!'}
          </h1>

          {isGift ? (
            <>
              <p className="text-gray-600 mb-6">
                Your gift has been prepared and will be sent to the recipient! They'll receive a beautiful personalized story with your special message.
              </p>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3 text-pink-800">
                  <Gift className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-left">
                    <p className="font-medium mb-1">What happens next?</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Your gift will be sent on the scheduled date</li>
                      <li>The recipient will receive an email with the personalized story</li>
                      <li>You'll get a confirmation when the gift is delivered</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Your story will arrive in your inbox shortly. Get ready for an amazing coloring adventure!
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 text-green-800">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Check your email for your personalized coloring books
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Continue Shopping</span>
            </button>

            <Link
              to="/auth/profile"
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <span>View My Orders</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}