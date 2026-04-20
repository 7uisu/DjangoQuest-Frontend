// src/api/dashboard.ts
import { dashboardApi } from './axios';

export interface ClassroomData {
  id: number;
  name: string;
  enrollment_code: string;
  student_count: number;
  created_at: string;
}

export interface StudentData {
  id: number;
  username: string;
  email: string;
  date_joined: string;
  story_progress: number;
  challenges_completed: number;
  learning_modules_completed: number;
  ch1_quiz_score: number;
  ch1_did_remedial: boolean;
  ch1_remedial_score: number;
  detailed_grades: any[];
  story_mode_gwa?: number;
  learning_mode_gwa?: number;
  learning_mode_detailed_grades?: { professor: string; grade: number; label?: string }[];
}

export interface ClassroomDetailData extends ClassroomData {
  students: StudentData[];
}

export interface PasswordResetResponse {
  detail: string;
  new_password: string;
}

// List teacher's classrooms
export const getClassrooms = async (): Promise<ClassroomData[]> => {
  const response = await dashboardApi.get<ClassroomData[]>('/classrooms/');
  return response.data;
};

// Create a new classroom
export const createClassroom = async (name: string): Promise<ClassroomData> => {
  const response = await dashboardApi.post<ClassroomData>('/classrooms/', { name });
  return response.data;
};

// Get classroom detail with students
export const getClassroomDetail = async (id: number): Promise<ClassroomDetailData> => {
  const response = await dashboardApi.get<ClassroomDetailData>(`/classrooms/${id}/`);
  return response.data;
};

// Reset a student's password
export const resetStudentPassword = async (studentId: number): Promise<PasswordResetResponse> => {
  const response = await dashboardApi.post<PasswordResetResponse>(`/students/${studentId}/reset-password/`);
  return response.data;
};

// Update classroom name
export const updateClassroom = async (id: number, name: string): Promise<ClassroomData> => {
  const response = await dashboardApi.patch<ClassroomData>(`/classrooms/${id}/`, { name });
  return response.data;
};

// Delete classroom
export const deleteClassroom = async (id: number): Promise<void> => {
  await dashboardApi.delete(`/classrooms/${id}/`);
};

// Remove student from classroom
export const removeStudent = async (classroomId: number, studentId: number): Promise<{ detail: string }> => {
  const response = await dashboardApi.post<{ detail: string }>(`/classrooms/${classroomId}/remove-student/${studentId}/`);
  return response.data;
};
