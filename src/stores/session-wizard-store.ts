import { create } from 'zustand';

export type WizardStep =
  | 'select-range'
  | 'select-firearm'
  | 'select-distance'
  | 'select-target'
  | 'expected-shots'
  | 'capture-before'
  | 'shooting' // Waiting for user to complete shooting
  | 'capture-after'
  | 'processing'
  | 'validation'
  | 'review'
  | 'saving'
  | 'complete';

export interface WizardState {
  currentStep: WizardStep;
  shootingRangeId: string | null;
  firearmId: string | null;
  distanceId: string | null;
  targetTypeId: string | null;
  expectedShots: number | null;
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
  annotatedImageUrl: string | null;
  sessionId: string | null;
  detectedShots: number | null;
  totalScore: number | null;
  accuracy: number | null;
  groupSize: number | null;
  shots: Array<{
    shotNumber: number;
    xCoordinate: number;
    yCoordinate: number;
    ringScore: number;
    isXRing: boolean;
  }>;
  isProcessing: boolean;
  mismatchDetected: boolean;
}

export interface WizardActions {
  setStep: (step: WizardStep) => void;
  setShootingRangeId: (id: string) => void;
  setFirearmId: (id: string) => void;
  setDistanceId: (id: string) => void;
  setTargetTypeId: (id: string) => void;
  setExpectedShots: (count: number) => void;
  setBeforeImageUrl: (url: string) => void;
  setAfterImageUrl: (url: string) => void;
  setAnnotatedImageUrl: (url: string) => void;
  setSessionId: (id: string) => void;
  setProcessingResults: (results: {
    detectedShots: number;
    totalScore: number;
    accuracy: number;
    groupSize: number;
    shots: WizardState['shots'];
  }) => void;
  setIsProcessing: (processing: boolean) => void;
  setMismatchDetected: (mismatch: boolean) => void;
  reset: () => void;
  goBack: () => void;
  canGoBack: () => boolean;
}

const initialState: WizardState = {
  currentStep: 'select-range',
  shootingRangeId: null,
  firearmId: null,
  distanceId: null,
  targetTypeId: null,
  expectedShots: null,
  beforeImageUrl: null,
  afterImageUrl: null,
  annotatedImageUrl: null,
  sessionId: null,
  detectedShots: null,
  totalScore: null,
  accuracy: null,
  groupSize: null,
  shots: [],
  isProcessing: false,
  mismatchDetected: false,
};

const stepOrder: WizardStep[] = [
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
  'saving',
  'complete',
];

export const useSessionWizardStore = create<WizardState & WizardActions>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  setShootingRangeId: (id) => set({ shootingRangeId: id }),
  setFirearmId: (id) => set({ firearmId: id }),
  setDistanceId: (id) => set({ distanceId: id }),
  setTargetTypeId: (id) => set({ targetTypeId: id }),
  setExpectedShots: (count) => set({ expectedShots: count }),
  setBeforeImageUrl: (url) => set({ beforeImageUrl: url }),
  setAfterImageUrl: (url) => set({ afterImageUrl: url }),
  setAnnotatedImageUrl: (url) => set({ annotatedImageUrl: url }),
  setSessionId: (id) => set({ sessionId: id }),

  setProcessingResults: (results) =>
    set({
      detectedShots: results.detectedShots,
      totalScore: results.totalScore,
      accuracy: results.accuracy,
      groupSize: results.groupSize,
      shots: results.shots,
    }),

  setIsProcessing: (processing) => set({ isProcessing: processing }),
  setMismatchDetected: (mismatch) => set({ mismatchDetected: mismatch }),

  goBack: () => {
    const { currentStep } = get();
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      set({ currentStep: stepOrder[currentIndex - 1] });
    }
  },

  canGoBack: () => {
    const { currentStep } = get();
    return stepOrder.indexOf(currentStep) > 0;
  },

  reset: () => set(initialState),
}));