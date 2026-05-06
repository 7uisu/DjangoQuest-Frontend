// src/api/admin.ts
import axios from 'axios';

export interface AdminStats {
  total_students: number;
  total_teachers: number;
  total_classrooms: number;
  total_feedback: number;
  total_announcements: number;
  feedback_by_type: { game: number; website: number; classroom: number };
  feedback_by_role: { student: number; teacher: number };
  avg_game_rating: number;
  avg_website_rating: number;
  avg_classroom_rating: number;
}

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_student: boolean;
  is_teacher: boolean;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
}

export interface AdminClassroom {
  id: number;
  name: string;
  enrollment_code: string;
  teacher_email: string;
  teacher_name: string;
  teacher_id: number;
  student_count: number;
  feedback_count: number;
  announcement_count: number;
}

export interface AuditLogEntry {
  id: number;
  admin_email: string;
  action: string;
  target_type: string;
  target_id: number | null;
  details: string;
  timestamp: string;
}

// Create a dedicated admin API instance
const adminApi = axios.create({
  baseURL: import.meta.env?.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/users', '/api/admin') : '/api/admin',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Inject JWT token
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// ─── Stats ──────────────────────────────────────────────────────
export const getAdminStats = async (): Promise<AdminStats> => {
  const res = await adminApi.get('/stats/');
  return res.data;
};

// ─── Users ──────────────────────────────────────────────────────
export const getAdminUsers = async (search?: string): Promise<AdminUser[]> => {
  const params = search ? { search } : {};
  const res = await adminApi.get('/users/', { params });
  return res.data.results !== undefined ? res.data.results : res.data;
};

export const createAdminUser = async (data: {
  email: string; username: string; password: string;
  first_name: string; last_name: string; role: string;
}): Promise<AdminUser> => {
  const res = await adminApi.post('/users/', data);
  return res.data;
};

export const editAdminUser = async (id: number, data: Record<string, any>): Promise<AdminUser> => {
  const res = await adminApi.patch(`/users/${id}/`, data);
  return res.data;
};

export const deleteAdminUser = async (id: number): Promise<void> => {
  await adminApi.delete(`/users/${id}/`);
};

export const toggleUserActive = async (id: number, is_active: boolean): Promise<AdminUser> => {
  const res = await adminApi.patch(`/users/${id}/`, { is_active });
  return res.data;
};

export const resetAdminUserPassword = async (id: number, new_password: string): Promise<void> => {
  await adminApi.post(`/users/${id}/reset-password/`, { new_password });
};

// ─── Classrooms ─────────────────────────────────────────────────
export const getAdminClassrooms = async (): Promise<AdminClassroom[]> => {
  const res = await adminApi.get('/classrooms/');
  return res.data.results !== undefined ? res.data.results : res.data;
};

export const getAdminClassroomDetail = async (id: number): Promise<any> => {
  const res = await adminApi.get(`/classrooms/${id}/`);
  return res.data;
};

export const editAdminClassroom = async (id: number, data: Record<string, any>): Promise<void> => {
  await adminApi.patch(`/classrooms/${id}/`, data);
};

export const deleteAdminClassroom = async (id: number): Promise<void> => {
  await adminApi.delete(`/classrooms/${id}/`);
};

export const enrollStudent = async (classroomId: number, userId: number): Promise<void> => {
  await adminApi.post(`/classrooms/${classroomId}/enroll/`, { user_id: userId });
};

export const unenrollStudent = async (classroomId: number, userId: number): Promise<void> => {
  await adminApi.post(`/classrooms/${classroomId}/unenroll/`, { user_id: userId });
};

// ─── Feedback ───────────────────────────────────────────────────
export const deleteAdminFeedback = async (id: number): Promise<void> => {
  await adminApi.delete(`/feedback/${id}/`);
};

// ─── Announcements ──────────────────────────────────────────────
export const editAdminAnnouncement = async (id: number, data: { title?: string; body?: string }): Promise<void> => {
  await adminApi.patch(`/announcements/${id}/`, data);
};

export const deleteAdminAnnouncement = async (id: number): Promise<void> => {
  await adminApi.delete(`/announcements/${id}/`);
};

// ─── Audit Log ──────────────────────────────────────────────────
export const getAuditLog = async (): Promise<AuditLogEntry[]> => {
  const res = await adminApi.get('/audit-log/');
  return res.data;
};

// ─── Export helper ──────────────────────────────────────────────
export const downloadExport = (type: 'users' | 'classrooms' | 'feedback') => {
  const token = localStorage.getItem('access_token');
  const url = `/api/admin/${type}/export/`;
  // Use fetch for blob download
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.blob())
    .then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${type}_export.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
};
