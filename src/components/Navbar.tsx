'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') {
      return true
    }
    return pathname.startsWith(path) && path !== '/'
  }
  
  return (
    <nav className="bg-background border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center text-xl font-bold text-primary hover:text-primary/90 transition-colors">
                <span className="bg-primary text-primary-foreground p-1 rounded mr-2">IMID</span>
                Dashboard
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-2">
              <Link 
                href="/" 
                className={cn(
                  "inline-flex items-center px-3 py-2 text-sm font-medium transition-colors",
                  isActive('/') 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Home
              </Link>
              <Link 
                href="/patients" 
                className={cn(
                  "inline-flex items-center px-3 py-2 text-sm font-medium transition-colors",
                  isActive('/patients') 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Patients
              </Link>
              <Link 
                href="/patients/dashboard" 
                className={cn(
                  "inline-flex items-center px-3 py-2 text-sm font-medium transition-colors",
                  isActive('/patients/dashboard') 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Dashboard
              </Link>
              <Link 
                href="/conditions" 
                className={cn(
                  "inline-flex items-center px-3 py-2 text-sm font-medium transition-colors",
                  isActive('/conditions') 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Conditions
              </Link>
              <Link 
                href="/medications" 
                className={cn(
                  "inline-flex items-center px-3 py-2 text-sm font-medium transition-colors",
                  isActive('/medications') 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                Medications
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="ghost"
              size="icon"
              className="text-foreground"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden shadow-lg">
          <div className="py-2 bg-background border-t">
            <Link 
              href="/" 
              className={cn(
                "block px-4 py-2 text-sm font-medium",
                isActive('/') 
                  ? "bg-primary/10 text-primary" 
                  : "text-foreground hover:bg-accent/50"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/patients" 
              className={cn(
                "block px-4 py-2 text-sm font-medium",
                isActive('/patients') 
                  ? "bg-primary/10 text-primary" 
                  : "text-foreground hover:bg-accent/50"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              Patients
            </Link>
            <Link 
              href="/patients/dashboard" 
              className={cn(
                "block px-4 py-2 text-sm font-medium",
                isActive('/patients/dashboard') 
                  ? "bg-primary/10 text-primary" 
                  : "text-foreground hover:bg-accent/50"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/conditions" 
              className={cn(
                "block px-4 py-2 text-sm font-medium",
                isActive('/conditions') 
                  ? "bg-primary/10 text-primary" 
                  : "text-foreground hover:bg-accent/50"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              Conditions
            </Link>
            <Link 
              href="/medications" 
              className={cn(
                "block px-4 py-2 text-sm font-medium",
                isActive('/medications') 
                  ? "bg-primary/10 text-primary" 
                  : "text-foreground hover:bg-accent/50"
              )}
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