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

export interface StoryPage {
  page_number: number
  text: string
  image_base64: string
}

export interface StoryData {
  pages: StoryPage[]
}

export interface CartItem {
  slug: string
  title: string
  childName: string
  gender: 'boy' | 'girl'
  price: number
  coverImage: string | null
}

export interface Order {
  id: string
  user_id: string
  stripe_session_id: string | null
  cart_data: CartItem[]
  delivery_email: string
  total_amount: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface SavedStory {
  id: string
  user_id: string
  template_slug: string
  title: string
  child_name: string
  gender: 'boy' | 'girl'
  story_data: StoryData
  cover_image_url: string | null
  is_purchased: boolean
  created_at: string
  updated_at: string
}