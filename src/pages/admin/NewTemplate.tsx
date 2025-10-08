import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../../components/Navbar'
import { supabase } from '../../lib/supabase'
import { BookOpen, Upload, Save, ArrowLeft, Loader2, X, ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export function NewTemplate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('')
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    coverImageUrl: '',
    jsonUrlBoy: '',
    jsonUrlGirl: '',
    tags: '',
    gender: 'unisex',
    priceEur: '3.99',
    isPublished: true,
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploadingImage(true)

    try {
      const fileExt = file.name.split('.').pop()
      const uniqueFileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = uniqueFileName

      const { error: uploadError } = await supabase.storage
        .from('template-covers')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('template-covers')
        .getPublicUrl(filePath)

      setUploadedImageUrl(publicUrl)
      toast.success('Image uploaded successfully!')
    } catch (err) {
      console.error('Error uploading image:', err)
      toast.error('Failed to upload cover image')
      setUploadedImageUrl('')
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = async () => {
    if (uploadedImageUrl) {
      try {
        const fileName = uploadedImageUrl.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('template-covers')
            .remove([fileName])
        }
      } catch (err) {
        console.error('Error removing image:', err)
      }
    }
    setUploadedImageUrl('')
    setFormData((prev) => ({ ...prev, coverImageUrl: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const coverImageUrl = uploadedImageUrl || formData.coverImageUrl || null

      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const { error } = await supabase.from('story_templates').insert({
        slug: formData.slug,
        title: formData.title,
        description: formData.description || null,
        cover_image_url: coverImageUrl,
        json_url_boy: formData.jsonUrlBoy || null,
        json_url_girl: formData.jsonUrlGirl || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        price_eur: parseFloat(formData.priceEur),
        is_published: formData.isPublished,
      })

      if (error) throw error

      toast.success('Template created successfully!')
      navigate('/admin/dashboard')
    } catch (err) {
      console.error('Error creating template:', err)
      toast.error('Failed to create template. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Story Template
              </h1>
              <p className="text-gray-600 mt-1">
                Create a new personalized story template for customers
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Adventure in Space"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="adventure-in-space"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly identifier (lowercase, hyphens only)
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="A thrilling adventure through the cosmos where your child becomes the hero..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="unisex">Unisex</option>
                    <option value="boy">Boy</option>
                    <option value="girl">Girl</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="priceEur"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Price (EUR) *
                  </label>
                  <input
                    type="number"
                    id="priceEur"
                    name="priceEur"
                    required
                    step="0.01"
                    min="0"
                    value={formData.priceEur}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="tags"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="adventure, space, exploration"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated tags for categorization
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-blue-600" />
              Cover Image
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Cover Image
                </label>

                {uploadingImage ? (
                  <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-8 flex flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-3" />
                    <span className="text-sm font-medium text-blue-700">
                      Uploading image...
                    </span>
                  </div>
                ) : uploadedImageUrl ? (
                  <div className="relative">
                    <img
                      src={uploadedImageUrl}
                      alt="Cover preview"
                      className="w-full h-64 object-cover rounded-lg border-2 border-green-300"
                    />
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                      <span>✓</span>
                      <span>Uploaded</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="coverImage"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="coverImage"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-12 w-12 text-gray-400 mb-3" />
                      <span className="text-sm font-medium text-gray-700 mb-1">
                        Click to upload cover image
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG up to 5MB
                      </span>
                    </label>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Or provide a URL below if you prefer
                </p>
              </div>

              <div>
                <label
                  htmlFor="coverImageUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cover Image URL (Alternative)
                </label>
                <input
                  type="url"
                  id="coverImageUrl"
                  name="coverImageUrl"
                  value={formData.coverImageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-blue-600" />
              Story JSON URLs
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="jsonUrlBoy"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  JSON URL (Boy Version) *
                </label>
                <input
                  type="url"
                  id="jsonUrlBoy"
                  name="jsonUrlBoy"
                  required
                  value={formData.jsonUrlBoy}
                  onChange={handleChange}
                  placeholder="https://example.com/story-boy.json"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL to the story template JSON file for boys
                </p>
              </div>

              <div>
                <label
                  htmlFor="jsonUrlGirl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  JSON URL (Girl Version) *
                </label>
                <input
                  type="url"
                  id="jsonUrlGirl"
                  name="jsonUrlGirl"
                  required
                  value={formData.jsonUrlGirl}
                  onChange={handleChange}
                  placeholder="https://example.com/story-girl.json"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL to the story template JSON file for girls
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Publishing Options
            </h2>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
              </div>
              <div className="ml-3">
                <label
                  htmlFor="isPublished"
                  className="block text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Publish template immediately
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Unpublished templates will not be visible to customers
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-600">
              {loading || uploadingImage ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span>
                    {uploadingImage ? 'Uploading image...' : 'Creating template...'}
                  </span>
                </span>
              ) : (
                'Ready to create template'
              )}
            </p>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                disabled={loading || uploadingImage}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading || uploadingImage ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{uploadingImage ? 'Uploading...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
