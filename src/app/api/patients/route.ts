import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    // Fetch patients with their basic info for the directory
    const patients = await prisma.patient.findMany({
      orderBy: {
        id: 'asc'
      },
      select: {
        id: true,
        first: true,
        last: true,
        birthdate: true,
        gender: true,
        clusterId: true,
        dbscanClusterId: true,
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
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  } finally {
    // No need to disconnect here as we're using the global instance
  }
} 