'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ClusterScatterPlot from '../../../components/ClusterScatterPlot'; // Adjusted path
import ClusterSummary from '../../../components/ClusterSummary'; // Import the new component
// PrismaClient should not be used in client components directly
// import { PrismaClient } from '@prisma/client';

// Keep the interface definition
interface PatientData {
  id: string;
  first: string;
  last: string;
  birthdate: string;
  clusterId: number | null;
  dbscanClusterId: number | null;
  _count: {
    conditions: number;
    medications: number;
  };
}

// The data fetching part is moved inside the client component using useEffect

export default function PatientDashboardPage() {
  const [patientData, setPatientData] = useState<PatientData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [clusterType, setClusterType] = useState<'kmeans' | 'dbscan'>('kmeans');

  // Fetch initial patient data for the plot
  useEffect(() => {
    async function fetchPatientData() {
      setIsLoadingData(true);
      setDataError(null);
      try {
        // Fetch from the API route instead of direct DB access in client component
        const response = await fetch('/api/patients');
        if (!response.ok) {
          throw new Error(`Failed to fetch patient data: ${response.statusText}`);
        }
        const data: PatientData[] = await response.json();
        setPatientData(data);
      } catch (error: any) {
        console.error('Error fetching patient data:', error);
        setDataError(error.message || 'An unknown error occurred while fetching patient data.');
        setPatientData([]); // Ensure data is empty on error
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchPatientData();
  }, []); // Empty dependency array means this runs once on mount

  // Fetch summary when selectedClusterId changes
  useEffect(() => {
    if (selectedClusterId === null) {
      setSummary(null);
      setSummaryError(null);
      setIsLoadingSummary(false);
      return;
    }

    async function fetchSummary() {
      setIsLoadingSummary(true);
      setSummaryError(null);
      setSummary(null);
      try {
        const response = await fetch('/api/summarize-cluster', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            clusterId: selectedClusterId,
            clusterType: clusterType 
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Try to parse error body
          throw new Error(
            `Failed to fetch summary (Status: ${response.status}): ${errorData.error || response.statusText}`
          );
        }

        const result = await response.json();
        setSummary(result.summary || null); // Handle cases where summary might be missing
      } catch (error: any) {
        console.error('Error fetching cluster summary:', error);
        setSummaryError(error.message || 'An unknown error occurred while fetching the summary.');
      } finally {
        setIsLoadingSummary(false);
      }
    }

    fetchSummary();
  }, [selectedClusterId, clusterType]); // Re-run when selectedClusterId or clusterType changes

  // Handle cluster selection from the scatter plot
  const handleClusterSelect = (clusterId: number | null) => {
    setSelectedClusterId(clusterId);
  };

  // Handle clustering method change
  const handleClusterTypeChange = (type: 'kmeans' | 'dbscan') => {
    setClusterType(type);
    setSelectedClusterId(null); // Reset selection when changing clustering method
  };

  // Get the distribution of clusters based on selected clustering method
  const clusterCounts = patientData.reduce((acc, patient) => {
    const clusterId = clusterType === 'dbscan' 
      ? patient.dbscanClusterId 
      : patient.clusterId;
      
    if (clusterId !== null) {
      acc[clusterId] = (acc[clusterId] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-700">Patient Cluster Visualization</h1>
            <p className="text-gray-500 mt-1">
              Interactive data visualization with AI-powered cluster analysis
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-white border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors duration-150 shadow-sm"
          >
            Back to Home
          </Link>
        </div>

        {/* Clustering Method Selection */}
        <div className="mb-4">
          <div className="flex items-center justify-start space-x-2">
            <span className="text-sm font-medium text-gray-700">Clustering Method:</span>
            <div className="flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => handleClusterTypeChange('kmeans')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                  clusterType === 'kmeans'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                K-Means
              </button>
              <button
                type="button"
                onClick={() => handleClusterTypeChange('dbscan')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  clusterType === 'dbscan'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                DBSCAN
              </button>
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded-md shadow-sm">
            <div className="text-sm text-gray-500">Total Patients</div>
            <div className="text-2xl font-semibold text-primary-700">
              {isLoadingData ? "..." : patientData.length}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md shadow-sm">
            <div className="text-sm text-gray-500">Clusters</div>
            <div className="text-2xl font-semibold text-primary-700">
              {isLoadingData ? "..." : Object.keys(clusterCounts).length}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md shadow-sm">
            <div className="text-sm text-gray-500">Selected Cluster</div>
            <div className="text-2xl font-semibold text-primary-700">
              {selectedClusterId !== null ? `#${selectedClusterId}` : "None"}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md shadow-sm">
            <div className="text-sm text-gray-500">Cluster Size</div>
            <div className="text-2xl font-semibold text-primary-700">
              {selectedClusterId !== null && clusterCounts[selectedClusterId] 
                ? clusterCounts[selectedClusterId] 
                : "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualization panel */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary-600">
            Cluster Distribution <span className="text-sm font-normal text-gray-500">(Age vs. Condition Count)</span>
          </h2>
          
          {/* Loading state */}
          {isLoadingData && (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-md">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Loading patient data...</p>
            </div>
          )}

          {/* Error state */}
          {dataError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
                <span>Error loading patient data: {dataError}</span>
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-sm text-primary-600 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Visualization */}
          {!isLoadingData && !dataError && (
            patientData.length > 0 ? (
              <div className="h-[500px]">
                <ClusterScatterPlot
                  data={patientData}
                  onClusterSelect={handleClusterSelect}
                  clusterType={clusterType}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-md">
                <p className="text-gray-500">No patient data available.</p>
              </div>
            )
          )}

          {/* Instructions */}
          <div className="mt-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
            <p className="font-medium">How to use:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Click on a cluster in the legend to view its AI-generated summary</li>
              <li>Hover over points to see patient details</li>
              <li>Each color represents a different patient cluster</li>
              <li>Switch between K-Means and DBSCAN clustering methods using the toggle above</li>
            </ul>
          </div>
        </div>

        {/* Summary panel */}
        <div className="lg:col-span-1">
          <ClusterSummary
            selectedClusterId={selectedClusterId}
            summary={summary}
            isLoading={isLoadingSummary}
            error={summaryError}
            clusterType={clusterType}
          />

          {/* Cluster details */}
          {selectedClusterId !== null && !isLoadingData && (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
              <h3 className="text-lg font-semibold mb-2 text-primary-600">
                {clusterType === 'kmeans' ? 'K-Means' : 'DBSCAN'} Cluster {selectedClusterId} Details
              </h3>
              <ul className="divide-y divide-gray-200">
                <li className="py-2 flex justify-between">
                  <span className="text-gray-600">Patients</span>
                  <span className="font-medium">{clusterCounts[selectedClusterId] || 0}</span>
                </li>
                <li className="py-2 flex justify-between">
                  <span className="text-gray-600">% of Total</span>
                  <span className="font-medium">
                    {patientData.length > 0 && clusterCounts[selectedClusterId] 
                      ? ((clusterCounts[selectedClusterId] / patientData.length) * 100).toFixed(1) + '%'
                      : 'N/A'}
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 