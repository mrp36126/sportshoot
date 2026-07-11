'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Trophy, Medal, Target } from 'lucide-react';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  final_score: number;
  raw_target_score: number;
  total_sessions: number;
  rank: number;
}

type Period = 'today' | 'weekly' | 'monthly' | 'yearly' | 'all_time';

export default function LeaderboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activePeriod, setActivePeriod] = useState<Period>('all_time');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?period=${activePeriod}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    loadLeaderboard();
  }, [status, router, activePeriod]);

  const periods: { key: Period; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
    { key: 'all_time', label: 'All Time' },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Leaderboards
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Top shooters and rankings
          </p>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {periods.map((period) => (
          <button
            key={period.key}
            onClick={() => setActivePeriod(period.key)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activePeriod === period.key
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {entries.map((entry, index) => {
          const rank = entry.rank ?? index + 1;
          const isCurrentUser = entry.user_id === session?.user?.id;

          return (
            <div
              key={entry.user_id}
              className={`rounded-lg border px-4 py-3 transition-colors ${
                isCurrentUser
                  ? 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/10'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex h-10 w-10 items-center justify-center">
                  {rank === 1 ? (
                    <Medal className="h-8 w-8 text-yellow-500" />
                  ) : rank === 2 ? (
                    <Medal className="h-8 w-8 text-gray-400" />
                  ) : rank === 3 ? (
                    <Medal className="h-8 w-8 text-amber-600" />
                  ) : (
                    <span className="text-lg font-bold text-gray-400">
                      {rank}
                    </span>
                  )}
                </div>

                {/* User info */}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {entry.display_name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-blue-600">(You)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {entry.total_sessions} sessions
                  </p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {entry.final_score}
                  </p>
                  <p className="text-xs text-gray-500">
                    Best: {entry.raw_target_score}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {entries.length === 0 && !loading && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              No rankings yet
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Complete sessions to appear on the leaderboard.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}