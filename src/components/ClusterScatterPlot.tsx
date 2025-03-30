'use client';

import React, { useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
  Label,
} from 'recharts';

// Define a type for the patient data expected by the component
interface PatientData {
  id: string;
  first: string;
  last: string;
  birthdate: string; // Assuming ISO string format
  clusterId: number | null;
  dbscanClusterId: number | null;
  _count: {
    conditions: number;
    medications: number;
  };
}

interface ClusterScatterPlotProps {
  data: PatientData[];
  onClusterSelect: (clusterId: number | null) => void; // Add callback prop
  clusterType: 'kmeans' | 'dbscan';
}

// Function to calculate age from birthdate string
const calculateAge = (birthdateString: string): number => {
  if (!birthdateString) return 0;
  const birthDate = new Date(birthdateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Define colors for clusters with improved color scheme
const clusterColors: { [key: number]: string } = {
  0: '#4F46E5', // Indigo
  1: '#10B981', // Emerald
  2: '#F59E0B', // Amber
  3: '#EF4444', // Red
  4: '#0EA5E9', // Sky
  5: '#8B5CF6', // Violet
  6: '#EC4899', // Pink
  7: '#F97316', // Orange
  8: '#14B8A6', // Teal
  9: '#6366F1', // Indigo
};
const defaultColor = '#94A3B8'; // Slate-400 for patients with null clusterId

const ClusterScatterPlot: React.FC<ClusterScatterPlotProps> = ({ data, onClusterSelect, clusterType }) => {
  const [activeCluster, setActiveCluster] = useState<number | null>(null);
  
  // Function to remove numbers from names
  const cleanName = (name: string | undefined) => {
    if (!name) return '';
    return name.replace(/\d+/g, '');
  };
  
  // Function to get cluster ID based on current cluster type
  const getClusterId = (patient: PatientData): number | null => {
    return clusterType === 'dbscan' ? patient.dbscanClusterId : patient.clusterId;
  };
  
  // Transform data for the chart
  const chartData = data
    .map((patient) => {
      const clusterId = getClusterId(patient);
      return {
        ...patient,
        age: calculateAge(patient.birthdate),
        conditionsCount: patient._count.conditions,
        color: clusterId !== null ? clusterColors[clusterId] : defaultColor,
        // Add opacity based on active cluster
        opacity: activeCluster === null || activeCluster === clusterId ? 1 : 0.3,
        // Use the appropriate cluster ID based on selected type
        currentClusterId: clusterId
      };
    })
    .filter(patient => patient.currentClusterId !== null); // Filter out unclustered patients

  // Prepare data grouped by cluster for Scatter components
  const groupedData: { [key: number]: any[] } = {};
  chartData.forEach(item => {
    if (item.currentClusterId !== null) {
        if (!groupedData[item.currentClusterId]) {
            groupedData[item.currentClusterId] = [];
        }
        groupedData[item.currentClusterId].push(item);
    }
  });

  // Handle legend click
  const handleLegendClick = (e: any) => {
    // The payload in the legend click event contains the name, e.g., "Cluster 3"
    const clusterName = e.value;
    if (clusterName && typeof clusterName === 'string' && clusterName.startsWith('Cluster ')) {
      const clusterIdStr = clusterName.replace('Cluster ', '');
      const clusterId = parseInt(clusterIdStr, 10);
      
      if (!isNaN(clusterId)) {
        // If clicking the already active cluster, deselect it
        if (activeCluster === clusterId) {
          setActiveCluster(null);
          onClusterSelect(null);
        } else {
          setActiveCluster(clusterId);
          onClusterSelect(clusterId);
        }
      } else {
        setActiveCluster(null);
        onClusterSelect(null);
      }
    } else {
      setActiveCluster(null);
      onClusterSelect(null);
    }
  };

  // Enhanced custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-white border border-gray-200 rounded-md shadow-lg text-sm">
          <p className="font-bold text-primary-700 border-b pb-1 mb-1">{`${cleanName(data.first)} ${cleanName(data.last)}`}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <p className="text-gray-500">Patient ID:</p>
            <p className="font-medium text-gray-800">{data.id.substring(0, 8)}...</p>
            
            <p className="text-gray-500">Age:</p>
            <p className="font-medium text-gray-800">{data.age} years</p>
            
            <p className="text-gray-500">Conditions:</p>
            <p className="font-medium text-gray-800">{data.conditionsCount}</p>
            
            <p className="text-gray-500">Medications:</p>
            <p className="font-medium text-gray-800">{data._count.medications}</p>
          </div>
          <div className="mt-1 pt-1 border-t">
            <p className="flex items-center gap-1">
              <span 
                className="inline-block w-3 h-3 rounded-full" 
                style={{ backgroundColor: clusterColors[data.currentClusterId] || defaultColor }}
              ></span>
              <span className="font-medium text-gray-700">
                {clusterType === 'kmeans' ? 'K-Means' : 'DBSCAN'} Cluster {data.currentClusterId}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Enhanced custom legend
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {payload.map((entry: any, index: number) => {
          const clusterId = parseInt(entry.value.replace('Cluster ', ''), 10);
          const isActive = activeCluster === clusterId;
          return (
            <div 
              key={`item-${index}`}
              className={`inline-flex items-center px-2 py-1 rounded-full cursor-pointer transition-all duration-150 ${
                isActive 
                  ? 'ring-2 ring-primary-500 ring-offset-1 shadow-md' 
                  : 'hover:shadow'
              }`}
              style={{ 
                backgroundColor: isActive ? entry.color : 'white',
                color: isActive ? 'white' : 'black',
                border: `1px solid ${entry.color}`
              }}
              onClick={() => handleLegendClick({ value: entry.value })}
            >
              <span 
                className="inline-block w-3 h-3 rounded-full mr-1" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs font-medium">
                {entry.value} ({groupedData[clusterId]?.length || 0})
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
        margin={{
          top: 20,
          right: 20,
          bottom: 30,
          left: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
           type="number"
           dataKey="age"
           name="Age"
           unit=" yrs"
           domain={['dataMin - 5', 'dataMax + 5']} // Dynamic domain with padding
           stroke="#6B7280"
           tick={{ fill: '#6B7280', fontSize: 12 }}
        >
          <Label
            value="Patient Age (years)"
            position="bottom"
            style={{ fill: '#4B5563', fontSize: 12, fontWeight: 500, textAnchor: 'middle' }}
            dy={15}
          />
        </XAxis>
        <YAxis
          type="number"
          dataKey="conditionsCount"
          name="Number of Conditions"
          domain={['dataMin - 1', 'dataMax + 1']} // Dynamic domain with padding
          stroke="#6B7280"
          tick={{ fill: '#6B7280', fontSize: 12 }}
        >
          <Label
            value="Number of Conditions"
            angle={-90}
            position="left"
            style={{ fill: '#4B5563', fontSize: 12, fontWeight: 500, textAnchor: 'middle' }}
            dx={-15}
          />
        </YAxis>
        <ZAxis type="number" range={[60, 400]} /> {/* Controls dot size, optional */}
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#9CA3AF' }} />
        <Legend 
          content={renderLegend} 
          verticalAlign="bottom" 
          height={60}
        />
        {Object.keys(groupedData).map((clusterIdStr) => {
          const clusterId = parseInt(clusterIdStr, 10);
          const isActive = activeCluster === null || activeCluster === clusterId;
          return (
            <Scatter
              key={`cluster-${clusterId}`}
              name={`Cluster ${clusterId}`}
              data={groupedData[clusterId]}
              fill={clusterColors[clusterId] || defaultColor}
              opacity={isActive ? 1 : 0.3}
              style={{ transition: 'opacity 0.3s ease' }}
            />
          );
        })}
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default ClusterScatterPlot; 