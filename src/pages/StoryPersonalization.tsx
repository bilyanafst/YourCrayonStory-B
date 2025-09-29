import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Heart, ShoppingCart, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { StoryTemplate, StoryData, CartItem } from '../types/database'

export function StoryPersonalization() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  
  const [template, setTemplate] = useState<StoryTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [childName, setChildName] = useState('')
  const [gender, setGender] = useState<'boy' | 'girl'>('boy')
  const [storyData, setStoryData] = useState<StoryData | null>(null)
  const [loadingStory, setLoadingStory] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchTemplate()
    }
  }, [slug])

  const fetchTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('story_templates')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (error) throw error
      if (!data) throw new Error('Story template not found')
      
      setTemplate(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch template')
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = async () => {
    if (!template || !childName.trim()) return

    setLoadingStory(true)
    try {
      // For demo purposes, we'll use the preview_json from the database
      // In a real app, you'd fetch from json_url_boy or json_url_girl
      const storyJson = template.preview_json as StoryData
      
      // Replace placeholder names with the child's name
      const personalizedStory = {
        ...storyJson,
        pages: storyJson.pages.map(page => ({
          ...page,
          text: page.text.replace(/\[CHILD_NAME\]/g, childName)
        }))
      }
      
      setStoryData(personalizedStory)
      setShowPreview(true)
    } catch (err) {
      setError('Failed to load story preview')
    } finally {
      setLoadingStory(false)
    }
  }

  const addToCart = () => {
    if (!template || !childName.trim()) return

    const cartItem: CartItem = {
      templateId: template.id,
      slug: template.slug,
      title: template.title,
      childName: childName.trim(),
      gender,
      price: template.price_eur || 0,
      coverImage: template.cover_image_url
    }

    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    // Check if item already exists
    const existingIndex = existingCart.findIndex(
      (item: CartItem) => item.templateId === cartItem.templateId && 
                          item.childName === cartItem.childName &&
                          item.gender === cartItem.gender
    )

    if (existingIndex >= 0) {
      // Update existing item
      existingCart[existingIndex] = cartItem
    } else {
      // Add new item
      existingCart.push(cartItem)
    }

    localStorage.setItem('cart', JSON.stringify(existingCart))
    
    // Show success message or redirect to cart
    alert('Added to cart! You can continue shopping or proceed to checkout.')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="text-gray-600">Loading story template...</span>
        </div>
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Story Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested story template could not be found.'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Stories
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Stories</span>
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

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {!showPreview ? (
          /* Personalization Form */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Story Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {template.cover_image_url && (
                  <img
                    src={template.cover_image_url}
                    alt={template.title}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{template.title}</h1>
                  {template.description && (
                    <p className="text-gray-600 mb-4">{template.description}</p>
                  )}
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Personalization Form */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Personalize Your Story</h2>
                
                <div className="space-y-6">
                  {/* Child's Name */}
                  <div>
                    <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-2">
                      Child's Name
                    </label>
                    <div className="relative">
                      <input
                        id="childName"
                        type="text"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your child's name"
                      />
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Gender Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose Character
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setGender('boy')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          gender === 'boy'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">👦</div>
                          <span className="font-medium">Boy</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('girl')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          gender === 'girl'
                            ? 'border-pink-500 bg-pink-50 text-pink-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">👧</div>
                          <span className="font-medium">Girl</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Preview Button */}
                  <button
                    onClick={handlePreview}
                    disabled={!childName.trim() || loadingStory}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {loadingStory ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading Preview...</span>
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4" />
                        <span>Preview Story</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">Price:</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    €{template.price_eur?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Story Preview */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowPreview(false)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Personalization</span>
              </button>
              <button
                onClick={addToCart}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {storyData?.title} - {childName}'s Story
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {storyData?.pages.map((page, index) => (
                  <div key={index} className="relative bg-gray-50 rounded-lg p-4">
                    <div className="aspect-square bg-white rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                      {page.image_url ? (
                        <img
                          src={page.image_url}
                          alt={`Page ${page.page_number}`}
                          className="w-full h-full object-cover"
                        />
                      ) : page.image_base64 ? (
                        <img
                          src={`data:image/png;base64,${page.image_base64}`}
                          alt={`Page ${page.page_number}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <div className="text-4xl mb-2">📖</div>
                          <span>Page {page.page_number}</span>
                        </div>
                      )}
                      
                      {/* Watermark */}
                      <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
                        <div className="bg-white bg-opacity-80 px-3 py-1 rounded text-sm font-medium text-gray-700">
                          PREVIEW
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {page.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}