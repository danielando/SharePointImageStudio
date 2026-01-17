import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Loader } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface AuthProps {
  onAuthSuccess: (userId: string) => void
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          onAuthSuccess(data.user.id)
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          onAuthSuccess(data.user.id)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })

      if (error) throw error

      setMagicLinkSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link')
    } finally {
      setIsLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-charcoal-950 bg-grid-pattern flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-charcoal-900 rounded-xl p-8 shadow-2xl text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-charcoal-400 mb-6">
            We've sent a magic link to <strong className="text-white">{email}</strong>
          </p>
          <button
            onClick={() => {
              setMagicLinkSent(false)
              setEmail('')
            }}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            Use a different email
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-950 bg-grid-pattern flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            SharePoint Image Studio
          </h1>
          <p className="text-charcoal-400">
            AI-powered images for SharePoint sites
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-charcoal-900 rounded-xl p-8 shadow-2xl">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`
                flex-1 py-2 px-4 rounded-lg font-semibold transition-colors
                ${isLogin
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-charcoal-800 text-charcoal-400 hover:text-white'
                }
              `}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`
                flex-1 py-2 px-4 rounded-lg font-semibold transition-colors
                ${!isLogin
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-charcoal-800 text-charcoal-400 hover:text-white'
                }
              `}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="
                    w-full pl-10 pr-4 py-3 bg-charcoal-800
                    border border-charcoal-700 rounded-lg
                    text-white placeholder-charcoal-500
                    focus:outline-none focus:ring-2 focus:ring-purple-500
                  "
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="
                    w-full pl-10 pr-4 py-3 bg-charcoal-800
                    border border-charcoal-700 rounded-lg
                    text-white placeholder-charcoal-500
                    focus:outline-none focus:ring-2 focus:ring-purple-500
                  "
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-3 rounded-lg font-semibold
                bg-gradient-to-r from-purple-600 to-blue-600
                text-white shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Signing up...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Sign Up'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-charcoal-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-charcoal-900 text-charcoal-500">Or</span>
            </div>
          </div>

          <button
            onClick={handleMagicLink}
            disabled={isLoading || !email}
            className="
              w-full py-3 rounded-lg font-semibold
              bg-charcoal-800 text-white
              hover:bg-charcoal-700
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            <Mail className="w-5 h-5" />
            Send Magic Link
          </button>

          <p className="mt-6 text-center text-xs text-charcoal-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  )
}
