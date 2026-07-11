'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useSessionWizardStore } from '@/stores/session-wizard-store';
import { Button } from '@/components/ui/button';
import { WizardLayout } from '@/components/shared/wizard-layout';
import { SearchableSelect, type SelectOption } from '@/components/shared/searchable-select';
import { NumericInput } from '@/components/shared/numeric-input';
import { CameraCapture } from '@/components/shared/camera-capture';
import { createClient } from '@/lib/supabase/client';
import {
  getActiveRanges,
  getManufacturers,
  getModelsByManufacturer,
  getCalibres,
  getFirearmTypes,
  getSightTypes,
  getTargetTypes,
  getDistances,
  getUserFirearms,
  createSession,
  updateSession,
  saveShots,
} from '@/lib/supabase/queries';
import type { UserFirearm } from '@/types/database';

const TOTAL_STEPS = 12;

function WizardStep1_SelectRange({
  onNext,
}: {
  onNext: () => void;
}) {
  const { shootingRangeId, setShootingRangeId } = useSessionWizardStore();
  const [ranges, setRanges] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveRanges().then((data) => {
      setRanges(
        data.map((r) => ({
          id: r.id,
          label: r.name,
          subtitle: `${r.city}, ${r.country}`,
        }))
      );
      setLoading(false);
    });
  }, []);

  return (
    <WizardLayout
      title="Select Range"
      step={1}
      totalSteps={TOTAL_STEPS}
      footer={
        <Button
          className="w-full"
          disabled={!shootingRangeId || loading}
          onClick={onNext}
        >
          Next
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select the shooting range where you're shooting.
        </p>
        <SearchableSelect
          options={ranges}
          value={shootingRangeId}
          onChange={setShootingRangeId}
          placeholder="Search shooting ranges..."
          searchPlaceholder="Type to search ranges..."
          emptyMessage="No ranges found"
          onRequestNew={() => alert('Request sent to admin')}
          requestNewLabel="Request admin to add a new range"
        />
      </div>
    </WizardLayout>
  );
}

function WizardStep2_SelectFirearm({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { user } = useAuthStore();
  const { firearmId, setFirearmId } = useSessionWizardStore();
  const [firearms, setFirearms] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getUserFirearms(user.id).then((data) => {
        setFirearms(
          data.map((f: UserFirearm) => ({
            id: f.id,
            label: `${f.manufacturer_name} ${f.model_name}`,
            subtitle: `${f.calibre_name} · ${f.nickname || ''}`.trim(),
          }))
        );
        setLoading(false);
      });
    }
  }, [user]);

  return (
    <WizardLayout
      title="Select Firearm"
      step={2}
      totalSteps={TOTAL_STEPS}
      onBack={onBack}
      canGoBack={true}
      footer={
        <Button
          className="w-full"
          disabled={!firearmId || loading}
          onClick={onNext}
        >
          Next
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select the firearm you're using for this session.
        </p>
        <SearchableSelect
          options={firearms}
          value={firearmId}
          onChange={setFirearmId}
          placeholder="Select your firearm..."
          searchPlaceholder="Search firearms..."
          emptyMessage="No firearms registered"
        />
      </div>
    </WizardLayout>
  );
}

