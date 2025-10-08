import React from 'react'
import { useStoryTemplates } from '../hooks/useStoryTemplates'
import { useTemplateRatings } from '../hooks/useTemplateRatings'
import { StoryCard } from '../components/StoryCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { Navbar } from '../components/Navbar'

export function Home() {
  const { data: templates = [], isLoading, error } = useStoryTemplates()
  const templateSlugs = templates.map((t) => t.slug)
  const { getRating } = useTemplateRatings(templateSlugs)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Personalized Story
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose a story template and personalize it with your child's name, appearance, and preferences
          </p>
        </div>

        {error instanceof Error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg inline-block">
              {error.message}
            </div>
          </div>
        )}

        {!error && templates.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No story templates available at the moment.</p>
          </div>
        )}

        {!error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            ) : (
              templates.map((template) => {
                const rating = getRating(template.slug)
                return (
                  <StoryCard
                    key={template.id}
                    template={template}
                    averageRating={rating?.averageRating}
                    totalReviews={rating?.totalReviews}
                  />
                )
              })
            )}
          </div>
        )}
      </main>
    </div>
  )
}