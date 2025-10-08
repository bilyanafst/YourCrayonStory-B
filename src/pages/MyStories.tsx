import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Edit, Trash2, ShoppingCart, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { SavedStory } from '../types/database'
import toast from 'react-hot-toast'
import { useCart } from '../hooks/useCart'

export function MyStories() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [stories, setStories] = useState<SavedStory[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchSavedStories()
    }
  }, [user])

  const fetchSavedStories = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_stories')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setStories(data || [])
    } catch (error) {
      console.error('Error fetching saved stories:', error)
      toast.error('Failed to load your stories')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this saved story?')) {
      return
    }

    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('saved_stories')
        .delete()
        .eq('id', id)

      if (error) throw error

      setStories(stories.filter((story) => story.id !== id))
      toast.success('Story deleted successfully')
    } catch (error) {
      console.error('Error deleting story:', error)
      toast.error('Failed to delete story')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (story: SavedStory) => {
    navigate(`/story/${story.template_slug}?savedId=${story.id}`)
  }

  const handleAddToCart = (story: SavedStory) => {
    addToCart({
      slug: story.template_slug,
      title: story.title,
      childName: story.child_name,
      gender: story.gender,
      price: 3.99,
      coverImage: story.cover_image_url,
    })
    toast.success('Added to cart!')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your saved stories</p>
          <Link
            to="/auth/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>
            <div className="flex items-center space-x-3">
              <img
                src="/YourCrayonStory.png"
                alt="Your Crayon Story"
                className="h-8 w-8"
              />
              <span className="font-bold text-gray-900">Your Crayon Story</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BookOpen className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">My Saved Stories</h1>
          </div>
          <p className="text-xl text-gray-600">
            Your personalized story drafts, ready to preview or purchase
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading your stories...</span>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-lg p-12 max-w-lg mx-auto">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Saved Stories Yet</h2>
              <p className="text-gray-600 mb-6">
                Start creating personalized stories and save them for later!
              </p>
              <Link
                to="/"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Browse Story Templates
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {story.cover_image_url && (
                  <img
                    src={story.cover_image_url}
                    alt={story.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {story.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        For: <span className="font-medium">{story.child_name}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {story.gender === 'boy' ? '👦 Boy' : '👧 Girl'} • Saved {formatDate(story.created_at)}
                      </p>
                    </div>
                    {story.is_purchased && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                        Purchased
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 mt-4">
                    <button
                      onClick={() => handleEdit(story)}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit & Preview</span>
                    </button>

                    {!story.is_purchased && (
                      <button
                        onClick={() => handleAddToCart(story)}
                        className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(story.id)}
                      disabled={deletingId === story.id}
                      className="w-full flex items-center justify-center space-x-2 border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === story.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
