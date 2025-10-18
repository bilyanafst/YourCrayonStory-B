/*
  # Create Analytics Tracking Tables

  1. New Tables
    - `analytics_events`
      - `id` (uuid, primary key)
      - `event_type` (text): 'page_view', 'cart_add', 'checkout_start', etc.
      - `session_id` (text): Anonymous session identifier
      - `user_id` (uuid, nullable): Logged-in user ID
      - `metadata` (jsonb): Additional event data
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `analytics_events` table
    - Only admins can read analytics events
    - Public insert for tracking (anonymous events)

  3. Views
    - Create helper views for common analytics queries
*/

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all analytics"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Public can insert analytics events"
  ON analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);

CREATE OR REPLACE VIEW analytics_summary AS
SELECT
  COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'page_view') as total_visitors,
  COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'checkout_start') as checkout_started,
  COUNT(*) FILTER (WHERE event_type = 'page_view') as total_page_views
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days';