import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useIsAuthenticated } from '@azure/msal-react'
import { User, SwitchCamera, Menu, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { signIn, signOut } from '../services/authService'
import SignInModal from './SignInModal'

export default function Header() {
  const isAuthenticated = useIsAuthenticated()
  const { user } = useStore()
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleSignIn = () => {
    signIn()
    setShowMobileMenu(false)
  }

  const handleSignOut = () => {
    signOut()
    setShowMobileMenu(false)
  }

  const getCreditBalance = () => {
    if (!user) return 0
    return user.image_balance ?? 0
  }

  const formatCredits = (credits: number) => {
    if (credits === Math.floor(credits)) {
      return credits.toString()
    }
    return credits.toFixed(1)
  }

  return (
    <header className="bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo - Left */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <SwitchCamera className="w-6 h-6 text-black" />
          <span className="text-lg sm:text-xl font-semibold text-black hidden sm:inline">SharePoint Image Studio</span>
          <span className="text-lg font-semibold text-black sm:hidden">SP Studio</span>
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1">
          {isAuthenticated && user ? (
            <>
              {/* Tier Badge */}
              <div className={`px-3 py-2 rounded-full text-sm font-medium ${
                user.subscription_tier === 'pro'
                  ? 'bg-purple-100 text-purple-700'
                  : user.subscription_tier === 'basic'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {user.subscription_tier.toUpperCase()}
              </div>

              <Link
                to="/pricing"
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                Pricing
              </Link>

              {/* User Info - Clickable to Profile */}
              <Link
                to="/profile"
                className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                  <p className="text-xs text-gray-500">
                    {formatCredits(getCreditBalance())} credit{getCreditBalance() !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              </Link>

              <button
                onClick={handleSignOut}
                className="hidden md:block px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/pricing"
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                Pricing
              </Link>
              <button
                onClick={handleSignIn}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => setShowSignInModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
              >
                Sign up
              </button>
            </>
          )}
        </nav>

        {/* Mobile: User avatar + Menu button */}
        <div className="flex md:hidden items-center gap-2 flex-shrink-0">
          {isAuthenticated && user && (
            <Link to="/profile" className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{formatCredits(getCreditBalance())} cr</span>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            </Link>
          )}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {showMobileMenu ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="px-4 py-3 space-y-1">
            {isAuthenticated && user ? (
              <>
                {/* User info */}
                <div className="px-3 py-3 border-b border-gray-100 mb-2">
                  <p className="font-medium text-gray-900">{user.name || user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.subscription_tier === 'pro'
                        ? 'bg-purple-100 text-purple-700'
                        : user.subscription_tier === 'basic'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.subscription_tier.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatCredits(getCreditBalance())} credits
                    </span>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Profile
                </Link>
                <Link
                  to="/pricing"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Pricing
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/pricing"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Pricing
                </Link>
                <button
                  onClick={handleSignIn}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setShowSignInModal(true)
                    setShowMobileMenu(false)
                  }}
                  className="block w-full text-center px-3 py-2 mt-2 bg-blue-600 text-white font-medium rounded-lg"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sign In Modal */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
      />
    </header>
  )
}
