export interface CartItem {
  id: string
  slug: string
  title: string
  price: number
  quantity: number
  childName?: string
  gender?: string
  coverImage?: string
}