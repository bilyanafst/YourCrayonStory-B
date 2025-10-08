import React from 'react'
import { Link } from 'react-router-dom'
import { User, LogOut, BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { CartIcon } from './CartIcon'
import { SearchBar } from './SearchBar'

interface NavbarProps {
  showSearch?: boolean
}

export function Navbar({ showSearch = true }: NavbarProps) {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <img
              src="/YourCrayonStory.png"
              alt="Your Crayon Story"
              className="h-10 w-10"
            />
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Your Crayon Story</h1>
          </Link>

          {showSearch && (
            <div className="flex-1 max-w-2xl mx-4">
              <SearchBar />
            </div>
          )}

          <div className="flex items-center space-x-4 flex-shrink-0">
            {user ? (
              <>
                <CartIcon />
                <Link
                  to="/my-stories"
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">My Stories</span>
                </Link>
                <Link
                  to="/auth/profile"
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <CartIcon />
                <Link
                  to="/auth/login"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
