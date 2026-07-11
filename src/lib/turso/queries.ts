/**
 * Turso Database Queries
 * 
 * All database operations for the SportShoot application.
 * Uses parameterised SQL to prevent injection attacks.
 */

import { v4 as uuidv4 } from 'uuid';
import { executeQuery, executeStatement } from './client';
import { hashPassword } from '@/lib/auth/password-utils';
import type { InValue } from '@libsql/client';

// ============================================================
// Type Definitions
// ============================================================

export interface DbUser {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  profile_image_url: string | null;
  role: 'user' | 'admin';
  country: string | null;
  province: string | null;
  city: string | null;
  club_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbShootingRange {
  id: string;
  name: string;
  country: string;
  province: string | null;
  city: string;
  indoor_outdoor: 'indoor' | 'outdoor';
  num_lanes: number | null;
  notes: string | null;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface DbManufacturer {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DbFirearmModel {
  id: string;
  manufacturer_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DbCalibre {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DbFirearmType {
  id: string;
  name: string;
  created_at: string;
}

export interface DbSightType {
  id: string;
  name: string;
  created_at: string;
}

export interface DbTargetType {
  id: string;
  name: string;
  max_score: number;
  created_at: string;
}

export interface DbUserFirearm {
  id: string;
  user_id: string;
  manufacturer: string;
  model: string;
  firearm_type: string;
  calibre: string;
  sight_type: string | null;
  barrel_length: number | null;
  nickname: string | null;
  notes: string | null;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface DbShootingSession {
  id: string;
  user_id: string;
  shooting_range_id: string;
  firearm_id: string;
  calibre: string;
  shooting_distance: number;
  number_of_shots: number;
  raw_target_score: number | null;
  distance_multiplier: number | null;
  group_size_mm: number | null;
  grouping_bonus: number | null;
  final_score: number | null;
  before_image_url: string | null;
  after_image_url: string | null;
  status: 'completed' | 'rejected';
  shot_datetime: string | null;
  timezone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// User Operations
// ============================================================

/**
 * Get a user by their email address.
 */
export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const users = await executeQuery<DbUser>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return users[0] || null;
}

/**
 * Get a user by their ID.
 */
export async function getUserById(id: string): Promise<DbUser | null> {
  const users = await executeQuery<DbUser>(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return users[0] || null;
}

/**
 * Create a new user.
 */
export async function createUser(params: {
  email: string;
  displayName: string;
  password: string;
  profileImageUrl?: string;
}): Promise<DbUser> {
  const id = uuidv4();
  const passwordHash = await hashPassword(params.password);

  await executeStatement(
    `INSERT INTO users (id, email, display_name, password_hash, profile_image_url)
     VALUES (?, ?, ?, ?, ?)`,
    [id, params.email, params.displayName, passwordHash, params.profileImageUrl || null]
  );

  return (await getUserById(id))!;
}

/**
 * Update user profile.
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    display_name?: string;
    country?: string | null;
    province?: string | null;
    city?: string | null;
    club_name?: string | null;
    profile_image_url?: string | null;
  }
): Promise<void> {
  const fields: string[] = [];
  const values: InValue[] = [];

  if (updates.display_name !== undefined) {
    fields.push('display_name = ?');
    values.push(updates.display_name);
  }
  if (updates.country !== undefined) {
    fields.push('country = ?');
    values.push(updates.country);
  }
  if (updates.province !== undefined) {
    fields.push('province = ?');
    values.push(updates.province);
  }
  if (updates.city !== undefined) {
    fields.push('city = ?');
    values.push(updates.city);
  }
  if (updates.club_name !== undefined) {
    fields.push('club_name = ?');
    values.push(updates.club_name);
  }
  if (updates.profile_image_url !== undefined) {
    fields.push('profile_image_url = ?');
    values.push(updates.profile_image_url);
  }

  if (fields.length === 0) return;

  fields.push("updated_at = datetime('now')");
  values.push(userId as unknown as InValue);

  await executeStatement(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

// ============================================================
// Master Data Queries
// ============================================================

export async function getActiveRanges(): Promise<DbShootingRange[]> {
  return executeQuery<DbShootingRange>(
    'SELECT * FROM shooting_ranges WHERE active = 1 ORDER BY name'
  );
}

export async function getManufacturers(): Promise<DbManufacturer[]> {
  return executeQuery<DbManufacturer>(
    'SELECT * FROM manufacturers ORDER BY name'
  );
}

export async function getModelsByManufacturer(manufacturerId: string): Promise<DbFirearmModel[]> {
  return executeQuery<DbFirearmModel>(
    'SELECT * FROM firearm_models WHERE manufacturer_id = ? ORDER BY name',
    [manufacturerId]
  );
}

export async function getCalibres(): Promise<DbCalibre[]> {
  return executeQuery<DbCalibre>('SELECT * FROM calibres ORDER BY name');
}

export async function getFirearmTypes(): Promise<DbFirearmType[]> {
  return executeQuery<DbFirearmType>('SELECT * FROM firearm_types ORDER BY name');
}

export async function getSightTypes(): Promise<DbSightType[]> {
  return executeQuery<DbSightType>('SELECT * FROM sight_types ORDER BY name');
}

export async function getTargetTypes(): Promise<DbTargetType[]> {
  return executeQuery<DbTargetType>('SELECT * FROM target_types ORDER BY name');
}

// ============================================================
// User Firearm Operations
// ============================================================

export async function getUserFirearms(userId: string): Promise<DbUserFirearm[]> {
  return executeQuery<DbUserFirearm>(
    'SELECT * FROM user_firearms WHERE user_id = ? AND active = 1 ORDER BY created_at DESC',
    [userId]
  );
}

export async function createUserFirearm(firearm: {
  user_id: string;
  manufacturer: string;
  model: string;
  firearm_type: string;
  calibre: string;
  sight_type?: string | null;
  barrel_length?: number | null;
  nickname?: string | null;
  notes?: string | null;
}): Promise<DbUserFirearm> {
  const id = uuidv4();
  await executeStatement(
    `INSERT INTO user_firearms (id, user_id, manufacturer, model, firearm_type, calibre, sight_type, barrel_length, nickname, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      firearm.user_id,
      firearm.manufacturer,
      firearm.model,
      firearm.firearm_type,
      firearm.calibre,
      firearm.sight_type || null,
      firearm.barrel_length || null,
      firearm.nickname || null,
      firearm.notes || null,
    ]
  );
  const firearms = await executeQuery<DbUserFirearm>(
    'SELECT * FROM user_firearms WHERE id = ?',
    [id]
  );
  return firearms[0];
}

// ============================================================
// Shooting Session Operations
// ============================================================

export async function createShootingSession(session: {
  user_id: string;
  shooting_range_id: string;
  firearm_id: string;
  calibre: string;
  shooting_distance: number;
  number_of_shots: number;
  raw_target_score?: number | null;
  distance_multiplier?: number | null;
  group_size_mm?: number | null;
  grouping_bonus?: number | null;
  final_score?: number | null;
  before_image_url?: string | null;
  after_image_url?: string | null;
  status?: 'completed' | 'rejected';
  shot_datetime?: string | null;
  timezone?: string | null;
  notes?: string | null;
}): Promise<DbShootingSession> {
  const id = uuidv4();
  await executeStatement(
    `INSERT INTO shooting_sessions (
      id, user_id, shooting_range_id, firearm_id, calibre,
      shooting_distance, number_of_shots, raw_target_score,
      distance_multiplier, group_size_mm, grouping_bonus, final_score,
      before_image_url, after_image_url, status, shot_datetime, timezone, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      session.user_id,
      session.shooting_range_id,
      session.firearm_id,
      session.calibre,
      session.shooting_distance,
      session.number_of_shots,
      session.raw_target_score ?? null,
      session.distance_multiplier ?? null,
      session.group_size_mm ?? null,
      session.grouping_bonus ?? null,
      session.final_score ?? null,
      session.before_image_url ?? null,
      session.after_image_url ?? null,
      session.status ?? 'completed',
      session.shot_datetime ?? null,
      session.timezone ?? null,
      session.notes ?? null,
    ]
  );
  const sessions = await executeQuery<DbShootingSession>(
    'SELECT * FROM shooting_sessions WHERE id = ?',
    [id]
  );
  return sessions[0];
}

export async function getUserSessions(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<DbShootingSession[]> {
  return executeQuery<DbShootingSession>(
    `SELECT ss.*, sr.name as shooting_range_name
     FROM shooting_sessions ss
     LEFT JOIN shooting_ranges sr ON ss.shooting_range_id = sr.id
     WHERE ss.user_id = ?
     ORDER BY ss.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
}

export async function getSessionById(id: string): Promise<DbShootingSession | null> {
  const sessions = await executeQuery<DbShootingSession>(
    `SELECT ss.*, sr.name as shooting_range_name
     FROM shooting_sessions ss
     LEFT JOIN shooting_ranges sr ON ss.shooting_range_id = sr.id
     WHERE ss.id = ?`,
    [id]
  );
  return sessions[0] || null;
}

// ============================================================
// Statistics Operations
// ============================================================

export async function getUserStats(userId: string): Promise<{
  total_sessions: number;
  total_shots: number;
  average_final_score: number | null;
  average_raw_score: number | null;
  personal_best: number | null;
  best_group_size: number | null;
  current_ranking: number | null;
}> {
  const stats = await executeQuery<{
    total_sessions: number;
    total_shots: number;
    average_final_score: number | null;
    average_raw_score: number | null;
    personal_best: number | null;
    best_group_size: number | null;
  }>(
    `SELECT
      COUNT(*) as total_sessions,
      COALESCE(SUM(number_of_shots), 0) as total_shots,
      AVG(final_score) as average_final_score,
      AVG(raw_target_score) as average_raw_score,
      MAX(final_score) as personal_best,
      MIN(group_size_mm) as best_group_size
     FROM shooting_sessions
     WHERE user_id = ? AND status = 'completed'`,
    [userId]
  );

  // Get current ranking
  const ranking = await executeQuery<{ rank: number }>(
    `SELECT rank FROM (
      SELECT user_id, MAX(final_score) as best_score,
        ROW_NUMBER() OVER (ORDER BY MAX(final_score) DESC) as rank
      FROM shooting_sessions
      WHERE status = 'completed'
      GROUP BY user_id
    ) WHERE user_id = ?`,
    [userId]
  );

  return {
    ...stats[0],
    current_ranking: ranking[0]?.rank ?? null,
  };
}

export async function getHistoricalSessions(
  userId: string,
  limit: number = 100
): Promise<DbShootingSession[]> {
  return executeQuery<DbShootingSession>(
    `SELECT ss.*, sr.name as shooting_range_name
     FROM shooting_sessions ss
     LEFT JOIN shooting_ranges sr ON ss.shooting_range_id = sr.id
     WHERE ss.user_id = ? AND ss.status = 'completed'
     ORDER BY ss.created_at DESC
     LIMIT ?`,
    [userId, limit]
  );
}

// ============================================================
// Leaderboard Operations
// ============================================================

export type LeaderboardPeriod = 'today' | 'weekly' | 'monthly' | 'yearly' | 'all_time';

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  final_score: number;
  raw_target_score: number;
  total_sessions: number;
  rank: number;
}

export async function getLeaderboard(
  period: LeaderboardPeriod = 'all_time',
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  let dateFilter = '';

  switch (period) {
    case 'today':
      dateFilter = "AND date(ss.created_at) = date('now')";
      break;
    case 'weekly':
      dateFilter = "AND ss.created_at >= datetime('now', '-7 days')";
      break;
    case 'monthly':
      dateFilter = "AND ss.created_at >= datetime('now', '-30 days')";
      break;
    case 'yearly':
      dateFilter = "AND ss.created_at >= datetime('now', '-365 days')";
      break;
    case 'all_time':
    default:
      dateFilter = '';
      break;
  }

  return executeQuery<LeaderboardEntry>(
    `SELECT
      ss.user_id,
      u.display_name,
      MAX(ss.final_score) as final_score,
      MAX(ss.raw_target_score) as raw_target_score,
      COUNT(*) as total_sessions,
      ROW_NUMBER() OVER (ORDER BY MAX(ss.final_score) DESC) as rank
     FROM shooting_sessions ss
     JOIN users u ON ss.user_id = u.id
     WHERE ss.status = 'completed' ${dateFilter}
     GROUP BY ss.user_id
     ORDER BY final_score DESC
     LIMIT ?`,
    [limit]
  );
}

export async function getLeaderboardByDistance(
  distance: number,
  period: LeaderboardPeriod = 'all_time',
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  let dateFilter = '';

  switch (period) {
    case 'today':
      dateFilter = "AND date(ss.created_at) = date('now')";
      break;
    case 'weekly':
      dateFilter = "AND ss.created_at >= datetime('now', '-7 days')";
      break;
    case 'monthly':
      dateFilter = "AND ss.created_at >= datetime('now', '-30 days')";
      break;
    case 'yearly':
      dateFilter = "AND ss.created_at >= datetime('now', '-365 days')";
      break;
    case 'all_time':
    default:
      dateFilter = '';
      break;
  }

  return executeQuery<LeaderboardEntry>(
    `SELECT
      ss.user_id,
      u.display_name,
      MAX(ss.final_score) as final_score,
      MAX(ss.raw_target_score) as raw_target_score,
      COUNT(*) as total_sessions,
      ROW_NUMBER() OVER (ORDER BY MAX(ss.final_score) DESC) as rank
     FROM shooting_sessions ss
     JOIN users u ON ss.user_id = u.id
     WHERE ss.status = 'completed'
       AND ss.shooting_distance = ?
       ${dateFilter}
     GROUP BY ss.user_id
     ORDER BY final_score DESC
     LIMIT ?`,
    [distance, limit]
  );
}

export async function getLeaderboardByCalibre(
  calibre: string,
  period: LeaderboardPeriod = 'all_time',
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  let dateFilter = '';

  switch (period) {
    case 'today':
      dateFilter = "AND date(ss.created_at) = date('now')";
      break;
    case 'weekly':
      dateFilter = "AND ss.created_at >= datetime('now', '-7 days')";
      break;
    case 'monthly':
      dateFilter = "AND ss.created_at >= datetime('now', '-30 days')";
      break;
    case 'yearly':
      dateFilter = "AND ss.created_at >= datetime('now', '-365 days')";
      break;
    case 'all_time':
    default:
      dateFilter = '';
      break;
  }

  return executeQuery<LeaderboardEntry>(
    `SELECT
      ss.user_id,
      u.display_name,
      MAX(ss.final_score) as final_score,
      MAX(ss.raw_target_score) as raw_target_score,
      COUNT(*) as total_sessions,
      ROW_NUMBER() OVER (ORDER BY MAX(ss.final_score) DESC) as rank
     FROM shooting_sessions ss
     JOIN users u ON ss.user_id = u.id
     WHERE ss.status = 'completed'
       AND ss.calibre = ?
       ${dateFilter}
     GROUP BY ss.user_id
     ORDER BY final_score DESC
     LIMIT ?`,
    [calibre, limit]
  );
}

// ============================================================
// Admin Operations
// ============================================================

export async function getAllUsers(): Promise<DbUser[]> {
  return executeQuery<DbUser>(
    'SELECT id, email, display_name, role, country, city, club_name, created_at FROM users ORDER BY created_at DESC'
  );
}

export async function updateUserRole(
  userId: string,
  role: 'user' | 'admin'
): Promise<void> {
  await executeStatement(
    "UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?",
    [role, userId]
  );
}

// ============================================================
// User Firearm Operations
// ============================================================

export async function deleteUserFirearm(
  firearmId: string,
  userId: string
): Promise<void> {
  await executeStatement(
    'DELETE FROM user_firearms WHERE id = ? AND user_id = ?',
    [firearmId, userId]
  );
}
