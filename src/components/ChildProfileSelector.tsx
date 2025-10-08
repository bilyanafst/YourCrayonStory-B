import React from 'react'
import { Plus, Settings } from 'lucide-react'
import { ChildProfile } from '../types/database'

interface ChildProfileSelectorProps {
  profiles: ChildProfile[]
  selectedProfile: ChildProfile | null
  onSelectProfile: (profile: ChildProfile) => void
  onAddChild: () => void
  onManage?: () => void
  loading?: boolean
}

export function ChildProfileSelector({
  profiles,
  selectedProfile,
  onSelectProfile,
  onAddChild,
  onManage,
  loading = false,
}: ChildProfileSelectorProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-pulse text-gray-400">Loading profiles...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Select Child</h3>
        {profiles.length > 0 && onManage && (
          <button
            onClick={onManage}
            className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Manage</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => onSelectProfile(profile)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
              selectedProfile?.id === profile.id
                ? profile.gender === 'boy'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <span className="text-xl">{profile.avatar}</span>
            <span className="font-medium">{profile.name}</span>
          </button>
        ))}

        <button
          onClick={onAddChild}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">Add Child</span>
        </button>
      </div>

      {profiles.length === 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          <p className="mb-2">No child profiles yet</p>
          <p>Add your first child to get started!</p>
        </div>
      )}
    </div>
  )
}
