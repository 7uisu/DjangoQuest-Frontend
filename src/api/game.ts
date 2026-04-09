import { gameApi } from './axios';

// Unenroll entirely from the current classroom
export const unenrollClassroom = async (): Promise<{ detail: string }> => {
  const response = await gameApi.post<{ detail: string }>('/unenroll/');
  return response.data;
};

// Enroll in a classroom given an enrollment code
export const enrollClassroom = async (enrollmentCode: string): Promise<{ detail: string, classroom_name: string, teacher: string }> => {
  const response = await gameApi.post<{ detail: string, classroom_name: string, teacher: string }>('/enroll/', {
    enrollment_code: enrollmentCode
  });
  return response.data;
};
