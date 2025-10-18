/*
  # Create Child Profiles Table

  1. New Tables
    - `child_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, child's name)
      - `gender` (text, 'boy' or 'girl')
      - `avatar` (text, emoji or avatar identifier)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `child_profiles` table
    - Add policy for authenticated users to manage their own child profiles

  3. Indexes
    - Add index on user_id for fast lookups
*/

-- Create child_profiles table
CREATE TABLE IF NOT EXISTS child_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('boy', 'girl')),
  avatar text DEFAULT '👶',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_child_profiles_user_id ON child_profiles(user_id);

-- Enable RLS
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for child_profiles
CREATE POLICY "Users can view own child profiles"
  ON child_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own child profiles"
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