/*
  # Create contact inquiries system

  1. New Tables
    - `contact_inquiries`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, required)
      - `phone` (text, optional)
      - `company` (text, optional)
      - `service` (text, optional)
      - `urgency` (text, default 'medium')
      - `message` (text, required)
      - `budget` (text, optional)
      - `inquiry_id` (text, unique tracking ID)
      - `status` (text, default 'new')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `contact_inquiries` table
    - Add policy for public insert (form submissions)
    - Add policy for authenticated users to read all data (admin access)

  3. Indexes
    - Index on email for faster lookups
    - Index on created_at for sorting
    - Index on status for filtering
*/

-- Create contact_inquiries table
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  service text,
  urgency text DEFAULT 'medium',
  message text NOT NULL,
  budget text,
  inquiry_id text UNIQUE NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for form submissions)
CREATE POLICY "Allow public form submissions"
  ON contact_inquiries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read all inquiries (for admin dashboard)
CREATE POLICY "Allow authenticated users to read all inquiries"
  ON contact_inquiries
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update inquiry status
CREATE POLICY "Allow authenticated users to update inquiries"
  ON contact_inquiries
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email ON contact_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON contact_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_urgency ON contact_inquiries(urgency);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contact_inquiries_updated_at
  BEFORE UPDATE ON contact_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();