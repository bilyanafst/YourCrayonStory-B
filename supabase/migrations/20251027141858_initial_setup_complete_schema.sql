/*
  # Complete Initial Database Schema Setup

  This migration sets up the complete database schema for Your Crayon Story application.

  ## New Tables
    - `story_templates` - Store story template information
    - `orders` - Store customer orders and payment information
    - `profiles` - Store user profile information including admin status
    - `child_profiles` - Store child profile information for personalization
    - `saved_stories` - Store user's saved story customizations
    - `gifted_stories` - Store information about gifted stories
    - `story_reviews` - Store user reviews and ratings for templates

  ## Security
    - Enable RLS on all tables
    - Add restrictive policies for authenticated users
    - Admin-only access for template management
    - Users can only access their own data

  ## Features
    - Auto-create user profile on signup
    - Support for gift orders
    - Child profile management
    - Story reviews and ratings system
*/

-- Create gender enum type
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
    CREATE TYPE gender_type AS ENUM ('boy', 'girl', 'unisex');
  END IF;
END $$;

-- Create story_templates table
CREATE TABLE IF NOT EXISTS story_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
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

ALTER TABLE story_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published templates"
  ON story_templates FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Authenticated users can read all templates"
  ON story_templates FOR SELECT
  TO authenticated
  USING (true);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id text,
  stripe_payment_intent_id text,
  cart_data jsonb NOT NULL,
  delivery_email text NOT NULL,
  billing_name text,
  total_amount numeric(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  is_gift boolean DEFAULT false,
  gift_recipient_email text,
  gift_recipient_name text,
  gift_message text,
  download_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_stripe_session_id_idx ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- Create child_profiles table
CREATE TABLE IF NOT EXISTS child_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_name text NOT NULL,
  age integer,
  gender gender_type,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own child profiles"
  ON child_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own child profiles"
  ON child_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own child profiles"
  ON child_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own child profiles"
  ON child_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS child_profiles_user_id_idx ON child_profiles(user_id);

-- Create saved_stories table
CREATE TABLE IF NOT EXISTS saved_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_profile_id uuid REFERENCES child_profiles(id) ON DELETE SET NULL,
  template_id uuid NOT NULL REFERENCES story_templates(id) ON DELETE CASCADE,
  story_title text NOT NULL,
  customizations jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE saved_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved stories"
  ON saved_stories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved stories"
  ON saved_stories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved stories"
  ON saved_stories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved stories"
  ON saved_stories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS saved_stories_user_id_idx ON saved_stories(user_id);
CREATE INDEX IF NOT EXISTS saved_stories_template_id_idx ON saved_stories(template_id);

-- Create gifted_stories table
CREATE TABLE IF NOT EXISTS gifted_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  recipient_name text NOT NULL,
  sender_name text NOT NULL,
  gift_message text,
  is_redeemed boolean DEFAULT false,
  redeemed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gifted_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view gifted stories they sent"
  ON gifted_stories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = gifted_stories.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS gifted_stories_order_id_idx ON gifted_stories(order_id);
CREATE INDEX IF NOT EXISTS gifted_stories_recipient_email_idx ON gifted_stories(recipient_email);

-- Create story_reviews table
CREATE TABLE IF NOT EXISTS story_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES story_templates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(template_id, user_id)
);

ALTER TABLE story_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON story_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON story_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON story_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON story_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS story_reviews_template_id_idx ON story_reviews(template_id);
CREATE INDEX IF NOT EXISTS story_reviews_user_id_idx ON story_reviews(user_id);

-- Create index on story_templates slug
CREATE INDEX IF NOT EXISTS story_templates_slug_idx ON story_templates(slug);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_story_templates_updated_at
    BEFORE UPDATE ON story_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_child_profiles_updated_at
    BEFORE UPDATE ON child_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_stories_updated_at
    BEFORE UPDATE ON saved_stories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_story_reviews_updated_at
    BEFORE UPDATE ON story_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, is_admin)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample story templates
INSERT INTO story_templates (title, slug, description, tags, cover_image_url, gender, preview_json, price_eur, is_published) VALUES
(
  'Sharing',
  'sharing',
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
  'washing-hands',
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
)
ON CONFLICT (slug) DO NOTHING;
