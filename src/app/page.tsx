import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h1 className="text-4xl font-bold text-primary-700 mb-4">IMID Cluster Dashboard</h1>
        <p className="text-xl text-gray-600 mb-4">Immune-Mediated Inflammatory Disease Patient Insights</p>
        <p className="text-gray-600 mb-6">
          This dashboard provides interactive visualization of patient clusters for Rheumatoid Arthritis 
          and Lupus cases, with AI-powered insights on patient characteristics.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/patients/dashboard" className="px-5 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-150 shadow-sm">
            View Dashboard
          </Link>
          <Link href="/patients" className="px-5 py-2 bg-white border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors duration-150 shadow-sm">
            Browse Patients
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/patients" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-150 transform hover:-translate-y-1 border-t-4 border-primary-600">
          <h2 className="text-xl font-semibold text-primary-600 mb-2">Patient Directory</h2>
          <p className="text-gray-600">Browse and search patient records with detailed information.</p>
        </Link>

        <Link href="/patients/dashboard" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-150 transform hover:-translate-y-1 border-t-4 border-primary-600">
          <h2 className="text-xl font-semibold text-primary-600 mb-2">Patient Dashboard</h2>
          <p className="text-gray-600">View interactive patient cluster visualization with AI-generated insights.</p>
        </Link>

        <Link href="/conditions" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-150 transform hover:-translate-y-1 border-t-4 border-primary-600">
          <h2 className="text-xl font-semibold text-primary-600 mb-2">Conditions</h2>
          <p className="text-gray-600">Explore conditions and their distribution across patient clusters.</p>
        </Link>

        <Link href="/medications" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-150 transform hover:-translate-y-1 border-t-4 border-primary-600">
          <h2 className="text-xl font-semibold text-primary-600 mb-2">Medications</h2>
          <p className="text-gray-600">View medications and treatment patterns across different patient groups.</p>
        </Link>

        <div className="block p-6 bg-white rounded-lg shadow-md border-t-4 border-green-600">
          <h2 className="text-xl font-semibold text-primary-600 mb-2">System Status</h2>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <p className="text-gray-600">Database: Connected</p>
          </div>
          <div className="flex items-center gap-2 text-sm mt-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <p className="text-gray-600">AI Services: Available</p>
          </div>
          <p className="text-gray-500 text-sm mt-2">Last update: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="block p-6 bg-white rounded-lg shadow-md border-t-4 border-blue-600">
          <h2 className="text-xl font-semibold text-primary-600 mb-2">About</h2>
          <p className="text-gray-600 mb-2">
            This is a prototype application demonstrating visualization of IMID patient clusters.
          </p>
          <p className="text-gray-600">
            Research purposes only. Data is synthetic and not representative of real patients.
          </p>
        </div>
      </div>
    </div>
  )
} 