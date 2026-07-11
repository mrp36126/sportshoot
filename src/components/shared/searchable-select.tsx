'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  id: string;
  label: string;
  subtitle?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onRequestNew?: () => void;
  requestNewLabel?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found',
  onRequestNew,
  requestNewLabel = 'Request new',
  disabled = false,
  error,
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.id === value);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          disabled && 'cursor-not-allowed opacity-50',
          error
            ? 'border-red-500'
            : 'border-gray-300 dark:border-gray-600',
          !selectedOption && 'text-gray-400'
        )}
      >
        <span className={cn(selectedOption && 'text-gray-900 dark:text-gray-100')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center border-b border-gray-200 px-3 dark:border-gray-700">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full border-none bg-transparent px-2 py-2.5 text-sm outline-none"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    value === option.id && 'bg-blue-50 dark:bg-blue-900/20'
                  )}
                >
                  <div>
                    <span className="text-gray-900 dark:text-gray-100">
                      {option.label}
                    </span>
                    {option.subtitle && (
                      <p className="text-xs text-gray-500">{option.subtitle}</p>
                    )}
                  </div>
                  {value === option.id && (
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))
            )}
          </div>

          {onRequestNew && (
            <button
              type="button"
              onClick={() => {
                onRequestNew();
                setIsOpen(false);
                setSearch('');
              }}
              className="flex w-full items-center gap-2 border-t border-gray-200 px-3 py-2.5 text-sm text-blue-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-blue-400 dark:hover:bg-gray-700"
            >
              <Plus className="h-4 w-4" />
              {requestNewLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}