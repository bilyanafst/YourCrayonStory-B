import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../hooks/useCart'

export function CartIcon() {
  const { getItemCount } = useCart()
  const itemCount = getItemCount()

  if (itemCount === 0) return null

  return (
    <div className="relative">
      <ShoppingCart className="h-5 w-5 text-gray-600" />
      <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
        {itemCount}
      </span>
    </div>
  )
}