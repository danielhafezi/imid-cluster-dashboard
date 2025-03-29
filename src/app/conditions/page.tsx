import Link from 'next/link'
import prisma from '../../lib/prisma'

export const dynamic = 'force-dynamic'

async function getConditions() {
  const conditions = await prisma.condition.findMany({
    take: 100, // Limit to 100 conditions for performance
    orderBy: {
      id: 'asc'
    },
    include: {
      patient: true
    }
  })
  return conditions
}

export default async function ConditionsPage() {
  const conditions = await getConditions()
  
  // Group conditions by description
  const conditionsByDescription = conditions.reduce((acc, condition) => {
    const description = condition.description || 'Unknown'
    if (!acc[description]) {
      acc[description] = []
    }
    acc[description].push(condition)
    return acc
  }, {} as Record<string, typeof conditions>)

  // Sort by number of occurrences
  const sortedConditions = Object.entries(conditionsByDescription)
    .sort((a, b) => b[1].length - a[1].length)
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-700">Conditions</h1>
        <Link 
          href="/"
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <h2 className="text-xl font-semibold mb-4">IMID Conditions Distribution</h2>
        
        <div className="space-y-4">
          {sortedConditions.map(([description, conditions]) => (
            <div key={description} className="border-b pb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{description}</h3>
                <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                  {conditions.length} patients
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                <p>Code: {conditions[0].code}</p>
                <p>System: {conditions[0].system}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 