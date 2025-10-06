import { useState, useEffect } from 'react'
import { CartItem } from '../types/database'

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    // Load cart from localStorage on mount
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error)
        setCartItems([])
      }
    }
  }, [])

  const addToCart = (item: CartItem) => {
    const existingIndex = cartItems.findIndex(
      (cartItem) => 
        cartItem.slug === item.slug && 
        cartItem.childName === item.childName &&
        cartItem.gender === item.gender
    )

    let updatedCart: CartItem[]
    
    if (existingIndex >= 0) {
      // Update existing item
      updatedCart = [...cartItems]
      updatedCart[existingIndex] = item
    } else {
      // Add new item
      updatedCart = [...cartItems, item]
    }

    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const removeFromCart = (index: number) => {
    const updatedCart = cartItems.filter((_, i) => i !== index)
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0)
  }

  const getItemCount = () => {
    return cartItems.length
  }

  return {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getItemCount
  }
}