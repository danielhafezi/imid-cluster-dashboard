import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

async function getPatientDetails(id: string) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        conditions: true,
        medications: true,
        encounters: true,
        _count: {
          select: {
            conditions: true,
            medications: true,
            encounters: true,
          },
        },
      },
    });

    if (!patient) {
      return null;
    }

    return patient;
  } catch (error) {
    console.error(`Error fetching patient ${id}:`, error);
    return null;
  }
}

export default async function PatientDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const patient = await getPatientDetails(params.id);

  if (!patient) {
    notFound();
  }

  // Function to remove numbers from names
  const cleanName = (name: string | null) => {
    if (!name) return '';
    return name.replace(/\d+/g, '');
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-700">Patient Details</h1>
        <Link
          href="/patients"
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
        >
          Back to Patient Directory
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Demographics</h2>
            <div className="space-y-2">
              <p><span className="font-medium">ID:</span> {patient.id}</p>
              <p><span className="font-medium">Name:</span> {cleanName(patient.first)} {cleanName(patient.last)}</p>
              <p><span className="font-medium">Birthdate:</span> {new Date(patient.birthdate).toLocaleDateString()}</p>
              <p><span className="font-medium">Gender:</span> {patient.gender}</p>
              <p><span className="font-medium">Race:</span> {patient.race}</p>
              <p><span className="font-medium">Ethnicity:</span> {patient.ethnicity}</p>
              {patient.deathdate && (
                <p><span className="font-medium">Deceased:</span> {new Date(patient.deathdate).toLocaleDateString()}</p>
              )}
              {patient.clusterId !== null && (
                <p><span className="font-medium">Cluster ID:</span> {patient.clusterId}</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Conditions:</span> {patient._count.conditions}</p>
              <p><span className="font-medium">Medications:</span> {patient._count.medications}</p>
              <p><span className="font-medium">Encounters:</span> {patient._count.encounters}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Conditions</h2>
          {patient.conditions.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patient.conditions.map((condition) => (
                  <tr key={condition.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{condition.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{condition.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(condition.start).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {condition.stop ? new Date(condition.stop).toLocaleDateString() : 'Active'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No conditions recorded</p>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Medications</h2>
          {patient.medications.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patient.medications.map((medication) => (
                  <tr key={medication.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medication.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medication.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(medication.start).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {medication.stop ? new Date(medication.stop).toLocaleDateString() : 'Active'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No medications recorded</p>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Encounters</h2>
          {patient.encounters.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patient.encounters.map((encounter) => (
                  <tr key={encounter.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{encounter.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{encounter.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{encounter.reasonCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(encounter.start).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No encounters recorded</p>
          )}
        </div>
      </div>
    </div>
  );
} 