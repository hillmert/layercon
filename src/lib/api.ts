// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_KEY = import.meta.env.VITE_API_KEY || '';

export const endpoints = {
  strateon: `${API_BASE_URL}/strateon`,
  dataExplorer: `${API_BASE_URL}/dataexplorer/query/tachyus`,
  workflows: `${API_BASE_URL}/workflows`,
  workflow: `${API_BASE_URL}/workflow`,
};

// API Helper functions
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Don't set Content-Type for FormData - browser will set it with boundary
  const isFormData = options.body instanceof FormData;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'x-api-key': API_KEY,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Data Explorer Query
export async function queryDataExplorer<T = any>(query: string): Promise<T> {
  const response = await fetch(endpoints.dataExplorer, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: query, // Send query as plain string
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Get Projects
export interface Project {
  name: string;
  displayname: string;
  basin?: string;
  country?: string;
  operator?: string;
}

export async function getProjects(): Promise<Project[]> {
  const query = `
    SELECT name, displayname
    FROM assetrepository ar
    WHERE ar.name NOT IN (
      SELECT DISTINCT parent
      FROM assetrepository
      WHERE parent IS NOT NULL
    )
  `;

  try {
    const result = await queryDataExplorer(query);
    console.log('API Response:', result);
    
    // Handle different response formats
    let projects: any[] = [];
    
    if (Array.isArray(result)) {
      projects = result;
    } else if (result.data && Array.isArray(result.data)) {
      projects = result.data;
    } else if (result.results && Array.isArray(result.results)) {
      projects = result.results;
    } else if (result.rows && Array.isArray(result.rows)) {
      projects = result.rows;
    }
    
    console.log('Parsed projects:', projects);
    
    // Add placeholder data for each project
    return projects.map((project: any) => ({
      name: project.name || project.Name || '',
      displayname: project.displayname || project.displayName || project.DisplayName || project.name || '',
      basin: 'Golfo San Jorge',
      country: 'Argentina',
      operator: 'Pan American Energy',
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}
