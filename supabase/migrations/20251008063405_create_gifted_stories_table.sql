/*
  # Create gifted_stories table for gift purchases

  1. New Tables
    - `gifted_stories`
      - `id` (uuid, primary key) - Unique identifier for each gift
      - `sender_user_id` (uuid, foreign key) - References auth.users, the person sending the gift
      - `order_id` (uuid, nullable) - References orders table
      - `recipient_email` (text) - Email address of the gift recipient
      - `recipient_name` (text) - Name of the gift recipient
      - `message` (text, nullable) - Optional personalized message from sender
      - `send_at` (timestamptz) - When to send the gift (immediate or scheduled)
      - `story_data` (jsonb) - Complete personalized story with pages
      - `template_slug` (text) - Story template identifier
      - `template_title` (text) - Story title
      - `child_name` (text) - Personalized child's name in the story
      - `gender` (text) - Character gender ('boy' or 'girl')
      - `cover_image_url` (text, nullable) - Cover image for display
      - `pdf_url` (text, nullable) - Link to generated PDF
      - `is_sent` (boolean) - Whether the gift email has been sent
      - `sent_at` (timestamptz, nullable) - When the gift was actually sent
      - `created_at` (timestamptz) - When the gift was created
      - `updated_at` (timestamptz) - Last modification time

  2. Security
    - Enable RLS on `gifted_stories` table
    - Senders can view their own sent gifts
    - Senders can insert their own gifts
    - Senders can update their own gifts (for resending, etc.)
    - No public access to gift data

  3. Indexes
    - Index on sender_user_id for fast sender lookups
    - Index on recipient_email for recipient lookups
    - Index on send_at for scheduling queries
    - Index on is_sent for filtering unsent gifts
*/

CREATE TABLE IF NOT EXISTS gifted_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id uuid,
  recipient_email text NOT NULL,
  recipient_name text NOT NULL,
  message text,
  send_at timestamptz DEFAULT now() NOT NULL,
  story_data jsonb NOT NULL,
  template_slug text NOT NULL,
  template_title text NOT NULL,
  child_name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('boy', 'girl')),
  cover_image_url text,
  pdf_url text,
  is_sent boolean DEFAULT false,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gifted_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Senders can view own gifts"
  ON gifted_stories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_user_id);

CREATE POLICY "Senders can insert own gifts"
  ON gifted_stories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_user_id);

CREATE POLICY "Senders can update own gifts"
  ON gifted_stories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_user_id)
  WITH CHECK (auth.uid() = sender_user_id);

CREATE POLICY "Senders can delete own gifts"
  ON gifted_stories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_user_id);

CREATE INDEX IF NOT EXISTS idx_gifted_stories_sender_user_id ON gifted_stories(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_gifted_stories_recipient_email ON gifted_stories(recipient_email);
CREATE INDEX IF NOT EXISTS idx_gifted_stories_send_at ON gifted_stories(send_at);
CREATE INDEX IF NOT EXISTS idx_gifted_stories_is_sent ON gifted_stories(is_sent);
CREATE INDEX IF NOT EXISTS idx_gifted_stories_order_id ON gifted_stories(order_id);

CREATE OR REPLACE FUNCTION update_gifted_stories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_gifted_stories_updated_at
  BEFORE UPDATE ON gifted_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_gifted_stories_updated_at();
