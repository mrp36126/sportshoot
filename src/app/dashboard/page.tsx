'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Target,
  Crosshair,
  TrendingUp,
  Trophy,
  Medal,
  Clock,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/shared/stat-card';
import { SessionCard } from '@/components/shared/session-card';
import { Button } from '@/components/ui/button';

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

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      const loadData = async () => {
        try {
          const [statsRes, sessionsRes] = await Promise.all([
            fetch('/api/statistics'),
            fetch('/api/sessions?limit=10'),
          ]);

          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData.stats);
          }
          if (sessionsRes.ok) {
            const sessionsData = await sessionsRes.json();
            setSessions(sessionsData.sessions);
          }
        } catch (err) {
          console.error('Failed to load dashboard data:', err);
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

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back! Here's your shooting overview.
          </p>
        </div>
        <Link href="/sessions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Total Sessions"
          value={stats?.total_sessions ?? 0}
        />
        <StatCard
          icon={<Crosshair className="h-5 w-5" />}
          label="Total Shots"
          value={stats?.total_shots ?? 0}
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
          icon={<Trophy className="h-5 w-5" />}
          label="Best Score"
          value={stats?.personal_best?.toString() ?? '—'}
        />
      </div>

      {/* Ranking */}
      {stats?.current_ranking && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/10">
          <div className="flex items-center gap-3">
            <Medal className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Current Ranking
              </p>
              <p className="text-2xl font-bold text-blue-600">
                #{stats.current_ranking}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Sessions
          </h2>
          {sessions.length > 0 && (
            <Link
              href="/progress"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              View all
            </Link>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              No sessions yet
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Start your first shooting session to see your stats.
            </p>
            <Link href="/sessions/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={{
                  id: session.id,
                  shooting_range_name: session.shooting_range_name,
                  shooting_distance: session.shooting_distance,
                  number_of_shots: session.number_of_shots,
                  total_score: session.final_score,
                  group_size_mm: session.group_size_mm,
                  created_at: session.created_at,
                  status: session.status,
                }}
                onClick={() => router.push(`/sessions/${session.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}