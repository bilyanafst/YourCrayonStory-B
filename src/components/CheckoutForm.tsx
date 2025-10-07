import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../hooks/useCart'
import toast from 'react-hot-toast'

interface CheckoutFormProps {
  billingEmail: string
  billingName: string
  cartItems: any[]
  totalAmount: number
}

export function CheckoutForm({ billingEmail, billingName, cartItems, totalAmount }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    if (!billingName.trim() || !billingEmail.trim()) {
      toast.error('Please fill in all billing information')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        throw new Error(submitError.message)
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/thank-you`,
        },
        redirect: 'if_required',
      })

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        const { error: dbError } = await supabase.from('orders').insert({
          user_id: user?.id,
          cart_items: cartItems,
          total_amount: totalAmount,
          billing_email: billingEmail.trim(),
          billing_name: billingName.trim(),
          stripe_payment_intent_id: paymentIntent.id,
          payment_status: 'completed',
        })

        if (dbError) {
          console.error('Failed to save order:', dbError)
        }

        clearCart()
        navigate('/thank-you', { state: { childName: cartItems[0]?.childName } })
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment failed. Please try again.')
      toast.error(err.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <span>Place Order</span>
        )}
      </button>
    </form>
  )
}
