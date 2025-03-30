'use client';

import React from 'react';
import { LightbulbIcon, AlertTriangleIcon, XCircleIcon, Loader2Icon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface ClusterSummaryProps {
  summary: string | null;
  isLoading: boolean;
  error: string | null;
  selectedClusterId: number | null;
  clusterType: 'kmeans' | 'dbscan';
}

/**
 * Displays a loading state with animated skeleton
 */
const LoadingState = ({ selectedClusterId, clusterType }: { selectedClusterId: number | null, clusterType: string }) => (
  <div className="space-y-4">
    <div className="flex items-center">
      <Loader2Icon className="h-5 w-5 text-primary mr-2 animate-spin" />
      <Skeleton className="h-4 w-48" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-4/6" />
    </div>
    <p className="text-sm text-muted-foreground">
      Analyzing {clusterType === 'kmeans' ? 'K-Means' : 'DBSCAN'} Cluster {selectedClusterId}...
    </p>
  </div>
);

/**
 * Displays an error message with retry button
 */
const ErrorState = ({ error }: { error: string }) => (
  <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-md p-4">
    <div className="flex">
      <XCircleIcon className="h-5 w-5 flex-shrink-0 mr-2" />
      <div>
        <p className="text-sm font-medium">Error generating insights:</p>
        <p className="text-xs mt-1">{error}</p>
        <Button 
          variant="outline" 
          size="sm"
          className="mt-2 border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={() => window.location.reload()} 
        >
          Try again
        </Button>
      </div>
    </div>
  </div>
);

/**
 * Displays a message prompting users to select a cluster
 */
const NoSelectionState = () => (
  <div className="rounded-md p-4 text-center bg-muted/50">
    <LightbulbIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
    <p className="text-foreground mb-2">Select a cluster to analyze</p>
    <p className="text-sm text-muted-foreground">Click on a cluster in the legend to generate insights</p>
  </div>
);

/**
 * Displays a warning when no summary content is available for a selected cluster
 */
const EmptySummaryState = () => (
  <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md p-4">
    <div className="flex">
      <AlertTriangleIcon className="h-5 w-5 flex-shrink-0 mr-2 text-yellow-600" />
      <div>
        <p className="text-sm font-medium">
          Summary generated, but no insights were returned
        </p>
        <p className="text-xs mt-1">
          This could happen if the cluster data is limited or the AI service encountered an issue
        </p>
      </div>
    </div>
  </div>
);

/**
 * Displays the AI-generated summary text
 */
const SummaryContent = ({ 
  summary, 
  selectedClusterId, 
  clusterType 
}: { 
  summary: string, 
  selectedClusterId: number | null, 
  clusterType: string 
}) => (
  <div>
    <div className="text-sm mb-2">
      <span className="font-medium">
        {clusterType === 'kmeans' ? 'K-Means' : 'DBSCAN'} Cluster {selectedClusterId}
      </span> • 
      <span className="text-muted-foreground ml-1">AI analysis</span>
    </div>
    <div className="prose prose-sm max-w-none text-foreground bg-muted/30 p-4 rounded-md border">
      {summary.split('\n').map((line, index) => (
        <p key={index} className={line.trim() === '' ? 'h-4' : ''}>
          {line}
        </p>
      ))}
    </div>
  </div>
);

/**
 * Main ClusterSummary component that shows AI-generated insights for selected clusters
 */
const ClusterSummary: React.FC<ClusterSummaryProps> = ({
  summary,
  isLoading,
  error,
  selectedClusterId,
  clusterType,
}) => {
  // Determine the formatted cluster type label
  const clusterTypeLabel = clusterType === 'kmeans' ? 'K-Means' : 'DBSCAN';
  
  // Determine the content to display based on current state
  const renderContent = () => {
    // Loading state
    if (isLoading) {
      return <LoadingState selectedClusterId={selectedClusterId} clusterType={clusterTypeLabel} />;
    }
    
    // Error state
    if (error) {
      return <ErrorState error={error} />;
    }
    
    // No cluster selected
    if (selectedClusterId === null) {
      return <NoSelectionState />;
    }
    
    // Empty summary (no content returned)
    if (!summary) {
      return <EmptySummaryState />;
    }
    
    // Summary content
    return <SummaryContent 
      summary={summary} 
      selectedClusterId={selectedClusterId} 
      clusterType={clusterTypeLabel} 
    />;
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center text-primary">
          <LightbulbIcon className="w-5 h-5 mr-2" />
          AI-Generated Cluster Insights
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {renderContent()}
      </CardContent>
      
      {!isLoading && !error && summary && (
        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground italic">
            Generated by Google Gemini API • Not for clinical use
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default ClusterSummary; 