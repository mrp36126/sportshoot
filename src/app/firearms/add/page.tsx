'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { SearchableSelect, type SelectOption } from '@/components/shared/searchable-select';
import { createClient } from '@/lib/supabase/client';
import {
  getManufacturers,
  getModelsByManufacturer,
  getCalibres,
  getFirearmTypes,
  getSightTypes,
} from '@/lib/supabase/queries';

export default function AddFirearmPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const supabase = createClient();

  const [manufacturers, setManufacturers] = useState<SelectOption[]>([]);
  const [models, setModels] = useState<SelectOption[]>([]);
  const [calibres, setCalibres] = useState<SelectOption[]>([]);
  const [firearmTypes, setFirearmTypes] = useState<SelectOption[]>([]);
  const [sightTypes, setSightTypes] = useState<SelectOption[]>([]);

  const [manufacturerId, setManufacturerId] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string | null>(null);
  const [calibreId, setCalibreId] = useState<string | null>(null);
  const [firearmTypeId, setFirearmTypeId] = useState<string | null>(null);
  const [sightTypeId, setSightTypeId] = useState<string | null>(null);
  const [barrelLength, setBarrelLength] = useState('');
  const [nickname, setNickname] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      const [m, c, ft, st] = await Promise.all([
        getManufacturers(),
        getCalibres(),
        getFirearmTypes(),
        getSightTypes(),
      ]);

      setManufacturers(m.map((item) => ({ id: item.id, label: item.name })));
      setCalibres(c.map((item) => ({ id: item.id, label: item.name })));
      setFirearmTypes(ft.map((item) => ({ id: item.id, label: item.name })));
      setSightTypes(st.map((item) => ({ id: item.id, label: item.name })));
    };

    loadData();
  }, [user, isLoading, router]);

  useEffect(() => {
    if (manufacturerId) {
      getModelsByManufacturer(manufacturerId).then((m) =>
        setModels(m.map((item) => ({ id: item.id, label: item.name })))
      );
      setModelId(null);
    } else {
      setModels([]);
    }
  }, [manufacturerId]);

  const handleSave = async () => {
    if (!user || !manufacturerId || !modelId || !calibreId || !firearmTypeId || !sightTypeId) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    const { error: saveError } = await supabase.from('user_firearms').insert({
      user_id: user.id,
      manufacturer_id: manufacturerId,
      model_id: modelId,
      calibre_id: calibreId,
      firearm_type_id: firearmTypeId,
      sight_type_id: sightTypeId,
      barrel_length: barrelLength ? parseFloat(barrelLength) : null,
      nickname: nickname || null,
      notes: notes || null,
    });

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    router.push('/firearms');
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Add Firearm
          </h1>
          <p className="text-sm text-gray-500">Register a new firearm</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Manufacturer *
          </label>
          <SearchableSelect
            options={manufacturers}
            value={manufacturerId}
            onChange={setManufacturerId}
            placeholder="Select manufacturer"
            searchPlaceholder="Search manufacturers..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Model *
          </label>
          <SearchableSelect
            options={models}
            value={modelId}
            onChange={setModelId}
            placeholder={
              manufacturerId ? 'Select model' : 'Select manufacturer first'
            }
            searchPlaceholder="Search models..."
            disabled={!manufacturerId}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Firearm Type *
          </label>
          <SearchableSelect
            options={firearmTypes}
            value={firearmTypeId}
            onChange={setFirearmTypeId}
            placeholder="Select type"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Calibre *
          </label>
          <SearchableSelect
            options={calibres}
            value={calibreId}
            onChange={setCalibreId}
            placeholder="Select calibre"
            searchPlaceholder="Search calibres..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sight Type *
          </label>
          <SearchableSelect
            options={sightTypes}
            value={sightTypeId}
            onChange={setSightTypeId}
            placeholder="Select sight type"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Barrel Length (inches)
          </label>
          <input
            type="number"
            step="0.01"
            value={barrelLength}
            onChange={(e) => setBarrelLength(e.target.value)}
            placeholder="e.g. 4.49"
            className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nickname
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g. Competition Gun"
            className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
            rows={3}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <Button onClick={handleSave} className="w-full" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Firearm'}
        </Button>
      </div>
    </div>
  );
}