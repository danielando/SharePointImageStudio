import { X, Zap, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-orange-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            You're out of credits
          </h2>

          {/* Subtitle */}
          <p className="text-gray-500 text-center mb-8">
            Upgrade your plan to keep generating amazing images for SharePoint
          </p>

          {/* Plans preview */}
          <div className="space-y-3 mb-8">
            <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">Basic</span>
                <span className="text-blue-600 font-bold">$15/mo</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                <span>50 images per month</span>
              </div>
            </div>

            <div className="border-2 border-purple-300 rounded-xl p-4 bg-purple-50 relative">
              <div className="absolute -top-2 right-4 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                Popular
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">Pro</span>
                <span className="text-purple-600 font-bold">$49/mo</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>100 images per month</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>4K resolution</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade button */}
          <Link
            to="/pricing"
            onClick={onClose}
            className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors text-center"
          >
            View Plans
          </Link>

          {/* Maybe later */}
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm mt-3 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
