/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2.39.7'
import Stripe from 'npm:stripe@14.24.0'
import { Order } from '../../../src/types/database.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const supabase = createClient(
      Deno.env.get('VITE_SUPABASE_URL') ?? '',
      Deno.env.get('VITE_SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()

    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_session_id', session.id)

      if (updateError) {
        console.error('Error updating order:', updateError)
        throw new Error('Failed to update order status')
      }

      // Get order details for PDF generation
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_session_id', session.id)
        .single()

      if (orderError || !order) {
        console.error('Error fetching order:', orderError)
        throw new Error('Failed to fetch order details')
      }

      // Check if this is a gift order
      if (order.is_gift && order.gift_data) {
        await handleGiftOrder(order, supabase)
      } else {
        // Trigger PDF generation and email sending for regular orders
        await generateAndSendPDFs(order, supabase)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function handleGiftOrder(order: Order, supabase: SupabaseClient) {
  try {
    console.log(`Processing gift order ${order.id}`)
    const cartItems = order.cart_data

    for (const item of cartItems) {
      const giftInfo = order.gift_data?.[item.slug]
      if (!giftInfo) {
        console.error(`No gift data found for item ${item.slug}`)
        continue
      }

      // Get story template
      const { data: template, error: templateError } = await supabase
        .from('story_templates')
        .select('*')
        .eq('slug', item.slug)
        .single()

      if (templateError || !template) {
        console.error('Error fetching template:', templateError)
        continue
      }

      // Get and personalize story data
      const jsonUrl = item.gender === 'boy' ? template.json_url_boy : template.json_url_girl
      if (!jsonUrl) continue

      const response = await fetch(jsonUrl)
      if (!response.ok) continue

      const storyArray: { image: string; caption: string }[] = await response.json();

      // Personalize story pages
      const personalizedPages = storyArray.map((page: { image: string; caption: string }, index: number) => ({
        page_number: index + 1,
        image_base64: page.image.replace(/^data:image\/(png|jpeg);base64,/, ''),
        text: page.caption
          .replace(/\{\{name\}\}/gi, item.childName)
          .replace(/\{name\}/gi, item.childName)
          .replace(/\[CHILD_NAME\]/gi, item.childName)
      }))

      const storyData = { pages: personalizedPages }

      // Check if gift already exists (to prevent duplicates)
      const { data: existingGift } = await supabase
        .from('gifted_stories')
        .select('id')
        .eq('order_id', order.id)
        .eq('template_slug', item.slug)
        .maybeSingle()

      if (existingGift) {
        console.log(`Gift already exists for order ${order.id}, item ${item.slug}`)
        continue
      }

      // Create gift record with complete story data
      const { data: gift, error: giftError } = await supabase
        .from('gifted_stories')
        .insert({
          sender_user_id: order.user_id,
          order_id: order.id,
          recipient_email: giftInfo.recipientEmail,
          recipient_name: giftInfo.recipientName,
          message: giftInfo.message || null,
          send_at: giftInfo.sendAt ? new Date(giftInfo.sendAt).toISOString() : new Date().toISOString(),
          story_data: storyData,
          template_slug: item.slug,
          template_title: item.title,
          child_name: item.childName,
          gender: item.gender,
          cover_image_url: item.coverImage,
          is_sent: false,
        })
        .select()
        .single()

      if (giftError) {
        console.error('Error creating gift record:', giftError)
        continue
      }

      console.log(`Created gift record ${gift.id} for ${giftInfo.recipientEmail}`)

      // If send date is today or in the past, trigger immediate send
      const sendDate = new Date(giftInfo.sendAt || new Date())
      const now = new Date()

      if (sendDate <= now) {
        console.log(`Triggering immediate gift send for ${gift.id}`)
        try {
          const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL')
          const supabaseKey = Deno.env.get('VITE_SUPABASE_ANON_KEY')

          // Call the send-gift-email function
          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-gift-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ giftId: gift.id }),
          })

          if (!emailResponse.ok) {
            console.error('Failed to send gift email:', await emailResponse.text())
          } else {
            console.log(`Gift email sent successfully for ${gift.id}`)
          }
        } catch (emailError) {
          console.error('Error calling send-gift-email function:', emailError)
        }
      } else {
        console.log(`Gift ${gift.id} scheduled for ${sendDate.toISOString()}`)
      }
    }

    console.log(`Successfully processed gift order ${order.id}`)
  } catch (error) {
    console.error('Error processing gift order:', error)
  }
}

async function generateAndSendPDFs(order: Order, supabase: SupabaseClient) {
  try {
    const cartItems = order.cart_data

    for (const item of cartItems) {
      // Get story template
      const { data: template, error: templateError } = await supabase
        .from('story_templates')
        .select('*')
        .eq('slug', item.slug)
        .single()

      if (templateError || !template) {
        console.error('Error fetching template:', templateError)
        continue
      }

      // Get story JSON data
      const jsonUrl = item.gender === 'boy' ? template.json_url_boy : template.json_url_girl
      if (!jsonUrl) continue

      const response = await fetch(jsonUrl)
      if (!response.ok) continue

      const storyArray: { image: string; caption: string }[] = await response.json()

      // Personalize story pages (remove watermark logic here)
      storyArray.map((page: { image: string; caption: string }, index: number) => ({
        page_number: index + 1,
        image_base64: page.image.replace(/^data:image\/(png|jpeg);base64,/, ''),
        text: page.caption
          .replace(/\{\{name\}\}/gi, item.childName)
          .replace(/\{name\}/gi, item.childName)
          .replace(/\[CHILD_NAME\]/gi, item.childName)
      }))

      // Here you would generate PDF and send email to order.delivery_email
      // For now, we'll just log the success
      console.log(`Generated PDF for ${item.title} - ${item.childName}`)
      console.log(`Would send to: ${order.delivery_email}`)

      // TODO: Implement actual PDF generation and email sending
      // This could be done using a PDF library like jsPDF or Puppeteer
      // and an email service like SendGrid or AWS SES
    }

    console.log(`Successfully processed order ${order.id}`)
  } catch (error) {
    console.error('Error generating PDFs:', error)
  }
}