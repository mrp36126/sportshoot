import { MapPin, Crosshair, Target, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { Session } from '@/types/database';

interface SessionCardProps {
  session: Session;
  onClick?: () => void;
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  const firearmDisplay = [
    session.manufacturer_name,
    session.model_name,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{session.shooting_range_name || 'Unknown Range'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Crosshair className="h-4 w-4 text-gray-400" />
            <span>
              {firearmDisplay || 'Unknown Firearm'}
              {session.calibre_name ? ` · ${session.calibre_name}` : ''}
              {session.distance_label ? ` · ${session.distance_label}` : ''}
            </span>
          </div>
        </div>
        {session.annotated_image_url && (
          <div className="h-16 w-16 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
            <img
              src={session.annotated_image_url}
              alt="Annotated target"
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Target
            className={`h-5 w-5 ${
              session.total_score && session.total_score >= 90
                ? 'text-green-500'
                : session.total_score && session.total_score >= 70
                  ? 'text-blue-500'
                  : 'text-gray-400'
            }`}
          />
          <div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {session.total_score ?? '—'}
            </span>
            <span className="text-sm text-gray-500">
              /100
            </span>
            {session.accuracy && (
              <span className="ml-2 text-sm text-gray-500">
                · {Math.round(session.accuracy)}%
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="h-3 w-3" />
          {session.shot_datetime
            ? format(new Date(session.shot_datetime), 'd MMM yyyy · HH:mm')
            : format(new Date(session.created_at), 'd MMM yyyy')}
        </div>
      </div>
    </div>
  );
}