function WizardStep3_SelectDistance({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { distanceId, setDistanceId } = useSessionWizardStore();
  const [distances, setDistances] = useState<SelectOption[]>([]);

  useEffect(() => {
    getDistances().then((data) => {
      setDistances(
        data.map((d) => ({
          id: d.id,
          label: d.label,
          subtitle: `${d.value_meters}m`,
        }))
      );
    });
  }, []);

  return (
    <WizardLayout
      title="Select Distance"
      step={3}
      totalSteps={TOTAL_STEPS}
      onBack={onBack}
      canGoBack={true}
      footer={
        <Button
          className="w-full"
          disabled={!distanceId}
          onClick={onNext}
        >
          Next
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select the shooting distance.
        </p>
        <SearchableSelect
          options={distances}
          value={distanceId}
          onChange={setDistanceId}
          placeholder="Select distance..."
          searchPlaceholder="Search distances..."
        />
      </div>
    </WizardLayout>
  );
}

function WizardStep4_SelectTarget({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { targetTypeId, setTargetTypeId } = useSessionWizardStore();
  const [targets, setTargets] = useState<SelectOption[]>([]);

  useEffect(() => {
    getTargetTypes().then((data) => {
      setTargets(
        data.map((t) => ({
          id: t.id,
          label: t.name,
          subtitle: `Max score: ${t.max_score}`,
        }))
      );
    });
  }, []);

  return (
    <WizardLayout
      title="Select Target"
      step={4}
      totalSteps={TOTAL_STEPS}
      onBack={onBack}
      canGoBack={true}
      footer={
        <Button
          className="w-full"
          disabled={!targetTypeId}
          onClick={onNext}
        >
          Next
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select the target type you're shooting at.
        </p>
        <SearchableSelect
          options={targets}
          value={targetTypeId}
          onChange={setTargetTypeId}
          placeholder="Select target type..."
          searchPlaceholder="Search targets..."
        />
      </div>
    </WizardLayout>
  );
}

function WizardStep5_ExpectedShots({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { expectedShots, setExpectedShots } = useSessionWizardStore();

  return (
    <WizardLayout
      title="Expected Shots"
      step={5}
      totalSteps={TOTAL_STEPS}
      onBack={onBack}
      canGoBack={true}
      footer={
        <Button
          className="w-full"
          disabled={!expectedShots || expectedShots <= 0}
          onClick={onNext}
        >
          Next
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          How many shots are you planning to fire in this session?
        </p>
        <div className="flex justify-center py-8">
          <NumericInput
            label="Number of Shots"
            value={expectedShots}
            onChange={setExpectedShots}
            min={1}
            max={200}
            helperText="Enter the expected number of shots"
          />
        </div>
      </div>
    </WizardLayout>
  );
}

function WizardStep6_CaptureBefore({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { setBeforeImageUrl } = useSessionWizardStore();

  const handleCapture = useCallback(
    async (file: File, previewUrl: string) => {
      // Upload to Supabase Storage
      const supabase = createClient();
      const fileName = `before-${Date.now()}.jpg`;
      const { data } = await supabase.storage
        .from('targets')
        .upload(`before/${fileName}`, file);

      if (data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('targets').getPublicUrl(data.path);
        setBeforeImageUrl(publicUrl);
      } else {
        // Fallback to local preview
        setBeforeImageUrl(previewUrl);
      }

      onNext();
    },
    [setBeforeImageUrl, onNext]
  );

  return (
    <WizardLayout
      title="Capture Clean Target"
      step={6}
      totalSteps={TOTAL_STEPS}
      onBack={onBack}
      canGoBack={true}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Capture a photo of your clean target before shooting.
        </p>
        <CameraCapture
          onCapture={handleCapture}
          label="Capture Clean Target"
        />
      </div>
    </WizardLayout>
  );
}

function WizardStep7_Shooting({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { expectedShots } = useSessionWizardStore();

  return (
    <WizardLayout
      title="Ready to Shoot"
      step={7}
      totalSteps={TOTAL_STEPS}
      onBack={onBack}
      canGoBack={true}
      footer={
        <Button className="w-full" onClick={onNext}>
          Continue
        </Button>
      }
    >
      <div className="space-y-6 py-8 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
          <span className="text-4xl font-bold text-blue-600">
            {expectedShots}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Complete Your Course of Fire
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Fire {expectedShots} shots at the target.
            <br />
            When you're done, tap continue to capture the result.
          </p>
        </div>
      </div>
    </WizardLayout>
  );
}

function WizardStep8_CaptureAfter({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { setAfterImageUrl, beforeImageUrl } = useSessionWizardStore();

  const handleCapture = useCallback(
    async (file: File, previewUrl: string) => {
      const supabase = createClient();
      const fileName = `after-${Date.now()}.jpg`;
      const { data } = await supabase.storage
        .from('targets')
        .upload(`after/${fileName}`, file);

      if (data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('targets').getPublicUrl(data.path);
        setAfterImageUrl(publicUrl);
      } else {
        setAfterImageUrl(previewUrl);
      }

      onNext();
    },
    [setAfterImageUrl, onNext]
  );

  return (
    <WizardLayout
      title="Capture Completed Target"
      step={8}
      totalSteps={TOTAL_STEPS}
      onBack={onBack}
      canGoBack={true}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Capture a photo of your completed target.
        </p>
        <CameraCapture
          onCapture={handleCapture}
          label="Capture Completed Target"
          showSideBySide={true}
          comparisonImage={beforeImageUrl}
        />
      </div>
    </WizardLayout>
  );
}

function WizardStep9_Processing({
  onNext,
}: {
  onNext: () => void;
}) {
  const { setIsProcessing, setProcessingResults, expectedShots } = useSessionWizardStore();
  const [progress, setProgress] = useState('');
  const [step, setStep] = useState(0);

  const steps = [
    'Detecting target...',
    'Correcting perspective...',
    'Detecting bullet holes...',
    'Calculating scores...',
    'Complete!',
  ];

  useEffect(() => {
    setIsProcessing(true);

    const runProcessing = async () => {
      for (let i = 0; i < steps.length; i++) {
        setStep(i);
        setProgress(steps[i]);
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
      }

      // Mock processing results (will be replaced with actual OpenCV.js)
      const mockShots = Array.from({ length: expectedShots ?? 10 }, (_, i) => ({
        shotNumber: i + 1,
        xCoordinate: (Math.random() - 0.5) * 60,
        yCoordinate: (Math.random() - 0.5) * 60,
        ringScore: Math.floor(Math.random() * 5) + 6,
        isXRing: Math.random() > 0.8,
      }));

      const totalScore = mockShots.reduce((sum, s) => sum + s.ringScore, 0);
      const maxScore = (expectedShots ?? 10) * 10;
      const accuracy = (totalScore / maxScore) * 100;

      setProcessingResults({
        detectedShots: mockShots.length,
        totalScore,
        accuracy,
        groupSize: Math.random() * 50 + 20,
        shots: mockShots,
      });

      setIsProcessing(false);
      setTimeout(onNext, 500);
    };

    runProcessing();
  }, [expectedShots, setIsProcessing, setProcessingResults, onNext, steps]);

  return (
    <WizardLayout title="Processing Target..." step={9} totalSteps={TOTAL_STEPS}>
      <div className="space-y-6 py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
        <div className="space-y-2">
          {steps.slice(0, step + 1).map((s, i) => (
            <p
              key={i}
              className={`text-sm ${
                i === step
                  ? 'font-medium text-blue-600'
                  : i < step
                    ? 'text-green-500'
                    : 'text-gray-400'
              }`}
            >
              {i < step ? '✓' : i === step ? '⟳' : '○'} {s}
            </p>
          ))}
        </div>
      </div>
    </WizardLayout>
  );
}

function WizardStep10_Validation({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const {
    expectedShots,
    detectedShots,
    setMismatchDetected,
    mismatchDetected,
    setStep,
  } = useSessionWizardStore();

  useEffect(() => {
    if (expectedShots !== detectedShots) {
      setMismatchDetected(true);
    }
  }, [expectedShots, detectedShots, setMismatchDetected]);

  const handleAccept = () => {
    setMismatchDetected(false);
    onNext();
  };

  const handleReprocess = () => {
    setStep('processing');
  };

  return (
    <WizardLayout
      title="Validation"
      step={10}
      totalSteps={TOTAL_STEPS}
      onBack={onBack}
      canGoBack={true}
      footer={
        <div className="space-y-2">
          {mismatchDetected ? (
            <>
              <Button className="w-full" onClick={handleReprocess}>
                Reprocess
              </Button>
              <Button className="w-full" variant="outline" onClick={handleAccept}>
                Accept Detected Results
              </Button>
            </>
          ) : (
            <Button className="w-full" onClick={onNext}>
              Next
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6 py-4">
        {mismatchDetected ? (
          <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-6 text-center dark:border-amber-700 dark:bg-amber-900/20">
            <p className="text-lg font-semibold text-amber-800 dark:text-amber-200">
              Shot Count Mismatch
            </p>
            <div className="mt-4 flex justify-center gap-8">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {expectedShots}
                </p>
                <p className="text-sm text-gray-500">Expected</p>
              </div>
              <div className="text-2xl text-gray-300">vs</div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {detectedShots}
                </p>
                <p className="text-sm text-gray-500">Detected</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">
              The number of detected shots doesn't match. You can
              reprocess the image or accept the detected results.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-green-300 bg-green-50 p-6 text-center dark:border-green-700 dark:bg-green-900/20">
            <p className="text-lg font-semibold text-green-800 dark:text-green-200">
              ✓ Shots Match
            </p>
            <p className="mt-2 text-sm text-green-700 dark:text-green-300">
              {detectedShots} shots detected — matches expected count.
            </p>
          </div>
        )}
      </div>
    </WizardLayout>
  );
}

function WizardStep11_Review({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const store = useSessionWizardStore();
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);

    try {
      const { data: session, error: sessionError } = await createSession({
        user_id: user.id,
        shooting_range_id: store.shootingRangeId!,
        firearm_id: store.firearmId!,
        distance_id: store.distanceId!,
        target_type_id: store.targetTypeId!,
        expected_shots: store.expectedShots!,
        detected_shots: store.detectedShots,
        total_score: store.totalScore,
        average_score: store.totalScore && store.detectedShots ? Math.round(store.totalScore / store.detectedShots) : null,
        accuracy: store.accuracy,
        group_size_mm: store.groupSize,
        before_image_url: store.beforeImageUrl,
        after_image_url: store.afterImageUrl,
        annotated_image_url: store.annotatedImageUrl,
        status: 'completed',
        shot_datetime: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notes: null,
      });

      if (sessionError || !session) {
        throw new Error(sessionError?.message || 'Failed to create session');
      }

      // Save shots
      const { error: shotsError } = await saveShots(
        store.shots.map((s) => ({
          session_id: session.id,
          shot_number: s.shotNumber,
          x_coordinate: s.xCoordinate,
          y_coordinate: s.yCoordinate,
          ring_score: s.ringScore,
          is_x_ring: s.isXRing,
          is_detected: true,
        }))
      );

      if (shotsError) {
        console.error('Failed to save shots:', shotsError);
      }

      store.setSessionId(session.id);
      onNext();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save session');
      setSaving(false);
    }
  };

  return (
    <WizardLayout
      title="Review & Save"
      step={11}
      totalSteps={TOTAL_STEPS}
      onBack={onBack}
      canGoBack={true}
      footer={
        <Button
          className="w-full"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Session'}
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Session Summary */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">
            Session Summary
          </h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500">Range:</span> Range selected</p>
            <p><span className="text-gray-500">Firearm:</span> Firearm selected</p>
            <p><span className="text-gray-500">Shots:</span> {store.expectedShots} expected / {store.detectedShots} detected</p>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase">
            Results
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {store.totalScore}
              </p>
              <p className="text-xs text-gray-500">Total Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {store.accuracy ? `${Math.round(store.accuracy)}%` : '—'}
              </p>
              <p className="text-xs text-gray-500">Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {store.groupSize ? `${Math.round(store.groupSize)}mm` : '—'}
              </p>
              <p className="text-xs text-gray-500">Group Size</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {store.shots.filter((s) => s.isXRing).length}
              </p>
              <p className="text-xs text-gray-500">X-Rings</p>
            </div>
          </div>
        </div>

        {/* Shot Breakdown */}
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">
              Shot Breakdown
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {store.shots.map((shot) => (
              <div
                key={shot.shotNumber}
                className="flex items-center justify-between px-4 py-2"
              >
                <span className="text-sm text-gray-500">
                  Shot {shot.shotNumber}
                </span>
                <div className="flex items-center gap-2">
                  {shot.isXRing && (
                    <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      X
                    </span>
                  )}
                  <span className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100">
                    {shot.ringScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {saveError && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {saveError}
          </div>
        )}
      </div>
    </WizardLayout>
  );
}

function WizardStep12_Complete() {
  const { totalScore, accuracy, groupSize } = useSessionWizardStore();
  const router = useRouter();

  return (
    <WizardLayout title="Session Saved!" step={12} totalSteps={TOTAL_STEPS}>
      <div className="space-y-6 py-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
          <span className="text-4xl">🎯</span>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Session Complete
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Your shooting session has been saved successfully.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-2xl font-bold text-blue-600">{totalScore}</p>
            <p className="text-xs text-blue-600">Score</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <p className="text-2xl font-bold text-green-600">
              {accuracy ? `${Math.round(accuracy)}%` : '—'}
            </p>
            <p className="text-xs text-green-600">Accuracy</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
            <p className="text-2xl font-bold text-purple-600">
              {groupSize ? `${Math.round(groupSize)}mm` : '—'}
            </p>
            <p className="text-xs text-purple-600">Group</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              useSessionWizardStore.getState().reset();
              router.push('/sessions/new');
            }}
          >
            New Session
          </Button>
        </div>
      </div>
    </WizardLayout>
  );
}

export default function NewSessionPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const { currentStep, setStep, goBack, reset } = useSessionWizardStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Reset the wizard on mount
  useEffect(() => {
    reset();
  }, [reset]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const handleNext = () => {
    const stepOrder = [
      'select-range',
      'select-firearm',
      'select-distance',
      'select-target',
      'expected-shots',
      'capture-before',
      'shooting',
      'capture-after',
      'processing',
      'validation',
      'review',
      'complete',
    ] as const;
    const currentIndex = stepOrder.indexOf(currentStep as typeof stepOrder[number]);
    if (currentIndex < stepOrder.length - 1) {
      setStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    goBack();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'select-range':
        return <WizardStep1_SelectRange onNext={handleNext} />;
      case 'select-firearm':
        return <WizardStep2_SelectFirearm onNext={handleNext} onBack={handleBack} />;
      case 'select-distance':
        return <WizardStep3_SelectDistance onNext={handleNext} onBack={handleBack} />;
      case 'select-target':
        return <WizardStep4_SelectTarget onNext={handleNext} onBack={handleBack} />;
      case 'expected-shots':
        return <WizardStep5_ExpectedShots onNext={handleNext} onBack={handleBack} />;
      case 'capture-before':
        return <WizardStep6_CaptureBefore onNext={handleNext} onBack={handleBack} />;
      case 'shooting':
        return <WizardStep7_Shooting onNext={handleNext} onBack={handleBack} />;
      case 'capture-after':
        return <WizardStep8_CaptureAfter onNext={handleNext} onBack={handleBack} />;
      case 'processing':
        return <WizardStep9_Processing onNext={handleNext} />;
      case 'validation':
        return <WizardStep10_Validation onNext={handleNext} onBack={handleBack} />;
      case 'review':
        return <WizardStep11_Review onNext={handleNext} onBack={handleBack} />;
      case 'complete':
        return <WizardStep12_Complete />;
      default:
        return null;
    }
  };

  return <>{renderStep()}</>;
}