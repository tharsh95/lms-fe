import axios from 'axios';

// Get base URL from environment variable or use default
const BASE_URL = import.meta.env.VITE_API_URL;

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
  generateAssignment: async (assignment: {
    title: string;
    description: string;
    dueDate: string;
    classId: string;
    teacherId: string;
    subject: string;
    grade: string;
  }) => {
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
  },

  // Get all classes name and id
  getAllClasses: async () => {
    try {
      const response = await api.get('classes/get-all-classes/');
      return response.data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },
  getAllTeachers: async () => {
    try {
      const response = await api.get('auth/teachers/');
      return response.data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  },
  getOptions: async () => {
    try {
      const response = await api.get('assignment/options');
      return response.data;
    } catch (error) {
      console.error('Error fetching options:', error);
      throw error;
    }
  } ,
  createResource: async (data: { content: string; type: string; title?: string }, id: string) => {
    try {
      const response = await api.post(`assignment/add/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },
  getEditAssignment: async (id: string|undefined
  ) => {
    try {
      const response = await api.get(`assignment/edit/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching edit assignment:', error);  
    }
  },
  addInstruction: async (data: { instruction: string }, id: string) => {
    try {
      const response = await api.post(`assignment/instructions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error adding instruction:', error);
    }
  },
  addRubric: async (data: { criteria: string; points: number }[], id: string) => {
    try {
      const response = await api.post(`assignment/rubrics/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error adding rubric:', error);
    }
  },
  deleteResource: async (id: string, assignmentId: string, type: string) => {
    try {
      const response = await api.delete(`assignment/${assignmentId}/${type}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  },
  
  updateAssignment: async (id: string, data: {
    title?: string;
    description?: string;
    dueDate?: string;
    classId?: string;
    teacherId?: string;
    subject?: string;
    grade?: string;
  }) => {
    try {
      const response = await api.put(`assignment/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  },
  addChecklist: async (data: { item: string; points: number }[], id: string) => {
    try {
      const response = await api.post(`assignment/checklist/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error adding checklist item:', error);
      throw error;
    }
  },
  addParticipationCriteria: async (data: { criteria: string; points: number }[], id: string) => {
    try {
      const response = await api.post(`assignment/participation-criteria/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error adding participation criteria:', error);
      throw error;
    }
  }
};

// Auth related API calls
export const authApi = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    plan: string;
    billingCycle: string;
  }) => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
};

export default api; 