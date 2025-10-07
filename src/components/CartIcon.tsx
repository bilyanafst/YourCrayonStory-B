import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { CartDropdown } from './CartDropdown'
import { useAuth } from '../contexts/AuthContext'

export function CartIcon() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getItemCount } = useCart()
  const itemCount = getItemCount()
  const [showDropdown, setShowDropdown] = useState(false)
  const hideTimeoutRef = useRef<number | null>(null)

  const handleCartClick = () => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', '/checkout')
    }
    navigate('/checkout')
  }

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    setShowDropdown(true)
  }

  const handleMouseLeave = () => {
    hideTimeoutRef.current = window.setTimeout(() => {
      setShowDropdown(false)
    }, 200)
  }

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [])

  if (itemCount === 0) return null

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleCartClick}
        className="relative p-1 hover:bg-gray-100 rounded-lg transition-colors"
        title="View Cart"
      >
        <ShoppingCart className="h-5 w-5 text-gray-600" />
        <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {itemCount}
        </span>
      </button>

      <CartDropdown
        isVisible={showDropdown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClose={() => setShowDropdown(false)}
      />
    </div>
  )
}