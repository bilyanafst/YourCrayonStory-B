import React, { useState, useEffect } from 'react'
import { X, Star, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  templateSlug: string
  childName: string
  orderId?: string
  existingReview?: {
    id: string
    rating: number
    feedback: string | null
  } | null
  onReviewSubmitted: () => void
}

export function ReviewModal({
  isOpen,
  onClose,
  templateSlug,
  childName,
  orderId,
  existingReview,
  onReviewSubmitted,
}: ReviewModalProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating)
      setFeedback(existingReview.feedback || '')
    } else {
      setRating(0)
      setFeedback('')
    }
  }, [existingReview, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    if (!user) {
      toast.error('You must be logged in to leave a review')
      return
    }

    setLoading(true)

    try {
      if (existingReview) {
        const { error } = await supabase
          .from('story_reviews')
          .update({
            rating,
            feedback: feedback.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReview.id)

        if (error) throw error

        toast.success('Review updated successfully!')
      } else {
        const { error } = await supabase
          .from('story_reviews')
          .insert({
            user_id: user.id,
            template_slug: templateSlug,
            child_name: childName,
            rating,
            feedback: feedback.trim() || null,
            order_id: orderId || null,
          })

        if (error) throw error

        toast.success('Thanks for your feedback!')
      }

      onReviewSubmitted()
      onClose()
    } catch (err: any) {
      console.error('Error submitting review:', err)
      if (err.message?.includes('duplicate key')) {
        toast.error('You have already reviewed this story')
      } else {
        toast.error('Failed to submit review. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!existingReview) return

    if (!confirm('Are you sure you want to delete this review?')) {
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('story_reviews')
        .delete()
        .eq('id', existingReview.id)

      if (error) throw error

      toast.success('Review deleted')
      onReviewSubmitted()
      onClose()
    } catch (err) {
      console.error('Error deleting review:', err)
      toast.error('Failed to delete review')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {existingReview ? 'Edit Review' : 'Leave a Review'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              How would you rate the story for <span className="font-semibold">{childName}</span>?
            </p>

            <div className="flex items-center justify-center space-x-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-none text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <p className="text-center text-sm text-gray-600">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="feedback"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              What did you or your child enjoy most? (Optional)
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="Share your experience with this story..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {feedback.length}/500 characters
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {existingReview && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-3 border-2 border-red-300 rounded-lg text-red-700 font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{existingReview ? 'Update Review' : 'Submit Review'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
