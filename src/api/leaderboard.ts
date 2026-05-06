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

export const getLeaderboard = async (scope: 'classroom' | 'global' = 'classroom'): Promise<LeaderboardResponse> => {
  const response = await dashboardApi.get<LeaderboardResponse>(`/leaderboard/?scope=${scope}`);
  return response.data;
};
