/**
 * API Client for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Upload resume to backend
 */
export async function uploadResumeToBackend(file: File): Promise<ApiResponse<{
  text: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}>> {
  try {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(`${API_BASE_URL}/upload-resume`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to upload resume');
    }

    return result;
  } catch (error) {
    console.error('Error uploading resume:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload resume'
    };
  }
}

/**
 * Get job roles from backend
 */
export async function fetchRolesFromBackend(): Promise<ApiResponse<Array<{
  id: string;
  title: string;
  category: string;
}>>> {
  try {
    const response = await fetch(`${API_BASE_URL}/roles`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch roles');
    }

    return result;
  } catch (error) {
    console.error('Error fetching roles:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch roles'
    };
  }
}

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Generate career roadmap using AI
 */
export async function generateRoadmap(resumeText: string, jobRole: string): Promise<ApiResponse<{
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
}>> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-roadmap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resumeText, jobRole }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to generate roadmap');
    }

    return result;
  } catch (error) {
    console.error('Error generating roadmap:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate roadmap'
    };
  }
}
