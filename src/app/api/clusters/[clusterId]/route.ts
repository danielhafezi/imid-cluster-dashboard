import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { clusterId: string } }
) {
  try {
    const clusterId = parseInt(params.clusterId);
    
    if (isNaN(clusterId)) {
      return NextResponse.json(
        { error: 'Invalid cluster ID' },
        { status: 400 }
      );
    }

    // Fetch patients belonging to the specified cluster
    const patients = await prisma.patient.findMany({
      where: {
        clusterId: clusterId,
      },
      select: {
        id: true,
        first: true,
        last: true,
        birthdate: true,
        gender: true,
        clusterId: true,
        _count: {
          select: {
            conditions: true,
            medications: true,
          },
        },
      },
    });

    return NextResponse.json(patients, { status: 200 });
  } catch (error) {
    console.error(`Error fetching patients for cluster ${params.clusterId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch patients for this cluster' },
      { status: 500 }
    );
  } finally {
    // No need to disconnect here as we're using the global instance
  }
} 