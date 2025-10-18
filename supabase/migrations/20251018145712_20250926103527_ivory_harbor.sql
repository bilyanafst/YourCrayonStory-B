/*
  # Create story_templates table

  1. New Tables
    - `story_templates`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `tags` (text array)
      - `cover_image_url` (text)
      - `gender` (enum: boy, girl, unisex)
      - `preview_json` (jsonb)
      - `price_eur` (numeric)
      - `is_published` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `story_templates` table
    - Add policy for public read access to published templates

  3. Sample Data
    - Insert "Sharing" and "Washing Hands" templates
*/

-- Create gender enum type
CREATE TYPE gender_type AS ENUM ('boy', 'girl', 'unisex');

-- Create story_templates table
CREATE TABLE IF NOT EXISTS story_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  tags text[] DEFAULT '{}',
  cover_image_url text,
  gender gender_type NOT NULL DEFAULT 'unisex',
  preview_json jsonb,
  price_eur numeric(10,2) NOT NULL DEFAULT 0.00,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE story_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to published templates
CREATE POLICY "Public can read published templates"
  ON story_templates
  FOR SELECT
  TO public
  USING (is_published = true);

-- Create policy for authenticated users to read all templates
CREATE POLICY "Authenticated users can read all templates"
  ON story_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample data
INSERT INTO story_templates (title, description, tags, cover_image_url, gender, preview_json, price_eur, is_published) VALUES
(
  'Sharing',
  'A heartwarming story about learning to share toys and treats with friends. Perfect for teaching children about kindness and generosity.',
  ARRAY['friendship', 'kindness', 'social skills', 'preschool'],
  'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=800',
  'unisex',
  '{
    "pages": [
      {
        "page": 1,
        "text": "Once upon a time, there was a little child who had many wonderful toys.",
        "illustration_prompt": "A happy child surrounded by colorful toys in a bright playroom"
      },
      {
        "page": 2,
        "text": "When friends came to play, the child learned that sharing made everyone happy.",
        "illustration_prompt": "Children playing together, sharing toys and laughing"
      },
      {
        "page": 3,
        "text": "The more they shared, the more fun they had together!",
        "illustration_prompt": "A group of diverse children playing happily together with shared toys"
      }
    ],
    "moral": "Sharing with others brings joy to everyone."
  }',
  3.99,
  true
),
(
  'Washing Hands',
  'An educational and fun story that teaches children the importance of washing their hands. Makes hygiene habits enjoyable and memorable.',
  ARRAY['hygiene', 'health', 'daily routine', 'educational'],
  'https://images.pexels.com/photos/4167542/pexels-photo-4167542.jpeg?auto=compress&cs=tinysrgb&w=800',
  'unisex',
  '{
    "pages": [
      {
        "page": 1,
        "text": "Every day, our hands touch many things - toys, doors, and playground equipment.",
        "illustration_prompt": "A child touching various objects throughout the day"
      },
      {
        "page": 2,
        "text": "Tiny germs we cannot see stick to our hands and can make us sick.",
        "illustration_prompt": "Cartoon germs on hands, shown in a fun, non-scary way"
      },
      {
        "page": 3,
        "text": "But washing hands with soap and water washes all the germs away!",
        "illustration_prompt": "A child happily washing hands at a sink with soap bubbles"
      },
      {
        "page": 4,
        "text": "Clean hands keep us healthy and ready to play another day!",
        "illustration_prompt": "A healthy, happy child with sparkling clean hands ready to play"
      }
    ],
    "moral": "Washing hands keeps us healthy and strong."
  }',
  2.99,
  true
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_story_templates_updated_at
    BEFORE UPDATE ON story_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();