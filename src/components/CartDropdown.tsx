import React from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ShoppingCart, CreditCard } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../contexts/AuthContext'

interface CartDropdownProps {
  isVisible: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClose: () => void
}

export function CartDropdown({ isVisible, onMouseEnter, onMouseLeave, onClose }: CartDropdownProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cartItems, removeFromCart, getTotalPrice } = useCart()

  const handleCheckout = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClose()

    setTimeout(() => {
      if (!user) {
        localStorage.setItem('redirectAfterLogin', '/checkout')
        navigate('/auth/login')
      } else {
        navigate('/checkout')
      }
    }, 0)
  }

  const handleRemoveItem = (index: number) => {
    removeFromCart(index)
  }

  if (!isVisible) return null

  return (
    <div
      className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Your Cart
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">Your cart is empty.</p>
            <p className="text-sm text-gray-400">Pick a story to begin! 📚</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  {item.coverImage && (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-600">
                      For: <span className="font-medium">{item.childName}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.gender === 'boy' ? '👦' : '👧'} {item.gender}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-indigo-600">
                      €{item.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                      title="Remove item"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Total:</span>
                <span className="text-lg font-bold text-indigo-600">
                  €{getTotalPrice().toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Go to Checkout</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}