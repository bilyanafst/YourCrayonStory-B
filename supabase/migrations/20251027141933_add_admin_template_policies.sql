/*
  # Add Admin Policies for Story Templates

  ## Changes
    - Add policies for admin users to manage story templates
    - Admins can insert, update, and delete story templates

  ## Security
    - Only users with is_admin = true can manage templates
    - Regular users can only view published templates
*/

-- Allow admins to insert templates
CREATE POLICY "Admins can insert templates"
  ON story_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Allow admins to update templates
CREATE POLICY "Admins can update templates"
  ON story_templates FOR UPDATE
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

-- Allow admins to delete templates
CREATE POLICY "Admins can delete templates"
  ON story_templates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
