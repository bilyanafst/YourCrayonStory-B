import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ChildProfile } from '../types/database'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export function useChildProfiles() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<ChildProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProfiles()
      loadSelectedProfile()
    } else {
      setProfiles([])
      setSelectedProfile(null)
      setLoading(false)
    }
  }, [user])

  const fetchProfiles = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setProfiles(data || [])

      if (data && data.length > 0 && !selectedProfile) {
        const savedProfileId = localStorage.getItem('selectedChildProfileId')
        const profileToSelect = savedProfileId
          ? data.find(p => p.id === savedProfileId) || data[0]
          : data[0]
        setSelectedProfile(profileToSelect)
      }
    } catch (err) {
      console.error('Error fetching child profiles:', err)
      toast.error('Failed to load child profiles')
    } finally {
      setLoading(false)
    }
  }

  const loadSelectedProfile = () => {
    const savedProfileId = localStorage.getItem('selectedChildProfileId')
    if (savedProfileId && profiles.length > 0) {
      const profile = profiles.find(p => p.id === savedProfileId)
      if (profile) {
        setSelectedProfile(profile)
      }
    }
  }

  const selectProfile = (profile: ChildProfile | null) => {
    setSelectedProfile(profile)
    if (profile) {
      localStorage.setItem('selectedChildProfileId', profile.id)
      toast.success(`Now customizing for ${profile.name}`)
    } else {
      localStorage.removeItem('selectedChildProfileId')
    }
  }

  const addProfile = async (name: string, gender: 'boy' | 'girl', avatar: string = '👶') => {
    if (!user) {
      toast.error('Please sign in to add child profiles')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('child_profiles')
        .insert({
          user_id: user.id,
          name,
          gender,
          avatar,
        })
        .select()
        .single()

      if (error) throw error

      setProfiles(prev => [...prev, data])
      setSelectedProfile(data)
      localStorage.setItem('selectedChildProfileId', data.id)
      toast.success(`Added ${name}'s profile!`)
      return data
    } catch (err) {
      console.error('Error adding child profile:', err)
      toast.error('Failed to add child profile')
      return null
    }
  }

  const updateProfile = async (id: string, updates: Partial<Pick<ChildProfile, 'name' | 'gender' | 'avatar'>>) => {
    if (!user) return false

    try {
      const { data, error } = await supabase
        .from('child_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setProfiles(prev => prev.map(p => p.id === id ? data : p))
      if (selectedProfile?.id === id) {
        setSelectedProfile(data)
      }
      toast.success('Profile updated!')
      return true
    } catch (err) {
      console.error('Error updating child profile:', err)
      toast.error('Failed to update profile')
      return false
    }
  }

  const deleteProfile = async (id: string) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('child_profiles')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProfiles(prev => prev.filter(p => p.id !== id))
      if (selectedProfile?.id === id) {
        const remaining = profiles.filter(p => p.id !== id)
        setSelectedProfile(remaining.length > 0 ? remaining[0] : null)
        if (remaining.length > 0) {
          localStorage.setItem('selectedChildProfileId', remaining[0].id)
        } else {
          localStorage.removeItem('selectedChildProfileId')
        }
      }
      toast.success('Profile deleted')
      return true
    } catch (err) {
      console.error('Error deleting child profile:', err)
      toast.error('Failed to delete profile')
      return false
    }
  }

  return {
    profiles,
    selectedProfile,
    loading,
    selectProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    refreshProfiles: fetchProfiles,
  }
}
