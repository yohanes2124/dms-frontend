import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  logout: () =>
    api.post('/auth/logout'),
  
  me: () =>
    api.get('/auth/me'),
  
  updateProfile: (data: any) =>
    api.put('/auth/profile', data),
};

// Applications API
export const applicationsAPI = {
  getAll: (params?: any) =>
    api.get('/applications', { params }),
  
  create: (data: any) =>
    api.post('/applications', data),
  
  getById: (id: string) =>
    api.get(`/applications/${id}`),
  
  update: (id: string, data: any) =>
    api.put(`/applications/${id}`, data),
  
  approve: (id: string, data?: any) =>
    api.post(`/applications/${id}/approve`, data),
  
  reject: (id: string, data: any) =>
    api.post(`/applications/${id}/reject`, data),
  
  delete: (id: string) =>
    api.delete(`/applications/${id}`),
  
  getStats: () =>
    api.get('/applications-stats'),
};

// Rooms API
export const roomsAPI = {
  getAll: (params?: any) =>
    api.get('/rooms', { params }),
  
  create: (data: any) =>
    api.post('/rooms', data),
  
  getById: (id: string) =>
    api.get(`/rooms/${id}`),
  
  update: (id: string, data: any) =>
    api.put(`/rooms/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/rooms/${id}`),
  
  getAvailable: (params?: any) =>
    api.get('/rooms-available', { params }),
  
  getStats: () =>
    api.get('/rooms-stats'),
  
  getMyRoom: () =>
    api.get('/rooms/my-room'),
  
  assign: (id: string, data: any) =>
    api.post(`/rooms/${id}/assign`, data),
  
  unassign: (id: string, data: any) =>
    api.post(`/rooms/${id}/unassign`, data),
};

// Change Requests API
export const changeRequestsAPI = {
  getAll: (params?: any) =>
    api.get('/change-requests', { params }),
  
  create: (data: any) =>
    api.post('/change-requests', data),
  
  getById: (id: string) =>
    api.get(`/change-requests/${id}`),
  
  update: (id: string, data: any) =>
    api.put(`/change-requests/${id}`, data),
  
  approve: (id: string, data?: any) =>
    api.post(`/change-requests/${id}/approve`, data),
  
  reject: (id: string, data: any) =>
    api.post(`/change-requests/${id}/reject`, data),
  
  delete: (id: string) =>
    api.delete(`/change-requests/${id}`),
};

// Temporary Leave API
export const temporaryLeaveAPI = {
  getAll: (params?: any) =>
    api.get('/temporary-leave', { params }),
  
  create: (data: any) =>
    api.post('/temporary-leave', data),
  
  getById: (id: string) =>
    api.get(`/temporary-leave/${id}`),
  
  update: (id: string, data: any) =>
    api.put(`/temporary-leave/${id}`, data),
  
  approve: (id: string, data?: any) =>
    api.post(`/temporary-leave/${id}/approve`, data),
  
  reject: (id: string, data: any) =>
    api.post(`/temporary-leave/${id}/reject`, data),
  
  markReturned: (id: string) =>
    api.post(`/temporary-leave/${id}/mark-returned`),
  
  getStats: () =>
    api.get('/temporary-leave-stats'),
};

// Clearance API
export const clearanceAPI = {
  getAll: (params?: any) =>
    api.get('/clearance', { params }),
  
  create: (data: any) =>
    api.post('/clearance', data),
  
  getById: (id: string) =>
    api.get(`/clearance/${id}`),
  
  update: (id: string, data: any) =>
    api.put(`/clearance/${id}`, data),
};

// Admin Management API
export const adminAPI = {
  getAllUsers: () =>
    api.get('/users'),
  
  getStudents: () =>
    api.get('/users/students'),
  
  getSupervisors: () =>
    api.get('/users/supervisors'),
  
  getAdministrators: () =>
    api.get('/administrators'),
  
  createAdministrator: (data: any) =>
    api.post('/administrators', data),
  
  updateAdministrator: (id: string, data: any) =>
    api.put(`/administrators/${id}`, data),
  
  resetAdminPassword: (id: string, data: any) =>
    api.post(`/administrators/${id}/reset-password`, data),
  
  updateUserStatus: (id: string, data: any) =>
    api.put(`/users/${id}/status`, data),
  
  deleteUser: (id: string) =>
    api.delete(`/users/${id}`),
};

// Reports API
export const reportsAPI = {
  getOccupancyReport: () =>
    api.get('/reports/occupancy'),
  
  getApplicationsReport: () =>
    api.get('/reports/applications'),
  
  getStudentsReport: () =>
    api.get('/reports/students'),
  
  getRoomsReport: () =>
    api.get('/reports/rooms'),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params?: any) =>
    api.get('/notifications', { params }),
  
  getUnreadCount: () =>
    api.get('/notifications/unread-count'),
  
  markAsRead: (id: string) =>
    api.post(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.post('/notifications/mark-all-read'),
};

// Allocations API
export const allocationsAPI = {
  getStats: () =>
    api.get('/allocations/stats'),
  
  getAll: (params?: any) =>
    api.get('/allocations', { params }),
  
  getById: (id: string) =>
    api.get(`/allocations/${id}`),
  
  autoAllocate: () =>
    api.post('/allocations/auto'),
  
  getReport: () =>
    api.get('/allocation-reports'),
  
  exportReport: (format: 'csv' | 'json' = 'csv') =>
    api.get('/allocation-reports/export', { params: { format } }),
};

export default api;