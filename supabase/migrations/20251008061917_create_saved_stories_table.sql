/*
  # Create saved_stories table for personalized story drafts

  1. New Tables
    - `saved_stories`
      - `id` (uuid, primary key) - Unique identifier for each saved story
      - `user_id` (uuid, foreign key) - References auth.users, the owner of the saved story
      - `template_slug` (text) - The story template identifier
      - `title` (text) - Story title (cached from template)
      - `child_name` (text) - Personalized child's name
      - `gender` (text) - Character gender ('boy' or 'girl')
      - `story_data` (jsonb) - Complete personalized story pages with images and captions
      - `cover_image_url` (text, nullable) - Cached cover image for quick display
      - `is_purchased` (boolean) - Whether this story has been purchased
      - `created_at` (timestamptz) - When the story was saved
      - `updated_at` (timestamptz) - Last modification time

  2. Security
    - Enable RLS on `saved_stories` table
    - Users can only view their own saved stories
    - Users can only insert their own saved stories (user_id must match auth.uid())
    - Users can only update their own saved stories
    - Users can only delete their own saved stories

  3. Indexes
    - Index on user_id for fast lookups
    - Index on template_slug for filtering by template
*/

CREATE TABLE IF NOT EXISTS saved_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_slug text NOT NULL,
  title text NOT NULL,
  child_name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('boy', 'girl')),
  story_data jsonb NOT NULL,
  cover_image_url text,
  is_purchased boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE saved_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved stories"
  ON saved_stories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved stories"
  ON saved_stories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved stories"
  ON saved_stories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved stories"
  ON saved_stories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_stories_user_id ON saved_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_stories_template_slug ON saved_stories(template_slug);

CREATE OR REPLACE FUNCTION update_saved_stories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_saved_stories_updated_at
  BEFORE UPDATE ON saved_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_stories_updated_at();
