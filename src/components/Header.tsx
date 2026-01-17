import { Link } from 'react-router-dom'
import { useIsAuthenticated } from '@azure/msal-react'
import { useStore } from '../store/useStore'
import { signIn, signOut } from '../services/authService'

export default function Header() {
  const isAuthenticated = useIsAuthenticated()
  const { user } = useStore()

  const handleSignIn = async () => {
    try {
      const { user: newUser } = await signIn()
      const { setUser, setAuthenticated } = useStore.getState()
      setUser(newUser)
      setAuthenticated(true)
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      const { setUser, setAuthenticated } = useStore.getState()
      setUser(null)
      setAuthenticated(false)
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        {/* Logo/Icon - Left */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/SharePointImageStudioLogo.png"
            alt="SharePoint Image Studio Logo"
            className="w-16 h-16 object-contain"
          />
          <span className="font-semibold text-gray-900">SharePoint Image Studio</span>
        </Link>

        {/* Navigation - Right */}
        <div className="flex items-center gap-6">
          <Link to="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Pricing
          </Link>

          {isAuthenticated && user ? (
            <>
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.display_name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.subscription_tier} • {user.monthly_image_limit - user.monthly_images_used} images left
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleSignIn}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Login
              </button>
              <button
                onClick={handleSignIn}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-colors"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
