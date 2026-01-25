import { Link } from 'react-router-dom'
import { SwitchCamera } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo and Copyright - Left */}
          <div className="flex items-center gap-2">
            <SwitchCamera className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              © {currentYear} SharePoint Image Studio
            </span>
          </div>

          {/* Links - Right */}
          <nav className="flex items-center gap-6">
            <Link
              to="/pricing"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/privacy"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/contact"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
