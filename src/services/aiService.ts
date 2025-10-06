import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface RoadmapData {
  skillsExtracted: string[];
  missingSkills: string[];
  suggestedProjects: string[];
  roadmap: {
    week1: string;
    week2: string;
    week3: string;
    week4: string;
  };
  fitPercentage: number;
}

export async function generateCareerRoadmap(
  resumeText: string,
  jobRole: string
): Promise<RoadmapData> {
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `You are a career development expert. Analyze the following resume and compare it with the target job role to provide a detailed skill gap analysis and learning roadmap.

Resume Content:
${resumeText}

Target Job Role: ${jobRole}

Please analyze and provide a response in the following JSON format (return ONLY valid JSON, no markdown):
{
  "skillsExtracted": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "suggestedProjects": ["project1", "project2", ...],
  "roadmap": {
    "week1": "Focus area and specific goals",
    "week2": "Focus area and specific goals",
    "week3": "Focus area and specific goals",
    "week4": "Focus area and specific goals"
  },
  "fitPercentage": 75
}

Instructions:
1. Extract all technical and soft skills mentioned in the resume
2. Identify key skills required for the ${jobRole} role that are missing from the resume
3. Suggest 3-5 practical projects that would help develop the missing skills
4. Create a 4-week learning roadmap with specific, actionable goals for each week
5. Calculate a fit percentage (0-100) based on how well the resume matches the job role requirements
6. Return ONLY the JSON object, no additional text or markdown`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const analysisData = JSON.parse(cleanText);

  if (
    !analysisData.skillsExtracted ||
    !analysisData.missingSkills ||
    !analysisData.suggestedProjects ||
    !analysisData.roadmap ||
    typeof analysisData.fitPercentage !== 'number'
  ) {
    throw new Error('Invalid response structure from AI');
  }

  return analysisData;
}
