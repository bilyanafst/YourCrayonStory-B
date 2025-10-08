import React, { useState } from 'react'
import { X } from 'lucide-react'

interface AddChildModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (name: string, gender: 'boy' | 'girl', avatar: string) => Promise<void>
}

const AVATAR_OPTIONS = {
  boy: ['👦', '🧒', '👶', '🦸‍♂️', '🧑', '👨', '🤴', '🧙‍♂️'],
  girl: ['👧', '🧒', '👶', '🦸‍♀️', '🧑', '👩', '👸', '🧙‍♀️'],
}

export function AddChildModal({ isOpen, onClose, onAdd }: AddChildModalProps) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'boy' | 'girl'>('boy')
  const [avatar, setAvatar] = useState('👦')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await onAdd(name.trim(), gender, avatar)
      setName('')
      setGender('boy')
      setAvatar('👦')
      onClose()
    } catch (err) {
      console.error('Error adding child:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenderChange = (newGender: 'boy' | 'girl') => {
    setGender(newGender)
    setAvatar(AVATAR_OPTIONS[newGender][0])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Child Profile</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-2">
                  Child's Name
                </label>
                <input
                  id="childName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter name..."
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      gender === 'boy'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value="boy"
                      checked={gender === 'boy'}
                      onChange={() => handleGenderChange('boy')}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-2">👦</span>
                    <span className="text-sm font-medium text-gray-900">Boy</span>
                  </label>
                  <label
                    className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      gender === 'girl'
                        ? 'border-pink-600 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value="girl"
                      checked={gender === 'girl'}
                      onChange={() => handleGenderChange('girl')}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-2">👧</span>
                    <span className="text-sm font-medium text-gray-900">Girl</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Avatar
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {AVATAR_OPTIONS[gender].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                        avatar === emoji
                          ? gender === 'boy'
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

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Child'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
