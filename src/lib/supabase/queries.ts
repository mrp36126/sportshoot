import { createClient } from './client';
import type {
  Profile,
  ShootingRange,
  Manufacturer,
  FirearmModel,
  Calibre,
  FirearmType,
  SightType,
  TargetType,
  Distance,
  UserFirearm,
  Session,
  Shot,
  SessionImage,
  Competition,
  CompetitionEntry,
  Leaderboard,
  LeaderboardType,
  Achievement,
  UserAchievement,
  UserStatistic,
  PersonalBest,
} from '@/types/database';

// Master Data Queries (read-only for regular users)

export async function getActiveRanges(search?: string): Promise<ShootingRange[]> {
  const supabase = createClient();
  let query = supabase
    .from('shooting_ranges')
    .select('*')
    .eq('active', true)
    .order('name');

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getManufacturers(): Promise<Manufacturer[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('manufacturers')
    .select('*')
    .order('name');
  return data ?? [];
}

export async function getModelsByManufacturer(manufacturerId: string): Promise<FirearmModel[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('firearm_models')
    .select('*')
    .eq('manufacturer_id', manufacturerId)
    .order('name');
  return data ?? [];
}

export async function getCalibres(): Promise<Calibre[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('calibres')
    .select('*')
    .order('name');
  return data ?? [];
}

export async function getFirearmTypes(): Promise<FirearmType[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('firearm_types')
    .select('*')
    .order('name');
  return data ?? [];
}

export async function getSightTypes(): Promise<SightType[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('sight_types')
    .select('*')
    .order('name');
  return data ?? [];
}

export async function getTargetTypes(): Promise<TargetType[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('target_types')
    .select('*')
    .order('name');
  return data ?? [];
}

export async function getDistances(): Promise<Distance[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('distances')
    .select('*')
    .order('value_meters');
  return data ?? [];
}

// User Firearm Queries

export async function getUserFirearms(userId: string): Promise<UserFirearm[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('user_firearms')
    .select(`
      *,
      manufacturers!inner(name),
      firearm_models!inner(name),
      firearm_types!inner(name),
      calibres!inner(name),
      sight_types!inner(name)
    `)
    .eq('user_id', userId)
    .eq('active', true)
    .order('created_at', { ascending: false });

  return (data ?? []).map((f: Record<string, unknown>) => ({
    ...f,
    manufacturer_name: (f.manufacturers as { name: string })?.name,
    model_name: (f.firearm_models as { name: string })?.name,
    firearm_type_name: (f.firearm_types as { name: string })?.name,
    calibre_name: (f.calibres as { name: string })?.name,
    sight_type_name: (f.sight_types as { name: string })?.name,
  })) as UserFirearm[];
}

// Profile Queries

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}

// Session Queries

export async function getUserSessions(userId: string): Promise<Session[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('sessions')
    .select(`
      *,
      shooting_ranges!inner(name),
      user_firearms!inner(
        nickname,
        manufacturers!inner(name),
        firearm_models!inner(name),
        calibres!inner(name)
      ),
      distances!inner(label),
      target_types!inner(name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  return (data ?? []).map((s: Record<string, unknown>) => ({
    ...s,
    shooting_range_name: (s.shooting_ranges as { name: string })?.name,
    firearm_nickname: (s.user_firearms as Record<string, unknown>)?.nickname,
    manufacturer_name: ((s.user_firearms as Record<string, unknown>)?.manufacturers as { name: string })?.name,
    model_name: ((s.user_firearms as Record<string, unknown>)?.firearm_models as { name: string })?.name,
    calibre_name: ((s.user_firearms as Record<string, unknown>)?.calibres as { name: string })?.name,
    distance_label: (s.distances as { label: string })?.label,
    target_type_name: (s.target_types as { name: string })?.name,
  })) as Session[];
}

export async function getSessionShots(sessionId: string): Promise<Shot[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('shots')
    .select('*')
    .eq('session_id', sessionId)
    .order('shot_number');
  return data ?? [];
}

// Statistics Queries

export async function getUserStatistics(userId: string): Promise<UserStatistic | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('user_statistics')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}

export async function getPersonalBests(userId: string): Promise<PersonalBest[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('personal_bests')
    .select('*')
    .eq('user_id', userId)
    .order('score', { ascending: false });
  return data ?? [];
}

export async function getLeaderboard(type: LeaderboardType, referenceId?: string): Promise<Leaderboard[]> {
  const supabase = createClient();
  let query = supabase
    .from('leaderboards')
    .select('*')
    .eq('leaderboard_type', type)
    .order('rank')
    .limit(50);

  if (referenceId) {
    query = query.eq('reference_id', referenceId);
  }

  const { data } = await query;
  return data ?? [];
}

// Admin Queries

export async function getUsersForAdmin(): Promise<Profile[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function createShootingRange(range: Omit<ShootingRange, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('shooting_ranges')
    .insert(range)
    .select()
    .single();
  return { data, error };
}

export async function updateShootingRange(id: string, updates: Partial<ShootingRange>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('shooting_ranges')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function createManufacturer(name: string, createdBy: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('manufacturers')
    .insert({ name, created_by: createdBy })
    .select()
    .single();
  return { data, error };
}

export async function createFirearmModel(manufacturerId: string, name: string, createdBy: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('firearm_models')
    .insert({ manufacturer_id: manufacturerId, name, created_by: createdBy })
    .select()
    .single();
  return { data, error };
}

export async function createCalibre(name: string, createdBy: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('calibres')
    .insert({ name, created_by: createdBy })
    .select()
    .single();
  return { data, error };
}

export async function createDistance(label: string, valueMeters: number, createdBy: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('distances')
    .insert({ label, value_meters: valueMeters, created_by: createdBy })
    .select()
    .single();
  return { data, error };
}

export async function createTargetType(targetType: Omit<TargetType, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('target_types')
    .insert(targetType)
    .select()
    .single();
  return { data, error };
}

// Session Creation

export async function createSession(session: Omit<Session, 'id' | 'created_at' | 'updated_at' | 'status' | 'average_score'> & { status?: Session['status'], average_score?: number | null }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('sessions')
    .insert({ ...session, status: session.status ?? 'in_progress' })
    .select()
    .single();
  return { data, error };
}

export async function updateSession(id: string, updates: Partial<Session>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function saveShots(shots: Omit<Shot, 'id' | 'created_at'>[]) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('shots')
    .insert(shots)
    .select();
  return { data, error };
}