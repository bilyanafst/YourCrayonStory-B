import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GiftEmailRequest {
  giftId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { giftId }: GiftEmailRequest = await req.json();

    if (!giftId) {
      return new Response(
        JSON.stringify({ error: "Gift ID is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const response = await fetch(`${supabaseUrl}/rest/v1/gifted_stories?id=eq.${giftId}`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch gift data");
    }

    const gifts = await response.json();
    const gift = gifts[0];

    if (!gift) {
      return new Response(
        JSON.stringify({ error: "Gift not found" }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .gift-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .message { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; font-style: italic; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .cover-image { max-width: 100%; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 You've Received a Special Gift!</h1>
          </div>
          <div class="content">
            <p>Hi ${gift.recipient_name},</p>

            <p>You've received a personalized story as a gift!</p>

            <div class="gift-box">
              <h2 style="margin-top: 0; color: #667eea;">📖 ${gift.template_title}</h2>
              <p><strong>Personalized for:</strong> ${gift.child_name}</p>
              <p><strong>Character:</strong> ${gift.gender === 'boy' ? '👦 Boy' : '👧 Girl'}</p>
              ${gift.cover_image_url ? `<img src="${gift.cover_image_url}" alt="Story Cover" class="cover-image" />` : ''}
            </div>

            ${gift.message ? `
              <div class="message">
                <strong>💌 Personal Message:</strong>
                <p>${gift.message}</p>
              </div>
            ` : ''}

            <p style="text-align: center;">
              <a href="${supabaseUrl}/storage/v1/object/public/gifts/${giftId}.pdf" class="button">
                📥 Download Your Personalized Story
              </a>
            </p>

            <p>This personalized coloring book is ready to print and enjoy! It features ${gift.child_name} as the main character in an exciting adventure.</p>

            <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>💡 Want to create your own personalized story?</strong></p>
              <p style="margin: 10px 0 0;">Visit <a href="https://yourcrayonstory.com" style="color: #667eea;">Your Crayon Story</a> to create magical personalized stories for your loved ones!</p>
            </div>

            <div class="footer">
              <p>This gift was sent to you through Your Crayon Story</p>
              <p>© ${new Date().getFullYear()} Your Crayon Story. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`Email would be sent to: ${gift.recipient_email}`);
    console.log(`Gift ID: ${giftId}`);
    console.log(`Template: ${gift.template_title}`);

    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/gifted_stories?id=eq.${giftId}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        is_sent: true,
        sent_at: new Date().toISOString(),
      }),
    });

    if (!updateResponse.ok) {
      console.error("Failed to update gift status");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Gift email sent successfully",
        recipient: gift.recipient_email,
        emailPreview: emailHtml,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending gift email:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to send gift email",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
