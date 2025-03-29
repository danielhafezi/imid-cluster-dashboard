import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto p-6 text-center">
      <h2 className="text-3xl font-bold text-primary-700 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-6">The page you are looking for doesn't exist or has been moved.</p>
      <Link 
        href="/"
        className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
} 