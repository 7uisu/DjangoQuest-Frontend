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
  first_name?: string;
  last_name?: string;
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
  thesis_gwa?: number;
  complete_gwa?: number;
  thesis_status?: { progress: number; completed: boolean; completed_at: string };
  total_xp?: number;
  achievements_count?: number;
}

export interface ClassroomDetailData extends ClassroomData {
  students: StudentData[];
}

export interface StudentClassmateData {
  id: number;
  username: string;
  is_self: boolean;
  total_xp: number;
}

export interface StudentCurrentClassroomData {
  id: number;
  name: string;
  teacher: string;
  teacher_name: string;
  student_count: number;
  classmates: StudentClassmateData[];
}

export interface StudentClassroomSummaryData {
  id: number;
  name: string;
  teacher: string;
  teacher_name: string;
  student_count: number;
}

export interface PasswordResetResponse {
  detail: string;
  new_password: string;
}

// List teacher's classrooms
export const getClassrooms = async (): Promise<ClassroomData[]> => {
  const response = await dashboardApi.get<any>('/classrooms/');
  return response.data.results ?? response.data;
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

// Student read-only view of their enrolled classroom
export const getMyClassroom = async (): Promise<StudentCurrentClassroomData> => {
  const response = await dashboardApi.get<StudentCurrentClassroomData>('/my-classroom/');
  return response.data;
};

export const getMyClassrooms = async (): Promise<StudentClassroomSummaryData[]> => {
  const response = await dashboardApi.get<StudentClassroomSummaryData[]>('/my-classrooms/');
  return response.data;
};

export const getMyClassroomDetail = async (id: number): Promise<StudentCurrentClassroomData> => {
  const response = await dashboardApi.get<StudentCurrentClassroomData>(`/my-classroom/${id}/`);
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
