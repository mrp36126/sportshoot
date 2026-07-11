'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useAuthStore } from '@/stores/auth-store';
import { StatCard } from '@/components/shared/stat-card';
import { SessionCard } from '@/components/shared/session-card';
import { Button } from '@/components/ui/button';
import {
  getUserStatistics,
  getUserSessions,
  getPersonalBests,
} from '@/lib/supabase/queries';
import type { UserStatistic, Session, PersonalBest } from '@/types/database';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [stats, setStats] = useState<UserStatistic | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bests, setBests] = useState<PersonalBest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const loadData = async () => {
        try {
          const [userStats, userSessions, personalBests] = await Promise.all([
            getUserStatistics(user.id),
            getUserSessions(user.id),
            getPersonalBests(user.id),
          ]);
          setStats(userStats);
          setSessions(userSessions);
          setBests(personalBests);
        } catch (err) {
          console.error('Failed to load dashboard data:', err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [user, isLoading, router]);

  if (isLoading || loading) {
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
          label="Accuracy"
          value={
            stats?.current_accuracy
              ? `${Math.round(stats.current_accuracy)}%`
              : '—'
          }
        />
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          label="Best Score"
          value={stats?.personal_best_score ?? '—'}
        />
      </div>

      {/* Personal Bests */}
      {bests.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Personal Bests
          </h2>
          <div className="space-y-2">
            {bests.slice(0, 5).map((best) => (
              <div
                key={best.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <Medal className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {best.category}
                    </p>
                    <p className="text-xs text-gray-500">
                      Score: {best.score}
                      {best.accuracy && ` · ${Math.round(best.accuracy)}%`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {new Date(best.achieved_at).toLocaleDateString()}
                </div>
              </div>
            ))}
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
              href="/sessions"
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
                session={session}
                onClick={() => router.push(`/sessions/${session.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}