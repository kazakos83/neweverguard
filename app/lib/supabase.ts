import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ContactInquiry = {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  service?: string
  urgency: string
  message: string
  budget?: string
  inquiry_id: string
  status: string
  created_at: string
  updated_at: string
}