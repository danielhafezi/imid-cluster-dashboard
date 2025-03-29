import Link from 'next/link'
import prisma from '../../lib/prisma'

export const dynamic = 'force-dynamic'

async function getMedications() {
  const medications = await prisma.medication.findMany({
    take: 50, // Limit to 50 medications for performance
    orderBy: {
      id: 'asc'
    },
    include: {
      patient: true
    }
  })
  return medications
}

export default async function MedicationsPage() {
  const medications = await getMedications()
  
  // Group medications by description
  const medicationsByDescription = medications.reduce((acc, medication) => {
    const description = medication.description || 'Unknown'
    if (!acc[description]) {
      acc[description] = []
    }
    acc[description].push(medication)
    return acc
  }, {} as Record<string, typeof medications>)

  // Sort by number of occurrences
  const sortedMedications = Object.entries(medicationsByDescription)
    .sort((a, b) => b[1].length - a[1].length)
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-700">Medications</h1>
        <Link 
          href="/"
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <h2 className="text-xl font-semibold mb-4">Most Common Medications</h2>
        
        <div className="space-y-4">
          {sortedMedications.map(([description, meds]) => (
            <div key={description} className="border-b pb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{description}</h3>
                <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                  {meds.length} patients
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Start dates range from {new Date(meds[0].start).toLocaleDateString()} 
                to {new Date(meds[meds.length - 1].start).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 