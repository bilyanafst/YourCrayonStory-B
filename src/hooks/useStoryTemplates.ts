import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { StoryTemplate } from '../types/database'

async function fetchStoryTemplates(): Promise<StoryTemplate[]> {
  const { data, error } = await supabase
    .from('story_templates')
    .select('id, slug, title, description, cover_image_url, price_eur, tags, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data || []
}

export function useStoryTemplates() {
  return useQuery({
    queryKey: ['story-templates'],
    queryFn: fetchStoryTemplates,
  })
}
