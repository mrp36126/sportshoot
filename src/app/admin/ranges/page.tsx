'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getActiveRanges } from '@/lib/turso/queries';

interface RangeData {
  id: string;
  name: string;
  country: string;
  city: string;
  indoor_outdoor: string;
  num_lanes: number | null;
  active: number;
}

export default function AdminRangesPage() {
  const router = useRouter();
  const { status } = useSession();
  const [ranges, setRanges] = useState<RangeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    getActiveRanges()
      .then(setRanges)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Manage Ranges
          </h1>
          <p className="text-sm text-gray-500">View and manage shooting ranges</p>
        </div>
      </div>

      <div className="space-y-3">
        {ranges.map((range) => (
          <div
            key={range.id}
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {range.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {range.city}, {range.country} · {range.indoor_outdoor}
                  {range.num_lanes ? ` · ${range.num_lanes} lanes` : ''}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}