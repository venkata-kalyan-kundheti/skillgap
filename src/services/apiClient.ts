/**
 * API Client for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const withCredentials: RequestInit = { credentials: 'include' };

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
    const response = await fetch(`${API_BASE_URL}/health`, withCredentials);
    return response.ok;
  } catch (error) {
    return false;
  }
}

interface RoadmapPhase {
  period: string;
  title: string;
  goals: string[];
  resources: string[];
}

/**
 * Generate career roadmap using AI
 */
export async function generateRoadmap(resumeText: string, jobRole: string): Promise<ApiResponse<{
  skillsExtracted: string[];
  missingSkills: string[];
  suggestedProjects: string[];
  roadmap: RoadmapPhase[];
  estimatedTimeframe: string;
  fitPercentage: number;
}>> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-roadmap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resumeText, jobRole }),
      ...withCredentials,
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

export async function getCurrentUser(): Promise<{ authenticated: boolean; user: { id: string; email: string; name?: string; imageUrl?: string } | null }> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, withCredentials);
  return response.json();
}

export function getGoogleAuthUrl(): string {
  return `${API_BASE_URL}/auth/google`;
}

export async function logout(): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', ...withCredentials });
  return response.ok;
}

export async function emailReport(selectedRole: string, roadmapData: any): Promise<ApiResponse<{}>> {
  try {
    const response = await fetch(`${API_BASE_URL}/email-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedRole, roadmapData }),
      ...withCredentials,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to send email');
    return result;
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}
