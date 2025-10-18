/*
  # Add performance index for story_templates query

  1. Performance Optimization
    - Add composite index on (is_published, created_at DESC)
    - Optimizes the most common query: published stories ordered by date
    - Improves query performance as the number of templates grows

  2. Notes
    - The DESC ordering on created_at matches the query pattern
    - This index supports both filtering and sorting in a single operation
    - Safe to add with IF NOT EXISTS to prevent duplicate index errors
*/

CREATE INDEX IF NOT EXISTS idx_story_templates_published_created_at 
ON story_templates (is_published, created_at DESC);