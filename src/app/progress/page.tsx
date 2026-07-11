'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BarChart3, TrendingUp, Target, Crosshair, Trophy } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { SessionCard } from '@/components/shared/session-card';

interface SessionData {
  id: string;
  shooting_range_name: string | null;
  shooting_distance: number;
  number_of_shots: number;
  raw_target_score: number | null;
  final_score: number | null;
  group_size_mm: number | null;
  created_at: string;
  status: string;
}

interface StatsData {
  total_sessions: number;
  total_shots: number;
  average_final_score: number | null;
  average_raw_score: number | null;
  personal_best: number | null;
  best_group_size: number | null;
  current_ranking: number | null;
}

export default function ProgressPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      const loadData = async () => {
        try {
          const [sessionsRes, statsRes] = await Promise.all([
            fetch('/api/sessions?limit=100'),
            fetch('/api/statistics'),
          ]);

          if (sessionsRes.ok) {
            const data = await sessionsRes.json();
            setSessions(data.sessions);
          }
          if (statsRes.ok) {
            const data = await statsRes.json();
            setStats(data.stats);
          }
        } catch (err) {
          console.error('Failed to load progress data:', err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // Calculate improvement trend
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const recentScores = sortedSessions
    .filter((s) => s.final_score != null)
    .slice(-10);
  const improvementTrend =
    recentScores.length >= 2
      ? recentScores[recentScores.length - 1].final_score! -
        recentScores[0].final_score!
      : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Progress
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track your improvement over time
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          label="Personal Best"
          value={stats?.personal_best?.toString() ?? '—'}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Avg Final Score"
          value={
            stats?.average_final_score
              ? Math.round(stats.average_final_score).toString()
              : '—'
          }
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Avg Raw Score"
          value={
            stats?.average_raw_score
              ? Math.round(stats.average_raw_score).toString()
              : '—'
          }
        />
        <StatCard
          icon={<Crosshair className="h-5 w-5" />}
          label="Best Group"
          value={
            stats?.best_group_size
              ? `${Math.round(stats.best_group_size)}mm`
              : '—'
          }
        />
      </div>

      {/* Improvement Trend */}
      {improvementTrend !== null && (
        <div
          className={`rounded-lg border p-4 ${
            improvementTrend >= 0
              ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/10'
              : 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <TrendingUp
              className={`h-6 w-6 ${
                improvementTrend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            />
            <div>
              <p className="text-sm font-medium">
                {improvementTrend >= 0
                  ? 'Improving'
                  : 'Declining'}{' '}
                (last 10 sessions)
              </p>
              <p
                className={`text-2xl font-bold ${
                  improvementTrend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {improvementTrend >= 0 ? '+' : ''}
                {Math.round(improvementTrend)} points
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Session History */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Session History
        </h2>

        {sessions.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              No sessions yet
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Complete shooting sessions to see your progress.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                onClick={() => router.push(`/sessions/${s.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}