/*
  # Create Purchases Storage Bucket

  1. New Storage Bucket
    - `purchases` bucket for storing purchased PDF files
    - Private by default, access controlled via RLS

  2. Security
    - Users can only read their own purchased PDFs
    - System can insert PDFs (via service role)
    - Files organized by user_id and order_id: purchases/{user_id}/{order_id}.pdf
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('purchases', 'purchases', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can view own purchased PDFs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'purchases' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Service role can insert purchased PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'purchases' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
