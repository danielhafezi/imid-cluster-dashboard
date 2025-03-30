import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dayjs from 'dayjs'; // Using dayjs for easier date calculations

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    let clusterId: number;
    let clusterType: string;
    try {
        const body = await request.json();
        if (typeof body.clusterId !== 'number') {
            return NextResponse.json({ error: 'Invalid clusterId provided. Must be a number.' }, { status: 400 });
        }
        clusterId = body.clusterId;
        // Default to 'kmeans' if not specified
        clusterType = body.clusterType || 'kmeans';
        
        if (clusterType !== 'kmeans' && clusterType !== 'dbscan') {
            return NextResponse.json({ error: 'Invalid clusterType. Must be "kmeans" or "dbscan".' }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request body. Could not parse JSON.' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not set in environment variables.');
        return NextResponse.json({ error: 'Server configuration error: Missing API Key.' }, { status: 500 });
    }

    try {
        // Determine which field to query based on cluster type
        const clusterField = clusterType === 'dbscan' ? 'dbscanClusterId' : 'clusterId';
        
        // 1. Fetch patients in the cluster
        const patientsInCluster = await prisma.patient.findMany({
            where: { 
                [clusterField]: clusterId 
            },
            select: {
                id: true,
                birthdate: true,
                conditions: { select: { description: true } },
                medications: { select: { description: true } },
            },
        });

        if (patientsInCluster.length === 0) {
            return NextResponse.json({ 
                summary: `No patients found for ${clusterType.toUpperCase()} Cluster ID ${clusterId}.` 
            });
        }

        // 2. Calculate aggregated data
        const patientCount = patientsInCluster.length;

        // Calculate average age
        const totalAge = patientsInCluster.reduce((sum, patient) => {
            return sum + dayjs().diff(dayjs(patient.birthdate), 'year');
        }, 0);
        const averageAge = patientCount > 0 ? Math.round(totalAge / patientCount) : 0;

        // Calculate common conditions
        const conditionCounts: { [key: string]: number } = {};
        patientsInCluster.forEach(p => {
            p.conditions.forEach(c => {
                conditionCounts[c.description] = (conditionCounts[c.description] || 0) + 1;
            });
        });
        const commonConditions = Object.entries(conditionCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5) // Top 5
            .map(([desc, count]) => `${desc} (${count} patients)`);

        // Calculate common medications
        const medicationCounts: { [key: string]: number } = {};
        patientsInCluster.forEach(p => {
            p.medications.forEach(m => {
                medicationCounts[m.description] = (medicationCounts[m.description] || 0) + 1;
            });
        });
        const commonMedications = Object.entries(medicationCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5) // Top 5
            .map(([desc, count]) => `${desc} (${count} patients)`);

        // 3. Construct prompt for Gemini
        const prompt = `
Summarize the key characteristics of this patient cluster based on the following data. Focus on demographics, common conditions, and medication patterns. Keep the summary concise (2-3 sentences).

Clustering Method: ${clusterType.toUpperCase()}
Cluster ID: ${clusterId}
Number of Patients: ${patientCount}
Average Age: ${averageAge} years
Most Common Conditions (up to 5): ${commonConditions.join(', ') || 'N/A'}
Most Common Medications (up to 5): ${commonMedications.join(', ') || 'N/A'}

Summary:
`;

        // 4. Call Gemini API
        // Using gemini-1.5-flash as it's efficient for summarization tasks
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        // 5. Return summary
        return NextResponse.json({ summary });

    } catch (error) {
        console.error(`Error processing ${clusterType} cluster ${clusterId}:`, error);
        // Check if the error is from the Gemini API specifically
        if (error instanceof Error && error.message.includes('API key')) {
             return NextResponse.json({ error: 'Invalid API Key or API error.' }, { status: 500 });
        }
        return NextResponse.json({ error: 'Failed to generate cluster summary.' }, { status: 500 });
    } finally {
        // No need to disconnect here as we're using the global instance
    }
} 