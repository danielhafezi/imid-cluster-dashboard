import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    // Get distinct cluster IDs and count patients in each cluster
    const clusterCounts = await prisma.patient.groupBy({
      by: ['clusterId'],
      _count: {
        id: true
      },
      orderBy: {
        clusterId: 'asc'
      },
      where: {
        clusterId: {
          not: null
        }
      }
    });

    return NextResponse.json(
      clusterCounts.map(cluster => ({
        clusterId: cluster.clusterId,
        patientCount: cluster._count.id
      })), 
      { status: 200 }
    );
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