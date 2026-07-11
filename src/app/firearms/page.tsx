'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Crosshair, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FirearmData {
  id: string;
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
}

export default function FirearmsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [firearms, setFirearms] = useState<FirearmData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFirearms = async () => {
    try {
      const res = await fetch('/api/sessions?limit=1');
      if (res.ok) {
        // For now, firearms list is loaded via Turso queries on the client
        const { getUserFirearms } = await import('@/lib/turso/queries');
        const data = await getUserFirearms(session!.user!.id as string);
        setFirearms(data);
      }
    } catch (err) {
      console.error('Failed to load firearms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchFirearms();
    }
  }, [status, router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this firearm?')) return;

    try {
      const res = await fetch(`/api/firearms/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFirearms((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete firearm:', err);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            My Firearms
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your firearm inventory
          </p>
        </div>
        <Link href="/firearms/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Firearm
          </Button>
        </Link>
      </div>

      {firearms.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
          <Crosshair className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No firearms registered
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Add your first firearm to start tracking sessions.
          </p>
          <Link href="/firearms/add">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Firearm
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {firearms.map((firearm) => (
            <div
              key={firearm.id}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Crosshair className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {firearm.manufacturer} {firearm.model}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {firearm.calibre} · {firearm.firearm_type}
                      {firearm.sight_type ? ` · ${firearm.sight_type}` : ''}
                    </p>
                    {firearm.nickname && (
                      <p className="mt-1 text-sm italic text-gray-500 dark:text-gray-400">
                        &ldquo;{firearm.nickname}&rdquo;
                      </p>
                    )}
                    {firearm.barrel_length && (
                      <p className="text-xs text-gray-400">
                        Barrel: {firearm.barrel_length}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(firearm.id)}
                    className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}