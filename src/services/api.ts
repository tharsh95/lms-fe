import axios from 'axios';

// Get base URL from environment variable or use default
const BASE_URL = 'http://localhost:3030/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Assignment related API calls
export const assignmentApi = {
  // Get all assignments
  getAllAssignments: async () => {
    try {
      const response = await api.get('/assignment/');
      return response.data;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  },

  // Get single assignment by ID
  getAssignmentById: async (id: string | undefined) => {
    try {
      const response = await api.get(`/assignment/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching assignment ${id}:`, error);
      throw error;
    }
  },
  generateAssignment: async (assignment: any) => {
    try {
      const response = await api.post('/assignment/generate', assignment);
      return response.data;
    } catch (error) {
      console.error('Error generating assignment:', error);
    }
  },
  getAssignmentAnswers: async (id: string | undefined) => {
    try {
      const response = await api.get(`/assignment/answers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching assignment answers ${id}:`, error);
    }
  }
};

export default api; 