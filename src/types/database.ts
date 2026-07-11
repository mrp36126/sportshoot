// Database type definitions matching the schema in DATABASE.md

export type UserRole = 'user' | 'admin' | 'trainer';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  country: string | null;
  province: string | null;
  city: string | null;
  club_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ShootingRange {
  id: string;
  name: string;
  country: string;
  province: string | null;
  city: string;
  indoor_outdoor: 'indoor' | 'outdoor';
  num_lanes: number | null;
  notes: string | null;
  active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FirearmModel {
  id: string;
  manufacturer_id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  manufacturer_name?: string;
}

export interface Calibre {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FirearmType {
  id: string;
  name: string;
  created_at: string;
}

export interface SightType {
  id: string;
  name: string;
  created_at: string;
}

export interface RingDefinition {
  ring: number | string;
  radius_mm: number;
  score: number;
  is_x_ring?: boolean;
}

export interface TargetType {
  id: string;
  name: string;
  image_template_url: string | null;
  physical_width: number;
  physical_height: number;
  ring_definitions: RingDefinition[];
  max_score: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Distance {
  id: string;
  label: string;
  value_meters: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UserFirearm {
  id: string;
  user_id: string;
  manufacturer_id: string;
  model_id: string;
  firearm_type_id: string;
  calibre_id: string;
  sight_type_id: string;
  barrel_length: number | null;
  nickname: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  manufacturer_name?: string;
  model_name?: string;
  firearm_type_name?: string;
  calibre_name?: string;
  sight_type_name?: string;
}

export type SessionStatus = 'in_progress' | 'processing' | 'validating' | 'completed' | 'rejected';

export interface Session {
  id: string;
  user_id: string;
  shooting_range_id: string;
  firearm_id: string;
  distance_id: string;
  target_type_id: string;
  expected_shots: number;
  detected_shots: number | null;
  total_score: number | null;
  average_score: number | null;
  accuracy: number | null;
  group_size_mm: number | null;
  before_image_url: string | null;
  after_image_url: string | null;
  annotated_image_url: string | null;
  status: SessionStatus;
  shot_datetime: string | null;
  timezone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  shooting_range_name?: string;
  firearm_nickname?: string;
  manufacturer_name?: string;
  model_name?: string;
  calibre_name?: string;
  distance_label?: string;
  target_type_name?: string;
}

export interface Shot {
  id: string;
  session_id: string;
  shot_number: number;
  x_coordinate: number | null;
  y_coordinate: number | null;
  ring_score: number | null;
  is_x_ring: boolean;
  is_detected: boolean;
  created_at: string;
}

export type ImageType = 'before' | 'after' | 'annotated';

export interface SessionImage {
  id: string;
  session_id: string;
  image_type: ImageType;
  storage_path: string;
  public_url: string;
  width: number | null;
  height: number | null;
  file_size_bytes: number | null;
  captured_at: string;
  created_at: string;
}

export type CompetitionType = 'accuracy' | 'speed' | 'precision' | 'custom';

export interface Competition {
  id: string;
  name: string;
  description: string | null;
  competition_type: CompetitionType;
  target_type_id: string;
  distance_id: string;
  start_date: string;
  end_date: string;
  max_entries: number | null;
  is_active: boolean;
  rules: Record<string, unknown> | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CompetitionEntry {
  id: string;
  competition_id: string;
  session_id: string;
  user_id: string;
  score: number | null;
  rank: number | null;
  created_at: string;
}

export type LeaderboardType = 'global' | 'distance' | 'firearm' | 'calibre' | 'monthly' | 'weekly' | 'club';

export interface Leaderboard {
  id: string;
  leaderboard_type: LeaderboardType;
  reference_id: string | null;
  user_id: string;
  score: number;
  accuracy: number | null;
  total_sessions: number;
  total_shots: number;
  rank: number | null;
  period_start: string | null;
  period_end: string | null;
  updated_at: string;
}

export type AchievementCriteriaType = 'total_sessions' | 'total_shots' | 'accuracy_threshold' | 'perfect_score' | 'streak' | 'competition_win' | 'custom';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  criteria_type: AchievementCriteriaType;
  criteria_value: Record<string, unknown>;
  points: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  session_id: string | null;
  progress: Record<string, unknown> | null;
  earned_at: string;
}

export interface UserStatistic {
  id: string;
  user_id: string;
  total_sessions: number;
  total_shots: number;
  current_accuracy: number | null;
  personal_best_score: number | null;
  personal_best_session_id: string | null;
  current_ranking: number | null;
  total_achievements: number;
  updated_at: string;
}

export interface PersonalBest {
  id: string;
  user_id: string;
  category: 'overall' | 'distance' | 'firearm' | 'calibre' | 'target_type';
  reference_id: string | null;
  session_id: string;
  score: number;
  accuracy: number | null;
  group_size_mm: number | null;
  achieved_at: string;
  created_at: string;
}