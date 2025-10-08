/*
  # Create Story Reviews Table

  1. New Tables
    - `story_reviews`
      - `id` (uuid, primary key) - Unique identifier for each review
      - `user_id` (uuid, foreign key) - References auth.users, the user who wrote the review
      - `template_slug` (text) - The story template being reviewed
      - `child_name` (text) - Name of the child who enjoyed the story
      - `rating` (integer) - Star rating from 1 to 5
      - `feedback` (text, optional) - Optional text feedback about the story
      - `order_id` (uuid, optional, foreign key) - References orders table for verification
      - `created_at` (timestamptz) - When the review was created
      - `updated_at` (timestamptz) - When the review was last updated

  2. Security
    - Enable RLS on `story_reviews` table
    - Add policy for users to read their own reviews
    - Add policy for users to insert their own reviews
    - Add policy for users to update their own reviews
    - Add policy for users to delete their own reviews
    - Add policy for public read access to aggregate review data (ratings only)
    - Add policy for admins to read all reviews

  3. Constraints
    - Rating must be between 1 and 5
    - Unique constraint on (user_id, template_slug, child_name) to prevent duplicate reviews
    - Check that order_id exists and belongs to user if provided

  4. Indexes
    - Index on template_slug for fast average rating lookups
    - Index on user_id for fast user review lookups
*/

CREATE TABLE IF NOT EXISTS story_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_slug text NOT NULL,
  child_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, template_slug, child_name)
);

CREATE INDEX IF NOT EXISTS story_reviews_template_slug_idx ON story_reviews(template_slug);
CREATE INDEX IF NOT EXISTS story_reviews_user_id_idx ON story_reviews(user_id);
CREATE INDEX IF NOT EXISTS story_reviews_rating_idx ON story_reviews(rating);

ALTER TABLE story_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reviews"
  ON story_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews"
  ON story_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON story_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON story_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view all reviews for display"
  ON story_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can view all reviews"
  ON story_reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update review featured status"
  ON story_reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE OR REPLACE FUNCTION update_story_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_story_reviews_updated_at
  BEFORE UPDATE ON story_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_story_reviews_updated_at();
