import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

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
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(patient, { status: 200 });
  } catch (error) {
    console.error(`Error fetching patient ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  } finally {
    // No need to disconnect here as we're using the global instance
  }
} 