'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import prisma from '../../../lib/prisma';
import { 
  User, 
  Calendar, 
  Fingerprint, 
  HeartPulse, 
  Map, 
  Pill, 
  Activity, 
  RefreshCw,
  ChevronLeft,
  CircleDashed
} from 'lucide-react';

interface Patient {
  id: string;
  first: string | null;
  last: string | null;
  birthdate: Date;
  gender: string;
  race: string;
  ethnicity: string;
  deathdate: Date | null;
  clusterId: number | null;
  conditions: any[];
  medications: any[];
  encounters: any[];
  _count: {
    conditions: number;
    medications: number;
    encounters: number;
  };
}

interface AISummary {
  clinicalSummary: string;
  possibleIssues: string;
  fullText: string;
}

export default function PatientDetailsPage() {
  const { id } = useParams() as { id: string };
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch patient data
  useEffect(() => {
    async function fetchPatientData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/patients/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to load patient data');
        }
        
        const data = await response.json();
        setPatient(data);
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchPatientData();
    }
  }, [id]);
  
  // Fetch AI summary
  useEffect(() => {
    async function fetchAiSummary() {
      try {
        setSummaryLoading(true);
        const response = await fetch(`/api/patients/${id}/summarize`);
        
        if (!response.ok) {
          throw new Error('Failed to generate AI summary');
        }
        
        const data = await response.json();
        setAiSummary(data.summary);
      } catch (err) {
        console.error('Error fetching AI summary:', err);
        // We don't set the main error state here to avoid blocking the page
      } finally {
        setSummaryLoading(false);
      }
    }
    
    if (patient) {
      fetchAiSummary();
    }
  }, [id, patient]);

  // Function to remove numbers from names
  const cleanName = (name: string | null) => {
    if (!name) return '';
    return name.replace(/\d+/g, '');
  };

  // Function to clean markdown artifacts
  const cleanMarkdown = (text: string) => {
    return text
      .replace(/^\*\*|\*\*$/gm, '')
      .replace(/\*\*\d+\.?$/gm, '')
      .replace(/\d+\.\s*$/gm, '')
      .trim();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p>{error || 'Patient not found'}</p>
        <Link
          href="/patients"
          className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
        >
          Back to Patient Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-700">Patient Details</h1>
        <Link
          href="/patients"
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <ChevronLeft size={18} />
          Back to Patient Directory
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-5 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-primary-700 border-b pb-2">Demographics</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Fingerprint size={20} className="text-primary-600" />
                <span className="font-medium">ID:</span> 
                <span className="text-gray-700">{patient.id}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <User size={20} className="text-primary-600" />
                <span className="font-medium">Name:</span> 
                <span className="text-gray-700">{cleanName(patient.first)} {cleanName(patient.last)}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-primary-600" />
                <span className="font-medium">Birthdate:</span> 
                <span className="text-gray-700">{new Date(patient.birthdate).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <User size={20} className="text-primary-600" />
                <span className="font-medium">Gender:</span> 
                <span className="text-gray-700">{patient.gender}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Map size={20} className="text-primary-600" />
                <span className="font-medium">Race:</span> 
                <span className="text-gray-700">{patient.race}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Map size={20} className="text-primary-600" />
                <span className="font-medium">Ethnicity:</span> 
                <span className="text-gray-700">{patient.ethnicity}</span>
              </div>
              
              {patient.deathdate && (
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-primary-600" />
                  <span className="font-medium">Deceased:</span> 
                  <span className="text-gray-700">{new Date(patient.deathdate).toLocaleDateString()}</span>
                </div>
              )}
              
              {patient.clusterId !== null && (
                <div className="flex items-center gap-3">
                  <CircleDashed size={20} className="text-primary-600" />
                  <span className="font-medium">Cluster ID:</span> 
                  <span className="text-gray-700">{patient.clusterId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg">
            <h2 className="text-xl font-semibold mb-6 text-primary-700 border-b pb-2">Summary</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <HeartPulse size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-700">Conditions</h3>
                  <p className="text-3xl font-bold text-blue-900">{patient._count.conditions}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Pill size={24} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-700">Medications</h3>
                  <p className="text-3xl font-bold text-green-900">{patient._count.medications}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <Activity size={24} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-700">Encounters</h3>
                  <p className="text-3xl font-bold text-purple-900">{patient._count.encounters}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI-Generated Summary Section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-800">AI-Generated Patient Summary</h2>
            <button 
              onClick={() => {
                if (patient) {
                  setSummaryLoading(true);
                  // Add cache-busting parameter to ensure a new request
                  fetch(`/api/patients/${id}/summarize?t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: {
                      'Pragma': 'no-cache',
                      'Cache-Control': 'no-cache, no-store, must-revalidate'
                    }
                  })
                    .then(response => {
                      if (!response.ok) {
                        throw new Error('Failed to generate AI summary');
                      }
                      return response.json();
                    })
                    .then(data => {
                      setAiSummary(data.summary);
                    })
                    .catch(err => {
                      console.error('Error refreshing AI summary:', err);
                    })
                    .finally(() => {
                      setSummaryLoading(false);
                    });
                }
              }}
              disabled={summaryLoading}
              className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={`${summaryLoading ? 'animate-spin' : ''}`} />
              <span>{summaryLoading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
          
          {summaryLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ) : aiSummary ? (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded shadow-sm">
                <h3 className="font-semibold text-primary-700 mb-2">Clinical Summary</h3>
                <div className="text-gray-700">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="mb-2" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                      em: ({node, ...props}) => <em className="italic" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />
                    }}
                  >
                    {cleanMarkdown(aiSummary.clinicalSummary)}
                  </ReactMarkdown>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded shadow-sm">
                <h3 className="font-semibold text-red-700 mb-2">Possible Issues</h3>
                <div className="text-gray-700">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="mb-2" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                      em: ({node, ...props}) => <em className="italic" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />
                    }}
                  >
                    {cleanMarkdown(aiSummary.possibleIssues)}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Unable to generate AI summary at this time.</p>
          )}
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