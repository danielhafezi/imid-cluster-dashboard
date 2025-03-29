import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '../components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IMID Cluster Dashboard',
  description: 'Dashboard for Immune-Mediated Inflammatory Disease patient data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <Navbar />
        <main className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">{children}</main>
        <footer className="bg-white shadow-inner mt-8 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              IMID Cluster Dashboard - Prototype for Research Purposes Only
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
} 