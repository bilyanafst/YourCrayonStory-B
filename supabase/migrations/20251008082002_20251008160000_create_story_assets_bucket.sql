/*
  # Create Storage Bucket for Story Assets

  1. New Storage Bucket
    - `story-assets`
      - Public access for reading
      - Authenticated users can upload
      - Admin-only delete permissions

  2. Security Policies
    - Public can view all files
    - Authenticated users can upload to their folders
    - Only admins can delete files

  3. Storage Configuration
    - Max file size: 5MB
    - Allowed file types: images
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'story-assets',
  'story-assets',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view story assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'story-assets');

CREATE POLICY "Authenticated users can upload story assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'story-assets');

CREATE POLICY "Admins can update story assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'story-assets'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can delete story assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'story-assets'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
