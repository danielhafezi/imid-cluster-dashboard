'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') {
      return 'bg-primary-700 text-white border-primary-500'
    }
    return pathname.startsWith(path) && path !== '/' 
      ? 'bg-primary-700 text-white border-primary-500' 
      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700 border-transparent'
  }
  
  return (
    <nav className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center text-xl font-bold text-primary-700 hover:text-primary-800 transition-colors">
                <span className="bg-primary-700 text-white p-1 rounded mr-2">IMID</span>
                Dashboard
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/" 
                className={`${isActive('/')} inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors duration-150`}
              >
                Home
              </Link>
              <Link 
                href="/patients" 
                className={`${isActive('/patients')} inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors duration-150`}
              >
                Patients
              </Link>
              <Link 
                href="/patients/dashboard" 
                className={`${isActive('/patients/dashboard')} inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors duration-150`}
              >
                Dashboard
              </Link>
              <Link 
                href="/conditions" 
                className={`${isActive('/conditions')} inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors duration-150`}
              >
                Conditions
              </Link>
              <Link 
                href="/medications" 
                className={`${isActive('/medications')} inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors duration-150`}
              >
                Medications
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-primary-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden shadow-lg">
          <div className="pt-2 pb-3 space-y-1 bg-white">
            <Link 
              href="/" 
              className={`${isActive('/')} block px-3 py-2 rounded-md text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/patients" 
              className={`${isActive('/patients')} block px-3 py-2 rounded-md text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              Patients
            </Link>
            <Link 
              href="/patients/dashboard" 
              className={`${isActive('/patients/dashboard')} block px-3 py-2 rounded-md text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/conditions" 
              className={`${isActive('/conditions')} block px-3 py-2 rounded-md text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              Conditions
            </Link>
            <Link 
              href="/medications" 
              className={`${isActive('/medications')} block px-3 py-2 rounded-md text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              Medications
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
} 