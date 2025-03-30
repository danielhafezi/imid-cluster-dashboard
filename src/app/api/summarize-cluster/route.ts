import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Define interfaces for request and aggregated data
interface ClusterRequest {
    clusterId: number;
    clusterType: 'kmeans' | 'dbscan';
}

interface AggregatedClusterData {
    patientCount: number;
    averageAge: number;
    commonConditions: string[];
    commonMedications: string[];
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const MODEL_NAME = 'gemini-1.5-flash';

export async function POST(request: Request) {
    // Validate the request
    let clusterRequest: ClusterRequest;
    try {
        const body = await request.json();
        
        if (typeof body.clusterId !== 'number') {
            return NextResponse.json(
                { error: 'Invalid clusterId provided. Must be a number.' }, 
                { status: 400 }
            );
        }
        
        // Default to 'kmeans' if not specified
        const clusterType = body.clusterType || 'kmeans';
        
        if (clusterType !== 'kmeans' && clusterType !== 'dbscan') {
            return NextResponse.json(
                { error: 'Invalid clusterType. Must be "kmeans" or "dbscan".' }, 
                { status: 400 }
            );
        }
        
        clusterRequest = { clusterId: body.clusterId, clusterType };
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body. Could not parse JSON.' }, 
            { status: 400 }
        );
    }

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not set in environment variables.');
        return NextResponse.json(
            { error: 'Server configuration error: Missing API Key.' }, 
            { status: 500 }
        );
    }

    try {
        const { clusterId, clusterType } = clusterRequest;
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

        // 2. Aggregate cluster data
        const clusterData = aggregateClusterData(patientsInCluster);
        
        // 3. Generate summary using Gemini
        const summary = await generateClusterSummary(clusterData, clusterRequest);
        
        // 4. Return the summary
        return NextResponse.json({ summary });
    } catch (error) {
        console.error(`Error processing ${clusterRequest.clusterType} cluster ${clusterRequest.clusterId}:`, error);
        
        // Check if the error is from the Gemini API specifically
        if (error instanceof Error && error.message.includes('API key')) {
            return NextResponse.json({ error: 'Invalid API Key or API error.' }, { status: 500 });
        }
        
        return NextResponse.json({ error: 'Failed to generate cluster summary.' }, { status: 500 });
    }
}

/**
 * Aggregates patient data to produce statistics for the cluster
 */
function aggregateClusterData(patients: any[]): AggregatedClusterData {
    // Calculate patient count
    const patientCount = patients.length;
    
    // Calculate average age
    const totalAge = patients.reduce((sum, patient) => {
        const birthdate = new Date(patient.birthdate);
        const today = new Date();
        const age = today.getFullYear() - birthdate.getFullYear() -
            ((today.getMonth() < birthdate.getMonth() || 
             (today.getMonth() === birthdate.getMonth() && today.getDate() < birthdate.getDate())) ? 1 : 0);
        return sum + age;
    }, 0);
    const averageAge = patientCount > 0 ? Math.round(totalAge / patientCount) : 0;
    
    // Calculate common conditions
    const conditionCounts: Record<string, number> = {};
    patients.forEach(p => {
        p.conditions.forEach((c: { description: string }) => {
            if (c.description) {
                conditionCounts[c.description] = (conditionCounts[c.description] || 0) + 1;
            }
        });
    });
    const commonConditions = Object.entries(conditionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5) // Top 5
        .map(([desc, count]) => `${desc} (${count} patients)`);
    
    // Calculate common medications
    const medicationCounts: Record<string, number> = {};
    patients.forEach(p => {
        p.medications.forEach((m: { description: string }) => {
            if (m.description) {
                medicationCounts[m.description] = (medicationCounts[m.description] || 0) + 1;
            }
        });
    });
    const commonMedications = Object.entries(medicationCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5) // Top 5
        .map(([desc, count]) => `${desc} (${count} patients)`);
    
    return {
        patientCount,
        averageAge,
        commonConditions,
        commonMedications
    };
}

/**
 * Generates a summary for the cluster using the Gemini API
 */
async function generateClusterSummary(
    data: AggregatedClusterData, 
    request: ClusterRequest
): Promise<string> {
    const { clusterId, clusterType } = request;
    
    // Construct prompt for Gemini
    const prompt = `
Summarize the key characteristics of this patient cluster based on the following data. Focus on demographics, common conditions, and medication patterns. Keep the summary concise (2-3 sentences).

Clustering Method: ${clusterType.toUpperCase()}
Cluster ID: ${clusterId}
Number of Patients: ${data.patientCount}
Average Age: ${data.averageAge} years
Most Common Conditions (up to 5): ${data.commonConditions.length ? data.commonConditions.join(', ') : 'N/A'}
Most Common Medications (up to 5): ${data.commonMedications.length ? data.commonMedications.join(', ') : 'N/A'}

Summary:
`;

    try {
        // Call Gemini API
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
} 