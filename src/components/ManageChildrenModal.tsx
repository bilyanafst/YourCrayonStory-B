import React, { useState } from 'react'
import { X, Edit2, Trash2, Save, XCircle } from 'lucide-react'
import { ChildProfile } from '../types/database'

interface ManageChildrenModalProps {
  isOpen: boolean
  onClose: () => void
  profiles: ChildProfile[]
  onUpdate: (id: string, updates: Partial<Pick<ChildProfile, 'name' | 'gender' | 'avatar'>>) => Promise<boolean>
  onDelete: (id: string) => Promise<boolean>
}

const AVATAR_OPTIONS = {
  boy: ['👦', '🧒', '👶', '🦸‍♂️', '🧑', '👨', '🤴', '🧙‍♂️'],
  girl: ['👧', '🧒', '👶', '🦸‍♀️', '🧑', '👩', '👸', '🧙‍♀️'],
}

export function ManageChildrenModal({ isOpen, onClose, profiles, onUpdate, onDelete }: ManageChildrenModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editGender, setEditGender] = useState<'boy' | 'girl'>('boy')
  const [editAvatar, setEditAvatar] = useState('')
  const [loading, setLoading] = useState(false)

  const startEdit = (profile: ChildProfile) => {
    setEditingId(profile.id)
    setEditName(profile.name)
    setEditGender(profile.gender)
    setEditAvatar(profile.avatar)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditGender('boy')
    setEditAvatar('')
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return

    setLoading(true)
    const success = await onUpdate(id, {
      name: editName.trim(),
      gender: editGender,
      avatar: editAvatar,
    })
    setLoading(false)

    if (success) {
      cancelEdit()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}'s profile? This will not delete their saved stories.`)) {
      return
    }

    setLoading(true)
    const success = await onDelete(id)
    setLoading(false)

    if (success && editingId === id) {
      cancelEdit()
    }
  }

  const handleGenderChange = (newGender: 'boy' | 'girl') => {
    setEditGender(newGender)
    if (!AVATAR_OPTIONS[newGender].includes(editAvatar)) {
      setEditAvatar(AVATAR_OPTIONS[newGender][0])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Manage Children</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {profiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No children added yet.</p>
                <p className="text-sm mt-2">Add your first child to get started!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    {editingId === profile.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter name..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <label
                              className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                editGender === 'boy'
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="editGender"
                                value="boy"
                                checked={editGender === 'boy'}
                                onChange={() => handleGenderChange('boy')}
                                className="sr-only"
                              />
                              <span className="text-xl mr-2">👦</span>
                              <span className="text-sm font-medium">Boy</span>
                            </label>
                            <label
                              className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                editGender === 'girl'
                                  ? 'border-pink-600 bg-pink-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="editGender"
                                value="girl"
                                checked={editGender === 'girl'}
                                onChange={() => handleGenderChange('girl')}
                                className="sr-only"
                              />
                              <span className="text-xl mr-2">👧</span>
                              <span className="text-sm font-medium">Girl</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Avatar
                          </label>
                          <div className="grid grid-cols-8 gap-2">
                            {AVATAR_OPTIONS[editGender].map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => setEditAvatar(emoji)}
                                className={`p-2 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                                  editAvatar === emoji
                                    ? editGender === 'boy'
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-pink-500 bg-pink-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleUpdate(profile.id)}
                            disabled={!editName.trim() || loading}
                            className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Save className="h-4 w-4" />
                            <span>Save Changes</span>
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{profile.avatar}</span>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{profile.name}</h4>
                            <p className="text-sm text-gray-500">
                              {profile.gender === 'boy' ? '👦 Boy' : '👧 Girl'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(profile)}
                            disabled={loading}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Edit profile"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(profile.id, profile.name)}
                            disabled={loading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete profile"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={onClose}
                className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
