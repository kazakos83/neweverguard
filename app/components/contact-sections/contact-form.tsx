"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    urgency: 'medium',
    message: '',
    budget: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.message) {
        toast.error('Please fill in all required fields')
        return
      }

      // Generate unique inquiry ID
      const inquiryId = `INQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Prepare data for database
      const inquiryData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        service: formData.service || null,
        urgency: formData.urgency,
        message: formData.message,
        budget: formData.budget || null,
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
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-contact-notification', {
        body: {
          ...inquiryData,
          inquiry_id: inquiryId
        }
      })

      if (emailError) {
        console.error('Email error:', emailError)
        // Don't fail the form submission if email fails, but log it
        console.warn('Email notification failed, but inquiry was saved to database')
      }

      // Success - show confirmation and reset form
      toast.success('Message sent successfully! We\'ll contact you within 24 hours.')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        urgency: 'medium',
        message: '',
        budget: ''
      })

      // Send client confirmation email (opens email client)
      const clientEmailSubject = encodeURIComponent(`Thank you for contacting Everguard Intelligence - Reference: ${inquiryId}`)
      const clientEmailBody = encodeURIComponent(`Dear ${formData.name},

Thank you for contacting Everguard Intelligence. We have received your inquiry regarding ${formData.service ? serviceDisplay : 'our services'} and will respond within 24 hours.

Your Inquiry Details:
- Reference ID: ${inquiryId}
- Service: ${serviceDisplay}
- Priority: ${formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)}

What happens next:
1. Our team will review your requirements within 2 hours
2. We'll prepare a detailed proposal and quote
3. One of our senior investigators will contact you directly
4. We'll schedule a confidential consultation at your convenience

Need immediate assistance?
📞 24/7 Emergency Line: 1800-EVERGUARD
📧 Email: info@everguardgroup.com.au

🔒 Confidentiality Assured: All communications are treated with the strictest confidentiality in accordance with our professional and licensing standards.

Best regards,
The Everguard Intelligence Team
Premier Corporate Investigation Services Australia`)

      // Open email client for confirmation (backup method)
      window.open(`mailto:${formData.email}?subject=${clientEmailSubject}&body=${clientEmailBody}`)

    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Failed to send message. Please try again or call us directly at 1800-EVERGUARD.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="bg-white py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold text-gray-900">
                Request a Consultation
              </CardTitle>
              <p className="text-gray-600 mt-4">
                Fill out the form below and we'll get back to you within 24 hours with a detailed proposal.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="pl-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="pl-4"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company/Organization</Label>
                    <Input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="pl-4"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="service">Service Required</Label>
                    <Select value={formData.service} onValueChange={(value) => handleInputChange('service', value)}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent className="select-content bg-white border border-gray-300 shadow-lg z-50">
                        <SelectItem value="corporate-intelligence" className="select-item">Corporate Intelligence</SelectItem>
                        <SelectItem value="insurance-investigations" className="select-item">Insurance Investigations</SelectItem>
                        <SelectItem value="osint" className="select-item">OSINT Services</SelectItem>
                        <SelectItem value="skip-tracing" className="select-item">Skip Tracing</SelectItem>
                        <SelectItem value="surveillance" className="select-item">Surveillance</SelectItem>
                        <SelectItem value="background-checks" className="select-item">Background Checks</SelectItem>
                        <SelectItem value="other" className="select-item">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="select-content bg-white border border-gray-300 shadow-lg z-50">
                        <SelectItem value="low" className="select-item">Low - Within 2 weeks</SelectItem>
                        <SelectItem value="medium" className="select-item">Medium - Within 1 week</SelectItem>
                        <SelectItem value="high" className="select-item">High - Within 48 hours</SelectItem>
                        <SelectItem value="urgent" className="select-item">Urgent - Within 24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Estimated Budget (Optional)</Label>
                  <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent className="select-content bg-white border border-gray-300 shadow-lg z-50">
                      <SelectItem value="under-5k" className="select-item">Under $5,000</SelectItem>
                      <SelectItem value="5k-10k" className="select-item">$5,000 - $10,000</SelectItem>
                      <SelectItem value="10k-25k" className="select-item">$10,000 - $25,000</SelectItem>
                      <SelectItem value="25k-50k" className="select-item">$25,000 - $50,000</SelectItem>
                      <SelectItem value="over-50k" className="select-item">Over $50,000</SelectItem>
                      <SelectItem value="discuss" className="select-item">Prefer to discuss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Project Details *</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Please provide details about your investigation requirements, including any specific objectives, timelines, or special considerations..."
                    required
                    className="pl-4"
                  />
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-red-800 mb-1">Confidentiality Guaranteed</p>
                      <p className="text-red-700">
                        All information shared is treated with the strictest confidentiality. 
                        We're licensed, professional, and fully insured.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full everguard-gradient text-white hover:opacity-90 text-lg py-6 group"
                >
                  <div className="flex items-center justify-center space-x-2">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </Button>

                <p className="text-center text-sm text-gray-600">
                  By submitting this form, you agree to our confidentiality terms. 
                  We'll respond within 24 hours during business days.
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

export default ContactForm