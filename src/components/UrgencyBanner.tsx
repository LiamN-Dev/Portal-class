import { useState } from 'react';
import { Clock, AlertTriangle, ArrowRight, BookOpen, X, Sparkles } from 'lucide-react';
import type { Course, Unit } from '../types/index.ts';
import { formatTimeLeft } from '../utils/helpers.ts';

interface UrgencyBannerProps {
  urgentCourse: Course | null;
  activeSpotlightUnit: Unit | null;
  onSelectCourse: (courseId: string) => void;
  newResourcesCount: number;
  userName?: string;
  enrolledCoursesCount: number;
}

export function UrgencyBanner({
  urgentCourse,
  activeSpotlightUnit,
  onSelectCourse,
  newResourcesCount,
  userName,
  enrolledCoursesCount,
}: UrgencyBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  return (
    <div className="mb-6 space-y-3">
      {/* Personalized Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {userName || 'Student'} 👋
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            You have access to <strong className="text-slate-700 dark:text-slate-300">{enrolledCoursesCount} course deck{enrolledCoursesCount !== 1 ? 's' : ''}</strong>
            {newResourcesCount > 0 && (
              <span> &bull; <strong className="text-indigo-600 dark:text-indigo-400">{newResourcesCount} new upload{newResourcesCount !== 1 ? 's' : ''}</strong> this week</span>
            )}
          </p>
        </div>
      </div>

      {/* Dynamic Urgent Event Alert - Sleek & Dismissible */}
      {urgentCourse && !isDismissed && (
        <div className="relative overflow-hidden rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent p-3.5 sm:p-4 shadow-2xs">
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Next Due: {urgentCourse.nextDueDate ? formatTimeLeft(urgentCourse.nextDueDate) : 'Upcoming'}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {urgentCourse.name} — {urgentCourse.nextDueTitle}
                  </span>
                </div>

                {activeSpotlightUnit && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Spotlight: {activeSpotlightUnit.title}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => onSelectCourse(urgentCourse.id)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl transition-all cursor-pointer self-start sm:self-center flex-shrink-0"
            >
              <span>View Deck</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
