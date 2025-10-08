/*
  # Add Child Profile Support to Existing Tables

  1. Changes
    - Add `child_profile_id` to `saved_stories` table
    - Add `child_profile_id` to `orders` table
    - Both columns are nullable to support backward compatibility

  2. Indexes
    - Add indexes on child_profile_id for faster queries

  3. Notes
    - Nullable to allow existing records without child profiles
    - Can be populated retroactively by users later
*/

-- Add child_profile_id to saved_stories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'saved_stories' AND column_name = 'child_profile_id'
  ) THEN
    ALTER TABLE saved_stories ADD COLUMN child_profile_id uuid REFERENCES child_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add child_profile_id to orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'child_profile_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN child_profile_id uuid REFERENCES child_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_stories_child_profile_id ON saved_stories(child_profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_child_profile_id ON orders(child_profile_id);
