'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { getActiveRanges } from '@/lib/supabase/queries';
import type { ShootingRange } from '@/types/database';

export default function AdminRangesPage() {
  const router = useRouter();
  const { isAdmin, isLoading, user } = useAuthStore();
  const supabase = createClient();
  const [ranges, setRanges] = useState<ShootingRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ShootingRange | null>(null);

  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [indoorOutdoor, setIndoorOutdoor] = useState<'indoor' | 'outdoor'>('indoor');
  const [numLanes, setNumLanes] = useState('');
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }

    loadRanges();
  }, [isAdmin, isLoading, router]);

  const loadRanges = async () => {
    const data = await getActiveRanges();
    setRanges(data);
    setLoading(false);
  };

  const resetForm = () => {
    setName('');
    setCountry('');
    setProvince('');
    setCity('');
    setIndoorOutdoor('indoor');
    setNumLanes('');
    setNotes('');
    setActive(true);
    setShowForm(false);
    setEditing(null);
  };

  const handleEdit = (range: ShootingRange) => {
    setName(range.name);
    setCountry(range.country);
    setProvince(range.province || '');
    setCity(range.city);
    setIndoorOutdoor(range.indoor_outdoor);
    setNumLanes(range.num_lanes?.toString() || '');
    setNotes(range.notes || '');
    setActive(range.active);
    setEditing(range);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user) return;
    const data = {
      name,
      country,
      province: province || null,
      city,
      indoor_outdoor: indoorOutdoor,
      num_lanes: numLanes ? parseInt(numLanes) : null,
      notes: notes || null,
      active,
      created_by: user.id,
    };

    if (editing) {
      await supabase.from('shooting_ranges').update(data).eq('id', editing.id);
    } else {
      await supabase.from('shooting_ranges').insert(data);
    }

    resetForm();
    loadRanges();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this range?')) return;
    await supabase.from('shooting_ranges').update({ active: false }).eq('id', id);
    loadRanges();
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Shooting Ranges
            </h1>
            <p className="text-sm text-gray-500">
              Manage shooting range locations
            </p>
          </div>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Range
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
            {editing ? 'Edit Range' : 'Add New Range'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-600 dark:bg-gray-800"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Country *</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Province/State</label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Indoor/Outdoor</label>
              <select
                value={indoorOutdoor}
                onChange={(e) => setIndoorOutdoor(e.target.value as 'indoor' | 'outdoor')}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-600 dark:bg-gray-800"
              >
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Number of Lanes</label>
              <input
                type="number"
                value={numLanes}
                onChange={(e) => setNumLanes(e.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleSave} disabled={!name || !country || !city}>
              {editing ? 'Update' : 'Save'}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Ranges List */}
      <div className="space-y-2">
        {ranges.map((range) => (
          <div
            key={range.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
          >
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {range.name}
              </p>
              <p className="text-sm text-gray-500">
                {range.city}, {range.country}
                {range.indoor_outdoor === 'indoor' ? ' · Indoor' : ' · Outdoor'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(range)}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(range.id)}
                className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}