import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer className="border-t mt-auto bg-white">
      <div className="container py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} PetCare Manager. All rights reserved.
          </p>

          <nav className="flex flex-wrap gap-4 justify-center">
            <Link 
              to="/legal/privacy" 
              className="text-sm text-gray-600 hover:text-green-600 hover:underline"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-400">•</span>
            <Link 
              to="/legal/terms" 
              className="text-sm text-gray-600 hover:text-green-600 hover:underline"
            >
              Terms of Service
            </Link>
            <span className="text-gray-400">•</span>
            <a 
              href="mailto:support@petcaremanager.com"
              className="text-sm text-gray-600 hover:text-green-600 hover:underline"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
