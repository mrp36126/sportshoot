'use client';

import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WizardLayoutProps {
  title: string;
  step: number;
  totalSteps: number;
  onBack?: () => void;
  canGoBack?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

export function WizardLayout({
  title,
  step,
  totalSteps,
  onBack,
  canGoBack = false,
  children,
  footer,
}: WizardLayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        {canGoBack && onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          <p className="text-xs text-gray-500">
            Step {step} of {totalSteps}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-center gap-1 px-4 py-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i + 1 <= step
                ? 'bg-blue-600'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="border-t border-gray-200 px-4 py-4 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
}