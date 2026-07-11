import { MapPin, Crosshair, Target, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface SessionCardData {
  id: string;
  shooting_range_name?: string | null;
  shooting_distance?: number;
  number_of_shots?: number;
  total_score?: number | null;
  final_score?: number | null;
  group_size_mm?: number | null;
  accuracy?: number | null;
  created_at: string;
  shot_datetime?: string | null;
  status: string;
  annotated_image_url?: string | null;
  manufacturer_name?: string;
  model_name?: string;
  calibre_name?: string;
  distance_label?: string;
}

interface SessionCardProps {
  session: SessionCardData;
  onClick?: () => void;
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  const score = session.final_score ?? session.total_score;

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
              {[session.manufacturer_name, session.model_name].filter(Boolean).join(' ') || 'Unknown Firearm'}
              {session.calibre_name ? ` · ${session.calibre_name}` : ''}
              {session.shooting_distance ? ` · ${session.shooting_distance}m` : ''}
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
              score && score >= 90
                ? 'text-green-500'
                : score && score >= 70
                  ? 'text-blue-500'
                  : 'text-gray-400'
            }`}
          />
          <div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {score ?? '—'}
            </span>
            {session.accuracy && (
              <span className="ml-2 text-sm text-gray-500">
                · {Math.round(session.accuracy)}%
              </span>
            )}
            {session.group_size_mm && (
              <span className="ml-2 text-sm text-gray-500">
                · {Math.round(session.group_size_mm)}mm
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