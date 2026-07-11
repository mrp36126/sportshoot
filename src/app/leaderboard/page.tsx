'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Medal, Target } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { getLeaderboard } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/client';
import type { Leaderboard } from '@/types/database';

type TabType = 'global' | 'distance' | 'firearm';

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('global');
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    loadLeaderboard();
  }, [user, isLoading, router, activeTab]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await getLeaderboard(activeTab);
    // Enrich with profile display names
    const enriched = await Promise.all(
      data.map(async (entry) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', entry.user_id)
          .single();
        return { ...entry, display_name: profile?.display_name || 'Unknown' };
      })
    );
    setLeaderboard(enriched);
    setLoading(false);
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'global', label: 'Global' },
    { key: 'distance', label: 'By Distance' },
    { key: 'firearm', label: 'By Firearm' },
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

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {leaderboard.map((entry, index) => {
          const rank = entry.rank ?? index + 1;
          const isCurrentUser = entry.user_id === user?.id;

          return (
            <div
              key={entry.id}
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
                    {(entry as unknown as { display_name: string }).display_name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-blue-600">(You)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {entry.total_sessions} sessions · {entry.total_shots} shots
                  </p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {entry.score}
                  </p>
                  {entry.accuracy && (
                    <p className="text-xs text-gray-500">
                      {Math.round(entry.accuracy)}% accuracy
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {leaderboard.length === 0 && !loading && (
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