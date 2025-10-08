/*
  # Add gift support to orders table

  1. Changes
    - Add `is_gift` (boolean) column to track if order contains gifts
    - Add `gift_data` (jsonb, nullable) column to store gift-specific information
      - Can contain recipient emails, messages, send dates per item

  2. Notes
    - This allows cart items to have optional gift information
    - Gift data is stored at the order level for reference
    - Actual gift records are in gifted_stories table
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'is_gift'
  ) THEN
    ALTER TABLE orders ADD COLUMN is_gift boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'gift_data'
  ) THEN
    ALTER TABLE orders ADD COLUMN gift_data jsonb;
  END IF;
END $$;
