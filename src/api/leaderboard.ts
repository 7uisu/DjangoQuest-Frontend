// src/api/leaderboard.ts
import { dashboardApi } from './axios';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  total_xp: number;
  story_progress: number;
  challenges_completed: number;
  achievements_count: number;
  story_mode_gwa: number;
  is_self: boolean;
}

export interface LeaderboardResponse {
  scope: 'classroom' | 'global';
  entries: LeaderboardEntry[];
}

export const getLeaderboard = async (scope: 'classroom' | 'global' = 'classroom', classroomId?: number): Promise<LeaderboardResponse> => {
  const query = classroomId ? `?scope=${scope}&classroom_id=${classroomId}` : `?scope=${scope}`;
  const response = await dashboardApi.get<LeaderboardResponse>(`/leaderboard/${query}`);
  return response.data;
};
