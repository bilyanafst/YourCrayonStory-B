export interface StoryTemplate {
  id: string
  slug: string
  title: string
  description: string | null
  cover_image_url: string | null
  gender: 'boy' | 'girl' | 'unisex'
  preview_json: any
  tags: string[] | null
  price_eur: number | null
  is_published: boolean | null
  created_at: string | null
}

export interface StoryPage {
  page_number: number
  text: string
  image_url?: string
  image_base64?: string
}

export interface StoryData {
  title: string
  pages: StoryPage[]
}

export interface CartItem {
  templateId: string
  slug: string
  title: string
  childName: string
  gender: 'boy' | 'girl'
  price: number
  coverImage: string | null
}