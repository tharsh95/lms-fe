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

// Add request interceptor to include auth token in requests
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

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

// Private state
let currentUser: User | null = null;
let authToken: string | null = null;

// Initialize auth state from localStorage
const initializeAuth = (): void => {
  const storedToken = localStorage.getItem('auth_token');
  const storedUser = localStorage.getItem('auth_user');
  
  if (storedToken && storedUser) {
    authToken = storedToken;
    currentUser = JSON.parse(storedUser);
  }
};

// Authentication related API calls
export const authApi = {
  // Login user
  login: async (credentials: LoginData): Promise<User> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      if (response.data.success && response.data.data.token) {
        authToken = response.data.data.token;
        currentUser = response.data.data.user;
        
        // Store token and user in localStorage
        localStorage.setItem('auth_token', response.data.data.token);
        localStorage.setItem('auth_user', JSON.stringify(response.data.data.user));
        
        return currentUser;
      } else {
        throw new Error('Login failed: Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Validate token
  validateToken: async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return false;
      
      // Make a request to validate the token
      const response = await api.get('/auth/protected');
      return response.data.success === true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  // Register new user
  register: async (data: RegisterData): Promise<User> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      
      if (response.data.success && response.data.data.token) {
        authToken = response.data.data.token;
        currentUser = response.data.data.user;
        
        // Store token and user in localStorage
        localStorage.setItem('auth_token', response.data.data.token);
        localStorage.setItem('auth_user', JSON.stringify(response.data.data.user));
        
        return currentUser;
      } else {
        throw new Error('Registration failed: Invalid response format');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Logout user
  logout: (): void => {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return currentUser;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!authToken;
  },

  // Get auth token
  getToken: (): string | null => {
    return authToken;
  }
};

// Initialize auth state when the module is imported
initializeAuth();

export default api; 