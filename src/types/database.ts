export interface StoryTemplate {
  id: string
  slug: string
  title: string
  description: string | null
  cover_image_url: string | null
  json_url_boy: string | null
  json_url_girl: string | null
  tags: string[] | null
  price_eur: number | null
  is_published: boolean | null
  created_at: string | null
}