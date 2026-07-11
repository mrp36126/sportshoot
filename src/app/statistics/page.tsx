'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BarChart3, Target, Crosshair, TrendingUp, Award } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';

interface StatsData {
  total_sessions: number;
  total_shots: number;
  average_final_score: number | null;
  average_raw_score: number | null;
  personal_best: number | null;
  best_group_size: number | null;
  current_ranking: number | null;
}

interface HistoryItem {
  id: string;
  shooting_distance: number;
  final_score: number | null;
  raw_target_score: number | null;
  group_size_mm: number | null;
  created_at: string;
}

export default function StatisticsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      const loadData = async () => {
        try {
          const [statsRes, historyRes] = await Promise.all([
            fetch('/api/statistics'),
            fetch('/api/statistics?type=history&limit=50'),
          ]);

          if (statsRes.ok) {
            const data = await statsRes.json();
            setStats(data.stats);
          }
          if (historyRes.ok) {
            const data = await historyRes.json();
            setHistory(data.history);
          }
        } catch (err) {
          console.error('Failed to load statistics:', err);
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

  // Build chart data (last 20 sessions)
  const chartData = history
    .slice(-20)
    .map((h) => h.final_score ?? h.raw_target_score ?? 0);

  const maxScore = Math.max(...chartData, 100);
  const chartMax = Math.ceil(maxScore / 10) * 10;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Statistics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Detailed analysis of your shooting performance
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
          icon={<Award className="h-5 w-5" />}
          label="Personal Best"
          value={stats?.personal_best?.toString() ?? '—'}
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
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Avg Final Score"
          value={
            stats?.average_final_score
              ? Math.round(stats.average_final_score).toString()
              : '—'
          }
        />
      </div>

      {/* Score Chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Score Progression (Last {chartData.length} Sessions)
        </h2>

        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No session data yet. Complete a session to see your chart.
          </p>
        ) : (
          <div className="flex h-48 items-end justify-between gap-1">
            {chartData.map((score, i) => {
              const heightPercent = (score / chartMax) * 100;
              return (
                <div
                  key={i}
                  className="flex flex-1 flex-col items-center justify-end gap-1"
                  title={`Score: ${score}`}
                >
                  <div
                    className="w-full rounded-t bg-blue-500 transition-all hover:bg-blue-600"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {chartData.length > 0 && (
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>Oldest</span>
            <span>Newest</span>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Sessions
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats?.total_sessions ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Shots Fired
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats?.total_shots ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Current Ranking
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats?.current_ranking ? `#${stats.current_ranking}` : '—'}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Best Group Size
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats?.best_group_size
              ? `${Math.round(stats.best_group_size)}mm`
              : '—'
            }
          </p>
        </div>
      </div>
    </div>
  );
}