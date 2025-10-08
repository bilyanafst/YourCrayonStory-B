import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { StoryTemplate } from '../types/database'

interface SearchSuggestion {
  id: string
  slug: string
  title: string
  cover_image_url?: string
  tags?: string[]
  matchType: 'title' | 'tag'
  matchedTag?: string
}

const MAX_SUGGESTIONS = 5
const MAX_RECENT_SEARCHES = 3
const RECENT_SEARCHES_KEY = 'recentSearches'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored))
      } catch (error) {
        console.error('Error parsing recent searches:', error)
      }
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setSelectedIndex(-1)
      return
    }

    const searchStories = async () => {
      setIsSearching(true)
      try {
        const { data, error } = await supabase
          .from('story_templates')
          .select('id, slug, title, cover_image_url, tags')
          .eq('is_published', true)

        if (error) throw error

        const searchTerm = query.toLowerCase().trim()
        const results: SearchSuggestion[] = []

        data?.forEach((template: StoryTemplate) => {
          const titleMatch = template.title.toLowerCase().includes(searchTerm)

          if (titleMatch) {
            results.push({
              id: template.id,
              slug: template.slug,
              title: template.title,
              cover_image_url: template.cover_image_url,
              tags: template.tags,
              matchType: 'title',
            })
          }

          template.tags?.forEach((tag) => {
            if (
              tag.toLowerCase().includes(searchTerm) &&
              !results.some((r) => r.id === template.id)
            ) {
              results.push({
                id: template.id,
                slug: template.slug,
                title: template.title,
                cover_image_url: template.cover_image_url,
                tags: template.tags,
                matchType: 'tag',
                matchedTag: tag,
              })
            }
          })
        })

        setSuggestions(results.slice(0, MAX_SUGGESTIONS))
      } catch (error) {
        console.error('Search error:', error)
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimeout = setTimeout(searchStories, 300)
    return () => clearTimeout(debounceTimeout)
  }, [query])

  const saveRecentSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return

    const updated = [
      trimmed,
      ...recentSearches.filter((s) => s !== trimmed),
    ].slice(0, MAX_RECENT_SEARCHES)

    setRecentSearches(updated)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  }

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    saveRecentSearch(query)
    setQuery('')
    setShowSuggestions(false)
    setSuggestions([])
    navigate(`/story/${suggestion.slug}`)
  }

  const handleRecentSearchClick = (search: string) => {
    setQuery(search)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text

    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} className="bg-yellow-200 font-semibold">
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    )
  }

  const showRecents = !query.trim() && recentSearches.length > 0 && showSuggestions

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search stories by title or topic..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>

      {showSuggestions && (showRecents || suggestions.length > 0 || (query.trim() && !isSearching)) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
        >
          {showRecents && (
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center justify-between px-2 py-1 mb-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">Recent Searches</span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-md transition-colors text-left"
                >
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{search}</span>
                </button>
              ))}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md transition-colors text-left ${
                    selectedIndex === index
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {suggestion.cover_image_url && (
                    <img
                      src={suggestion.cover_image_url}
                      alt={suggestion.title}
                      className="h-12 w-12 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {highlightMatch(suggestion.title, query)}
                    </div>
                    {suggestion.tags && suggestion.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {suggestion.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              suggestion.matchedTag === tag
                                ? 'bg-blue-100 text-blue-700 font-semibold'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {suggestion.matchedTag === tag
                              ? highlightMatch(tag, query)
                              : tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {query.trim() && !isSearching && suggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No matches found. Try another word!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
