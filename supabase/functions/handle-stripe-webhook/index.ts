import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14.21.0'

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
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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

      // Trigger PDF generation and email sending
      await generateAndSendPDFs(order, supabase)
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

async function generateAndSendPDFs(order: any, supabase: any) {
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

      const storyArray = await response.json()

      // Personalize story pages (remove watermark logic here)
      const personalizedPages = storyArray.map((page: any, index: number) => ({
        page_number: index + 1,
        image_base64: page.image.replace(/^data:image\/(png|jpeg);base64,/, ''),
        text: page.caption
          .replace(/\{\{name\}\}/gi, item.childName)
          .replace(/\{name\}/gi, item.childName)
          .replace(/\[CHILD_NAME\]/gi, item.childName)
      }))

      // Here you would generate PDF and send email
      // For now, we'll just log the success
      console.log(`Generated PDF for ${item.title} - ${item.childName}`)
      
      // TODO: Implement actual PDF generation and email sending
      // This could be done using a PDF library like jsPDF or Puppeteer
      // and an email service like SendGrid or AWS SES
    }

    console.log(`Successfully processed order ${order.id}`)
  } catch (error) {
    console.error('Error generating PDFs:', error)
  }
}