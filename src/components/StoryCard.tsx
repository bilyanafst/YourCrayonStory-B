import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Tag, Star } from 'lucide-react'
import { StoryTemplate } from '../types/database'

interface StoryCardProps {
  template: StoryTemplate
  averageRating?: number
  totalReviews?: number
}

export function StoryCard({ template, averageRating, totalReviews }: StoryCardProps) {
  return (
    <Link
      to={`/story/${template.slug}`}
      className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden">
        {template.cover_image_url ? (
          <img
            src={template.cover_image_url}
            alt={template.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-white" />
          </div>
        )}
        {averageRating && totalReviews && totalReviews > 0 && (
          <div className="absolute top-2 right-2 bg-white bg-opacity-95 px-2 py-1 rounded-lg shadow-md flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-600">({totalReviews})</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
          {template.title}
        </h3>
        
        {template.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {template.description}
          </p>
        )}
        
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {template.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{template.tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-indigo-600">
            €{template.price_eur?.toFixed(2) || '0.00'}
          </span>
          <span className="text-sm font-medium text-indigo-600 group-hover:text-indigo-800 transition-colors">
            Personalize →
          </span>
        </div>
      </div>
    </Link>
  )
}