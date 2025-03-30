import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get clustering method from query parameter (default to kmeans)
    const searchParams = request.nextUrl.searchParams;
    const clusterType = searchParams.get('type') || 'kmeans';
    
    // Determine which field to use based on clustering type
    const clusterField = clusterType === 'dbscan' ? 'dbscanClusterId' : 'clusterId';
    
    // Get distinct cluster IDs and count patients in each cluster
    const clusterCounts = await prisma.patient.groupBy({
      by: [clusterField],
      _count: {
        id: true
      },
      orderBy: {
        [clusterField]: 'asc'
      },
      where: {
        [clusterField]: {
          not: null
        }
      }
    });

    // Format response based on cluster type
    if (clusterType === 'dbscan') {
      return NextResponse.json(
        clusterCounts.map(cluster => ({
          clusterId: cluster.dbscanClusterId,
          patientCount: cluster._count.id,
          clusterType: 'dbscan'
        })), 
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        clusterCounts.map(cluster => ({
          clusterId: cluster.clusterId,
          patientCount: cluster._count.id,
          clusterType: 'kmeans'
        })), 
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error fetching cluster data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cluster data' },
      { status: 500 }
    );
  } finally {
    // No need to disconnect here as we're using the global instance
  }
} 