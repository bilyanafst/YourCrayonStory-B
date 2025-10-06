import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../hooks/useCart'

export function CartIcon() {
  const navigate = useNavigate()
  const { getItemCount } = useCart()
  const itemCount = getItemCount()

  const handleCartClick = () => {
    navigate('/checkout')
  }

  if (itemCount === 0) return null

  return (
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
  )
}