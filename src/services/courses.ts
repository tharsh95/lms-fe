import axios from 'axios';

// Get base URL from environment variable or use default
const BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
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

export const coursesApi = {
  createSyllabusWithPdf: async (formData: FormData) => {
    const response = await api.post('/courses/create-with-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  createSyllabuswithAI: async (body: {
    prompt: string;
    additionalInfo: string;
    courseDetails: {
        courseName: string;
        description: string;
        subject: string;
        grade: string;
    };
  }) => {
    const response = await api.post('/courses/create-with-ai',body,{
      headers: {
        'Content-Type': 'application/json',
      },
    }
    );
    return response.data;
  },
  
  getCourseById: async (id: string|undefined) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
  updateCourse: async (course: { id: string; title: string; description: string; topic: string; level: string }) => {
    const response = await api.put(`/courses/${course.id}`, course, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
  getAllCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  },
  createCourse: async (course: {id:string, title: string; description: string; topic: string; level: string }) => {
    const response = await api.post('courses/', course, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
  getAssignments: async (courseId: string) => {
    const response = await api.get(`${courseId}/assignments`);
    return response.data;
  },
};
