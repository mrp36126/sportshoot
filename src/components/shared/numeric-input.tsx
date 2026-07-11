'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumericInputProps {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  error?: string;
  helperText?: string;
}

export function NumericInput({
  label,
  value,
  onChange,
  min = 1,
  max = 999,
  step = 1,
  required = false,
  error,
  helperText,
}: NumericInputProps) {
  const currentValue = value ?? 0;

  const decrement = () => {
    const newValue = Math.max(min, currentValue - step);
    onChange(newValue);
  };

  const increment = () => {
    const newValue = Math.min(max, currentValue + step);
    onChange(newValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed);
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={decrement}
          disabled={currentValue <= min}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 transition-colors',
            'hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <Minus className="h-4 w-4" />
        </button>

        <input
          type="number"
          value={currentValue || ''}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className={cn(
            'h-10 w-20 rounded-md border text-center text-lg font-semibold',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            error
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100'
          )}
        />

        <button
          type="button"
          onClick={increment}
          disabled={currentValue >= max}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 transition-colors',
            'hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}