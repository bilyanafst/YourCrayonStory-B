import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../../components/Navbar'
import { supabase } from '../../lib/supabase'
import { BookOpen, Upload, Save, ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function NewTemplate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    coverImageUrl: '',
    jsonUrlBoy: '',
    jsonUrlGirl: '',
    tags: '',
    priceEur: '3.99',
    isPublished: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const { error } = await supabase.from('story_templates').insert({
        slug: formData.slug,
        title: formData.title,
        description: formData.description || null,
        cover_image_url: formData.coverImageUrl || null,
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="A thrilling adventure through the cosmos..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-blue-600" />
              Assets & URLs
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="coverImageUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cover Image URL
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

              <div>
                <label
                  htmlFor="jsonUrlBoy"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Story JSON URL (Boy Version)
                </label>
                <input
                  type="url"
                  id="jsonUrlBoy"
                  name="jsonUrlBoy"
                  value={formData.jsonUrlBoy}
                  onChange={handleChange}
                  placeholder="https://example.com/story-boy.json"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="jsonUrlGirl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Story JSON URL (Girl Version)
                </label>
                <input
                  type="url"
                  id="jsonUrlGirl"
                  name="jsonUrlGirl"
                  value={formData.jsonUrlGirl}
                  onChange={handleChange}
                  placeholder="https://example.com/story-girl.json"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Publishing Options
            </h2>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isPublished"
                className="ml-2 block text-sm text-gray-700"
              >
                Publish template immediately
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Unpublished templates will not be visible to customers
            </p>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Create Template</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
