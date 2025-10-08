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

export interface GiftInfo {
  recipientName: string
  recipientEmail: string
  message?: string
  sendAt?: string
}

export interface ChildProfile {
  id: string
  user_id: string
  name: string
  gender: 'boy' | 'girl'
  avatar: string
  created_at: string
  updated_at: string
}

export interface CartItem {
  slug: string
  title: string
  childName: string
  gender: 'boy' | 'girl'
  price: number
  coverImage: string | null
  childProfileId?: string
  giftInfo?: GiftInfo
}

export interface Order {
  id: string
  user_id: string
  stripe_session_id: string | null
  cart_data: CartItem[]
  delivery_email: string
  total_amount: number
  status: 'pending' | 'completed' | 'failed'
  is_gift: boolean
  gift_data: Record<string, GiftInfo> | null
  child_profile_id: string | null
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
  child_profile_id: string | null
  created_at: string
  updated_at: string
}

export interface GiftedStory {
  id: string
  sender_user_id: string
  order_id: string | null
  recipient_email: string
  recipient_name: string
  message: string | null
  send_at: string
  story_data: StoryData
  template_slug: string
  template_title: string
  child_name: string
  gender: 'boy' | 'girl'
  cover_image_url: string | null
  pdf_url: string | null
  is_sent: boolean
  sent_at: string | null
  created_at: string
  updated_at: string
}