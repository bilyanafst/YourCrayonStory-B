import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, ShoppingCart, Loader2 } from 'lucide-react'
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

  // Use specific Supabase project URL for watermark
  const watermarkUrl = 'https://juaspoktmirevmmmvdtt.supabase.co/storage/v1/object/public/assets/watermark.png'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!template || !childName.trim()) return

    setLoadingStory(true)
    setError(null)

    try {
      // Get the appropriate JSON URL based on gender
      const jsonUrl = gender === 'boy' ? template.json_url_boy : template.json_url_girl
      
      if (!jsonUrl) {
        throw new Error(`Story data not available for ${gender}`)
      }

      // Fetch the JSON file
      const response = await fetch(jsonUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch story data')
      }

      const storyJson = await response.json() as StoryData
      
      // Replace placeholder names with the child's name in story text
      const personalizedStory = {
        ...storyJson,
        pages: storyJson.pages.map(page => ({
          ...page,
          text: page.text.replace(/\[CHILD_NAME\]/g, childName.trim())
        }))
      }
      
      setStoryData(personalizedStory)
      setShowPreview(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load story data')
    } finally {
      setLoadingStory(false)
    }
  }

  const addToCart = () => {
    if (!template || !childName.trim()) return

    const cartItem: CartItem = {
      slug: template.slug,
      title: template.title,
      childName: childName.trim(),
      gender,
      price: template.price_eur || 0,
      coverImage: template.cover_image_url
    }

    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    // Check if item already exists (same slug, name, and gender)
    const existingIndex = existingCart.findIndex(
      (item: CartItem) => item.slug === cartItem.slug && 
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
    
    // Show success feedback
    alert(`"${template.title}" for ${childName} has been added to your cart!`)
  }

  // Prevent right-click on images
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
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

  if (error && !template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Story Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
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
          /* Story Details and Form */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Story Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {template?.cover_image_url && (
                  <img
                    src={template.cover_image_url}
                    alt={template.title}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{template?.title}</h1>
                  {template?.description && (
                    <p className="text-gray-600 mb-4">{template.description}</p>
                  )}
                  {template?.tags && template.tags.length > 0 && (
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
                
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        required
                      />
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Gender Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose Character
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="gender"
                          value="boy"
                          checked={gender === 'boy'}
                          onChange={(e) => setGender(e.target.value as 'boy' | 'girl')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-900">👦 Boy</span>
                      </label>
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="gender"
                          value="girl"
                          checked={gender === 'girl'}
                          onChange={(e) => setGender(e.target.value as 'boy' | 'girl')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-900">👧 Girl</span>
                      </label>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!childName.trim() || loadingStory}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {loadingStory ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading Story...</span>
                      </>
                    ) : (
                      <span>Preview Story</span>
                    )}
                  </button>
                </form>
              </div>

              {/* Price */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">Price:</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    €{template?.price_eur?.toFixed(2) || '0.00'}
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
                {template?.title} - {childName}'s Story
              </h2>
              
              {/* Story Pages - Vertical List */}
              <div className="space-y-8">
                {storyData?.pages.map((page, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <div className="text-center mb-4">
                      <span className="text-sm font-medium text-gray-500">Page {page.page_number}</span>
                    </div>
                    
                    {/* Image with Watermark */}
                    <div className="relative mb-6 max-w-md mx-auto">
                      <img
                        src={`data:image/png;base64,${page.image_base64}`}
                        alt={`Page ${page.page_number}`}
                        className="w-full rounded-lg shadow-md select-none"
                        onContextMenu={handleContextMenu}
                        draggable={false}
                        style={{ userSelect: 'none' }}
                      />
                      
                      {/* Watermark Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <img
                          src={watermarkUrl}
                          alt="Watermark"
                          className="max-w-[60%] max-h-[60%] opacity-40"
                          style={{ 
                            mixBlendMode: 'multiply',
                            userSelect: 'none',
                            pointerEvents: 'none'
                          }}
                          onError={(e) => {
                            // Fallback to text watermark if image fails to load
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              const textWatermark = document.createElement('div')
                              textWatermark.textContent = 'PREVIEW'
                              textWatermark.className = 'text-gray-600 text-2xl font-bold opacity-40 select-none'
                              textWatermark.style.userSelect = 'none'
                              parent.appendChild(textWatermark)
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Story Text */}
                    <div className="text-center">
                      <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
                        {page.text}
                      </p>
                    </div>
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