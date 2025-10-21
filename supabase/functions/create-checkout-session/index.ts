/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from 'npm:@supabase/supabase-js@2.39.7'
import Stripe from 'npm:stripe@14.24.0'
import { CartItem } from '../../../src/types/database.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('VITE_SUPABASE_URL') ?? '',
      Deno.env.get('VITE_SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const { items, userId, deliveryEmail } = await req.json()

    if (!items || !Array.isArray(items) || items.length === 0 || !userId || !deliveryEmail) {
      throw new Error('Missing required data')
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: CartItem) => sum + item.price, 0)

    // Create line items for Stripe
    const lineItems = items.map((item: CartItem) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${item.title} - Personalized for ${item.childName}`,
          description: `Personalized coloring book for ${item.childName} (${item.gender})`,
          images: item.coverImage ? [item.coverImage] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: 1,
    }))

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/checkout`,
      metadata: {
        userId,
        deliveryEmail,
        cartData: JSON.stringify(items)
      }
    })

    // Create order record in database
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        stripe_session_id: session.id,
        cart_data: items,
        delivery_email: deliveryEmail,
        total_amount: totalAmount,
        status: 'pending'
      })

    if (orderError) {
      console.error('Error creating order:', orderError)
      throw new Error('Failed to create order record')
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}
)