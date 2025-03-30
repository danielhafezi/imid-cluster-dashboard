import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dayjs from 'dayjs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables.');
    return NextResponse.json({ error: 'Server configuration error: Missing API Key.' }, { status: 500 });
  }

  try {
    // Fetch detailed patient data including conditions, medications, and encounters
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        conditions: true,
        medications: true,
        encounters: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Calculate patient age
    const age = dayjs().diff(dayjs(patient.birthdate), 'year');

    // Get active conditions (no stop date or stop date in future)
    const activeConditions = patient.conditions.filter(c => !c.stop || new Date(c.stop) > new Date());
    
    // Get active medications
    const activeMedications = patient.medications.filter(m => !m.stop || new Date(m.stop) > new Date());
    
    // Count encounters by type
    const encountersByType: { [key: string]: number } = {};
    patient.encounters.forEach(e => {
      encountersByType[e.description] = (encountersByType[e.description] || 0) + 1;
    });

    // Most recent encounters (up to 3)
    const recentEncounters = [...patient.encounters]
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
      .slice(0, 3);

    // Construct prompt for Gemini
    const prompt = `
Generate a concise medical summary of this patient based on the following data. I need TWO separate sections:

1. Clinical Summary: Summarize the patient's profile, key conditions, medications, and encounter history in 1-2 paragraphs.

2. Possible Issues: Identify any potential problems or gaps in care based on the data. For example: untreated conditions, medication issues, concerning patterns in encounters, or any other red flags. Be specific about what issues you see and why they're concerning.

IMPORTANT INSTRUCTIONS:
- DO NOT use the patient's name in your summary. Instead, refer to them as "the patient" or "this patient".
- Use markdown formatting for emphasis (e.g., **bold** for important findings or _italics_ for medical terms).
- Format lists with bullet points using markdown (* item) when appropriate.
- Keep your response well-structured and easy to read.
- This is request #${Date.now()}-${Math.floor(Math.random() * 1000)}. Generate a unique analysis.

Patient ID: ${patient.id}
Name: ${patient.first} ${patient.last}
Age: ${age} years
Gender: ${patient.gender}
Race: ${patient.race}
Ethnicity: ${patient.ethnicity}

Active Conditions (${activeConditions.length}):
${activeConditions.map(c => `- ${c.description} (since ${new Date(c.start).toLocaleDateString()})`).join('\n')}

All Conditions (${patient.conditions.length}):
${patient.conditions.map(c => `- ${c.description} (${new Date(c.start).toLocaleDateString()} to ${c.stop ? new Date(c.stop).toLocaleDateString() : 'Active'})`).join('\n')}

Active Medications (${activeMedications.length}):
${activeMedications.map(m => `- ${m.description} (since ${new Date(m.start).toLocaleDateString()})`).join('\n')}

All Medications (${patient.medications.length}):
${patient.medications.map(m => `- ${m.description} (${new Date(m.start).toLocaleDateString()} to ${m.stop ? new Date(m.stop).toLocaleDateString() : 'Active'})`).join('\n')}

Total Encounters: ${patient.encounters.length}
Most Common Encounter Types:
${Object.entries(encountersByType)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 3)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

Recent Encounters:
${recentEncounters.map(e => `- ${new Date(e.start).toLocaleDateString()}: ${e.description}`).join('\n')}

Make the summary concise but informative, highlighting the most clinically relevant details.
For the "Possible Issues" section, be analytical and focus on identifying potential gaps in care, concerning patterns, or health risks.
`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    // Parse the summary to get each section
    const sectionMatch = summary.match(/Clinical Summary:([\s\S]*?)(?:Possible Issues:|$)([\s\S]*)/);
    
    // Clean up captured sections
    let clinicalSummaryText = sectionMatch?.[1]?.trim() || 'No clinical summary available';
    let possibleIssuesText = sectionMatch?.[2]?.trim() || 'No issues identified';

    // Remove potential leading/trailing markdown artifacts or leftover numbering
    clinicalSummaryText = clinicalSummaryText
      .replace(/^\*\*|\*\*$/gm, '') // Remove starting/ending **
      .replace(/\*\*\d+\.?$/gm, '') // Remove **2. at the end
      .replace(/\d+\.\s*$/gm, '') // Remove 2. at the end
      .trim();
    
    possibleIssuesText = possibleIssuesText
      .replace(/^\*\*|\*\*$/gm, '') // Remove starting/ending **
      .replace(/Possible Issues:/gi, '') // Remove header if captured
      .trim();

    // Structure the response
    const structuredSummary = {
      clinicalSummary: clinicalSummaryText,
      possibleIssues: possibleIssuesText,
      fullText: summary
    };

    return NextResponse.json({ summary: structuredSummary });

  } catch (error) {
    console.error(`Error processing patient summary for ${id}:`, error);
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json({ error: 'Invalid API Key or API error.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to generate patient summary.' }, { status: 500 });
  }
} 