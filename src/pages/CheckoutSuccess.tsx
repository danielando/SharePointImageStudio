import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import Header from '../components/Header'
import { useStore } from '../store/useStore'

export default function CheckoutSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: _user } = useStore()
  const [countdown, setCountdown] = useState(10)

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Countdown timer for redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Thank you for upgrading your plan.
          </p>
          <p className="text-gray-500">
            Your subscription is being processed. Your new credits will be available shortly.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <p className="text-sm text-gray-500 mb-2">Session ID</p>
          <p className="text-xs font-mono text-gray-400 break-all">{sessionId}</p>
        </div>

        <div className="text-gray-600">
          <p>Redirecting to homepage in <span className="font-bold text-gray-900">{countdown}</span> seconds...</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 hover:text-blue-800 underline"
          >
            Go to homepage now
          </button>
        </div>
      </div>
    </div>
  )
}
