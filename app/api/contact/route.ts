import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const {
      name,
      email,
      phone,
      company,
      service,
      urgency,
      message,
      budget
    } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Generate unique inquiry ID for tracking
    const inquiryId = `INQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Prepare data for database
    const inquiryData = {
      name,
      email,
      phone: phone || null,
      company: company || null,
      service: service || null,
      urgency: urgency || 'medium',
      message,
      budget: budget || null,
      inquiry_id: inquiryId,
      status: 'new'
    }

    // Insert into Supabase database
    const { data, error: dbError } = await supabase
      .from('contact_inquiries')
      .insert([inquiryData])
      .select()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save inquiry to database')
    }

    // Send notification email via Supabase Edge Function
    try {
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-contact-notification', {
        body: inquiryData
      })

      if (emailError) {
        console.error('Email error:', emailError)
        // Don't fail the form submission if email fails
        console.warn('Email notification failed, but inquiry was saved to database')
      }
    } catch (emailError) {
      console.error('Email function error:', emailError)
      // Continue with success response even if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Contact form submitted successfully',
      inquiryId
    })
    
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to submit contact form. Please try again or contact us directly.' },
      { status: 500 }
    )
  }
}