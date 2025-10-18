/*
  # Create Storage Bucket for Template Covers

  1. New Storage Bucket
    - `template-covers`
      - Public access for reading
      - Authenticated admins can upload
      - Admin-only delete permissions

  2. Security Policies
    - Public can view all cover images
    - Only admins can upload cover images
    - Only admins can delete cover images

  3. Storage Configuration
    - Max file size: 5MB
    - Allowed file types: images
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'template-covers',
  'template-covers',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view template covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'template-covers');

CREATE POLICY "Admins can upload template covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'template-covers'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can update template covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'template-covers'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can delete template covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'template-covers'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);