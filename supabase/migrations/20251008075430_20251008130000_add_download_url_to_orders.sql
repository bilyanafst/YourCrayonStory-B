/*
  # Add PDF Download URL to Orders

  1. Changes
    - Add `download_url` column to `orders` table
    - This will store the link to the purchased PDF in Supabase Storage

  2. Notes
    - Nullable to support existing orders without PDFs
    - Will be populated after successful payment processing
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'download_url'
  ) THEN
    ALTER TABLE orders ADD COLUMN download_url text;
  END IF;
END $$;
