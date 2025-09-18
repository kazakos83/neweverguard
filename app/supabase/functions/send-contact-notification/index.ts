import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ContactData {
  name: string
  email: string
  phone?: string
  company?: string
  service?: string
  urgency: string
  message: string
  budget?: string
  inquiry_id: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const contactData: ContactData = await req.json()

    // Service display mapping
    const serviceDisplay = {
      'corporate-intelligence': 'Corporate Intelligence',
      'insurance-investigations': 'Insurance Investigations',
      'osint': 'OSINT Services',
      'skip-tracing': 'Skip Tracing',
      'surveillance': 'Surveillance',
      'background-checks': 'Background Checks',
      'other': 'Other Services'
    }[contactData.service || 'other'] || 'General Inquiry'

    // Urgency color mapping
    const urgencyColor = {
      'low': '#10B981',
      'medium': '#F59E0B', 
      'high': '#EF4444',
      'urgent': '#DC2626'
    }[contactData.urgency] || '#F59E0B'

    // Create email content for Everguard
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>🚨 NEW INQUIRY - Everguard Intelligence</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 700px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 4px solid #DC2626; padding-bottom: 25px; margin-bottom: 30px; background: linear-gradient(135deg, #DC2626, #B91C1C); color: white; margin: -30px -30px 30px -30px; padding: 30px; border-radius: 15px 15px 0 0; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .urgency-badge { display: inline-block; padding: 8px 20px; border-radius: 25px; color: white; font-weight: bold; font-size: 14px; text-transform: uppercase; margin-top: 15px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin: 25px 0; }
          .info-item { background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 5px solid #DC2626; }
          .info-label { font-weight: bold; color: #DC2626; margin-bottom: 8px; font-size: 16px; }
          .message-section { background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #e9ecef; }
          .footer { text-align: center; margin-top: 30px; padding-top: 25px; border-top: 2px solid #eee; color: #666; font-size: 14px; }
          .cta-button { display: inline-block; background: #DC2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 25px 0; }
          .highlight { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .contact-details { font-size: 18px; line-height: 1.8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚨 EVERGUARD INTELLIGENCE</div>
            <h1 style="margin: 10px 0; font-size: 24px;">NEW CONTACT FORM SUBMISSION</h1>
            <span class="urgency-badge" style="background-color: ${urgencyColor};">
              ${contactData.urgency.toUpperCase()} PRIORITY
            </span>
          </div>

          <div class="highlight">
            <h2 style="margin: 0 0 10px 0; color: #DC2626;">⚡ ACTION REQUIRED</h2>
            <p style="margin: 0; font-weight: bold;">A new ${contactData.urgency} priority inquiry has been submitted. Please respond according to priority level.</p>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">👤 CONTACT INFORMATION</div>
              <div class="contact-details">
                <strong>${contactData.name}</strong><br>
                📧 <a href="mailto:${contactData.email}" style="color: #DC2626; text-decoration: none;">${contactData.email}</a><br>
                ${contactData.phone ? `📞 <strong>${contactData.phone}</strong>` : '📞 No phone provided'}
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-label">🏢 BUSINESS DETAILS</div>
              <div class="contact-details">
                ${contactData.company ? `<strong>Company:</strong> ${contactData.company}<br>` : 'No company provided<br>'}
                <strong>Service:</strong> ${serviceDisplay}<br>
                ${contactData.budget ? `<strong>Budget:</strong> ${contactData.budget}` : 'Budget not specified'}
              </div>
            </div>
          </div>

          <div class="message-section">
            <div class="info-label" style="margin-bottom: 15px; font-size: 18px;">📋 PROJECT DETAILS:</div>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
              <p style="margin: 0; white-space: pre-wrap; font-size: 16px; line-height: 1.6;">${contactData.message}</p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${contactData.email}?subject=Re: Your inquiry to Everguard Intelligence (${contactData.inquiry_id})" class="cta-button" style="color: white; text-decoration: none;">
              📧 RESPOND TO CLIENT
            </a>
          </div>

          <div class="footer">
            <div style="background: #DC2626; color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <p style="margin: 0; font-weight: bold; font-size: 16px;">
                ⚡ PRIORITY: ${contactData.urgency === 'urgent' ? 'URGENT - Respond within 24 hours' : contactData.urgency === 'high' ? 'HIGH PRIORITY - Respond within 48 hours' : 'Standard response time applies'}
              </p>
            </div>
            <p><strong>📋 Inquiry ID:</strong> ${contactData.inquiry_id}</p>
            <p><strong>📅 Submitted:</strong> ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</p>
            <p>This inquiry was submitted through the Everguard Intelligence website contact form.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email to Everguard using Supabase's built-in email service
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Everguard Intelligence <noreply@everguardgroup.com.au>',
        to: ['info@everguardgroup.com.au'],
        subject: `🚨 NEW ${contactData.urgency.toUpperCase()} PRIORITY INQUIRY - ${contactData.name} - ${serviceDisplay}`,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      throw new Error(`Email service error: ${emailResponse.statusText}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contact form submitted and email sent successfully',
        inquiry_id: contactData.inquiry_id
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process contact form',
        details: error.message
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})