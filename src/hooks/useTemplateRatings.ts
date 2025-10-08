import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface TemplateRating {
  templateSlug: string
  averageRating: number
  totalReviews: number
}

export function useTemplateRatings(templateSlugs: string[]) {
  const [ratings, setRatings] = useState<Record<string, TemplateRating>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (templateSlugs.length === 0) {
      setLoading(false)
      return
    }

    fetchRatings()
  }, [templateSlugs.join(',')])

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('story_reviews')
        .select('template_slug, rating')
        .in('template_slug', templateSlugs)

      if (error) throw error

      const ratingsMap: Record<string, TemplateRating> = {}

      data?.forEach((review) => {
        if (!ratingsMap[review.template_slug]) {
          ratingsMap[review.template_slug] = {
            templateSlug: review.template_slug,
            averageRating: 0,
            totalReviews: 0,
          }
        }
        ratingsMap[review.template_slug].averageRating += review.rating
        ratingsMap[review.template_slug].totalReviews += 1
      })

      Object.keys(ratingsMap).forEach((slug) => {
        const rating = ratingsMap[slug]
        rating.averageRating = rating.averageRating / rating.totalReviews
      })

      setRatings(ratingsMap)
    } catch (error) {
      console.error('Error fetching ratings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRating = (templateSlug: string) => {
    return ratings[templateSlug] || null
  }

  return { ratings, loading, getRating }
}
