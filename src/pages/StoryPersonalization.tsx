import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { User, Loader2, Save, BookMarked, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { StoryTemplate, StoryData, CartItem } from '../types/database'
import { CartModal } from '../components/CartModal'
import { Navbar } from '../components/Navbar'
import { ChildProfileSelector } from '../components/ChildProfileSelector'
import { AddChildModal } from '../components/AddChildModal'
import { ManageChildrenModal } from '../components/ManageChildrenModal'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../contexts/AuthContext'
import { useDebounce } from '../hooks/useDebounce'
import { useChildProfiles } from '../hooks/useChildProfiles'
import toast from 'react-hot-toast'

interface OriginalPageType {
  image: string
  caption: string
}

interface StoryPage {
  page_number: number
  image_base64: string
  text: string
}

export function StoryPersonalization() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { profiles, selectedProfile, loading: profilesLoading, selectProfile, addProfile, updateProfile, deleteProfile } = useChildProfiles()

  const [template, setTemplate] = useState<StoryTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [childName, setChildName] = useState('')
  const [gender, setGender] = useState<'boy' | 'girl'>('boy')
  const [storyArray, setStoryArray] = useState<OriginalPageType[]>([])
  const [personalizedPages, setPersonalizedPages] = useState<StoryPage[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)
  const [showAddChildModal, setShowAddChildModal] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)
  const [savedStoryId, setSavedStoryId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const debouncedChildName = useDebounce(childName, 300)
  const watermarkUrl = `${import.meta.env.SUPABASE_URL}/storage/v1/object/public/assets/watermark.png`

  useEffect(() => {
    if (slug) {
      fetchTemplate()
    }
    const savedId = searchParams.get('savedId')
    if (savedId) {
      setSavedStoryId(savedId)
      loadSavedStory(savedId)
    }
  }, [slug, searchParams, fetchTemplate])

  useEffect(() => {
    if (template) {
      loadStoryData()
    }
  }, [template, gender])

  useEffect(() => {
    if (storyArray.length > 0) {
      updatePreview()
    }
  }, [debouncedChildName, storyArray])

  useEffect(() => {
    if (selectedProfile) {
      setChildName(selectedProfile.name)
      setGender(selectedProfile.gender)
    }
  }, [selectedProfile])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (personalizedPages.length === 0) return

      if (e.key === 'ArrowLeft') {
        setCurrentPage(prev => Math.max(0, prev - 1))
      } else if (e.key === 'ArrowRight') {
        setCurrentPage(prev => Math.min(personalizedPages.length - 1, prev + 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [personalizedPages.length])

  const loadSavedStory = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('saved_stories')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (data) {
        setChildName(data.child_name)
        setGender(data.gender)
        setIsSaved(true)
        toast.success('Loaded saved story')
      }
    } catch (err) {
      console.error('Error loading saved story:', err)
      toast.error('Failed to load saved story')
    }
  }

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

  const loadStoryData = async () => {
    if (!template) return

    setLoadingPreview(true)
    try {
      const jsonUrl = gender === 'boy' ? template.json_url_boy : template.json_url_girl

      if (!jsonUrl) {
        throw new Error(`Story data not available for ${gender}`)
      }

      const response = await fetch(jsonUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch story data')
      }

      const data = await response.json() as OriginalPageType[]
      setStoryArray(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load story data')
    } finally {
      setLoadingPreview(false)
    }
  }

  const updatePreview = () => {
    const displayName = debouncedChildName.trim() || '____'

    const updatedPages = storyArray.map((page, index) => ({
      page_number: index + 1,
      image_base64: page.image.replace(/^data:image\/(png|jpeg);base64,/, ''),
      text: page.caption
        .replace(/\{\{name\}\}/gi, displayName)
        .replace(/\{name\}/gi, displayName)
        .replace(/\[CHILD_NAME\]/gi, displayName)
    }))

    setPersonalizedPages(updatedPages)
  }

  const handleSaveStory = async () => {
    if (!template || !childName.trim() || personalizedPages.length === 0 || !user) {
      if (!user) {
        toast.error('Please sign in to save stories')
        localStorage.setItem('redirectAfterLogin', `/story/${slug}`)
        navigate('/auth/login')
      }
      return
    }

    const storyData: StoryData = { pages: personalizedPages }

    setIsSaving(true)
    try {
      if (savedStoryId) {
        const { error } = await supabase
          .from('saved_stories')
          .update({
            child_name: childName.trim(),
            gender,
            story_data: storyData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', savedStoryId)

        if (error) throw error
        toast.success('Story updated successfully!')
      } else {
        const { data, error } = await supabase
          .from('saved_stories')
          .insert({
            user_id: user.id,
            template_slug: template.slug,
            title: template.title,
            child_name: childName.trim(),
            gender,
            story_data: storyData,
            cover_image_url: template.cover_image_url,
            is_purchased: false,
            child_profile_id: selectedProfile?.id || null,
          })
          .select()
          .single()

        if (error) throw error
        if (data) {
          setSavedStoryId(data.id)
          toast.success('Story saved successfully!')
        }
      }
      setIsSaved(true)
    } catch (err) {
      console.error('Error saving story:', err)
      toast.error('Failed to save story')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddToCart = () => {
    if (!template || !childName.trim()) {
      toast.error('Please enter a child name')
      return
    }

    const cartItem: CartItem = {
      slug: template.slug,
      title: template.title,
      childName: childName.trim(),
      gender,
      price: template.price_eur || 0,
      coverImage: template.cover_image_url,
      childProfileId: selectedProfile?.id || undefined
    }

    addToCart(cartItem)
    setShowCartModal(true)
  }

  const handleCheckout = () => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', '/checkout')
    }
    setShowCartModal(false)
    navigate('/checkout')
  }

  const handleContinueBrowsing = () => {
    setShowCartModal(false)
    navigate('/')
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(personalizedPages.length - 1, prev + 1))
  }

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Stories
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Editor */}
          <div className="space-y-6">
            {/* Child Profile Selector */}
            {user && (
              <ChildProfileSelector
                profiles={profiles}
                selectedProfile={selectedProfile}
                onSelectProfile={selectProfile}
                onAddChild={() => setShowAddChildModal(true)}
                onManage={() => setShowManageModal(true)}
                loading={profilesLoading}
              />
            )}

            {/* Story Info Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {template?.cover_image_url && (
                <img
                  src={template.cover_image_url}
                  alt={template.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{template?.title}</h1>
                {template?.description && (
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                )}
                {template?.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Personalization Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Live Personalization</h2>

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
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Type to see live preview..."
                    />
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Updates preview in real-time as you type</p>
                </div>

                {/* Gender Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose Character
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      gender === 'boy'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="gender"
                        value="boy"
                        checked={gender === 'boy'}
                        onChange={(e) => setGender(e.target.value as 'boy' | 'girl')}
                        className="sr-only"
                      />
                      <span className="text-2xl mr-2">👦</span>
                      <span className="text-sm font-medium text-gray-900">Boy</span>
                    </label>
                    <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      gender === 'girl'
                        ? 'border-pink-600 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="gender"
                        value="girl"
                        checked={gender === 'girl'}
                        onChange={(e) => setGender(e.target.value as 'boy' | 'girl')}
                        className="sr-only"
                      />
                      <span className="text-2xl mr-2">👧</span>
                      <span className="text-sm font-medium text-gray-900">Girl</span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4">
                  {user && (
                    <button
                      onClick={handleSaveStory}
                      disabled={isSaving || !childName.trim() || personalizedPages.length === 0}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : isSaved ? (
                        <>
                          <BookMarked className="h-5 w-5" />
                          <span>Update Saved Story</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>Save for Later</span>
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={handleAddToCart}
                    disabled={!childName.trim() || personalizedPages.length === 0}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add to Cart - €{template?.price_eur?.toFixed(2) || '0.00'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Live Preview */}
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900 text-center">
                  Live Preview {childName && `- ${childName}'s Story`}
                </h2>
              </div>

              {loadingPreview ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="text-gray-600">Loading preview...</span>
                  </div>
                </div>
              ) : personalizedPages.length > 0 ? (
                <>
                  {/* Preview Content */}
                  <div className="flex-1 overflow-auto relative bg-gray-100 p-4">
                    <div className="min-h-full flex items-center justify-center relative">
                      <div className="relative bg-white shadow-xl rounded-lg overflow-hidden max-w-md w-full min-h-[600px] p-8">
                        {/* Page Content */}
                        <div className="relative flex flex-col space-y-6">
                          {/* Page Number */}
                          <div className="text-center">
                            <span className="text-xs font-medium text-gray-500">
                              Page {personalizedPages[currentPage].page_number} of {personalizedPages.length}
                            </span>
                          </div>

                          {/* Image */}
                          <div className="flex items-center justify-center">
                            <img
                              src={`data:image/png;base64,${personalizedPages[currentPage].image_base64}`}
                              alt={`Page ${personalizedPages[currentPage].page_number}`}
                              className="max-w-full h-auto object-contain select-none"
                              onContextMenu={handleContextMenu}
                              draggable={false}
                              style={{ userSelect: 'none', maxHeight: '350px' }}
                            />
                          </div>

                          {/* Story Text */}
                          <div className="text-center px-4">
                            <p className="text-base text-gray-900 leading-relaxed font-medium">
                              {personalizedPages[currentPage].text}
                            </p>
                          </div>
                        </div>

                        {/* Watermark - On top of everything */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                          <img
                            src={watermarkUrl}
                            alt="Watermark"
                            className="w-full h-full object-contain"
                            style={{
                              opacity: 0.25,
                              pointerEvents: 'none',
                              userSelect: 'none',
                              mixBlendMode: 'multiply',
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const parent = target.parentElement
                              if (parent) {
                                const textWatermark = document.createElement('div')
                                textWatermark.textContent = 'PREVIEW'
                                textWatermark.className = 'text-gray-400 text-6xl font-bold opacity-40 select-none absolute inset-0 flex items-center justify-center'
                                textWatermark.style.userSelect = 'none'
                                textWatermark.style.transform = 'rotate(-45deg)'
                                textWatermark.style.mixBlendMode = 'multiply'
                                parent.appendChild(textWatermark)
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="p-4 border-t bg-gray-50">
                    {/* Arrow Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 0}
                        className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-700" />
                      </button>

                      <span className="text-sm font-medium text-gray-700">
                        Page {currentPage + 1} / {personalizedPages.length}
                      </span>

                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === personalizedPages.length - 1}
                        className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-700" />
                      </button>
                    </div>

                    {/* Page Dots Navigation */}
                    <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                      {personalizedPages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`flex-shrink-0 w-2 h-2 rounded-full transition-all ${
                            i === currentPage
                              ? 'bg-blue-600 w-6'
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                          aria-label={`Go to page ${i + 1}`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-center text-gray-500 mt-2">
                      Use ← → arrow keys to navigate
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📖</div>
                    <p className="text-gray-600">
                      Enter a name and select a character to see your personalized story
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        onCheckout={handleCheckout}
        onContinueBrowsing={handleContinueBrowsing}
        bookTitle={template?.title || ''}
        childName={childName}
      />

      {/* Add Child Modal */}
      <AddChildModal
        isOpen={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        onAdd={addProfile}
      />

      {/* Manage Children Modal */}
      <ManageChildrenModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        profiles={profiles}
        onUpdate={updateProfile}
        onDelete={deleteProfile}
      />
    </div>
  )
}
