import { Clock, AlertTriangle, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import type { Course, Unit } from '../types/index.ts';
import { getCourseColorClasses, formatTimeLeft } from '../utils/helpers.ts';

interface UrgencyBannerProps {
  urgentCourse: Course | null;
  activeSpotlightUnit: Unit | null;
  onSelectCourse: (courseId: string) => void;
  newResourcesCount: number;
  onFilterNewOnly: () => void;
  isShowingNewOnly: boolean;
}

export function UrgencyBanner({
  urgentCourse,
  activeSpotlightUnit,
  onSelectCourse,
  newResourcesCount,
  onFilterNewOnly,
  isShowingNewOnly,
}: UrgencyBannerProps) {
  if (!urgentCourse) return null;

  const colorStyle = getCourseColorClasses(urgentCourse.color);
  const timeLeft = urgentCourse.nextDueDate ? formatTimeLeft(urgentCourse.nextDueDate) : '';

  return (
    <div className="mb-6 space-y-3">
      {/* Dynamic Urgency / Spotlight Card */}
      <div className="relative overflow-hidden rounded-2xl border border-rose-300 dark:border-rose-900/60 bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="mt-0.5 flex-shrink-0 w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-500 text-white shadow-xs">
                  🔥 High Priority &bull; Upcoming {urgentCourse.urgencyType === 'exam' ? 'Exam' : 'Due Date'}
                </span>
                <span className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded-md">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  <span>{timeLeft}</span>
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                {urgentCourse.name} ({urgentCourse.period}) — {urgentCourse.nextDueTitle}
              </h2>

              {activeSpotlightUnit && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Spotlight Active: <strong>{activeSpotlightUnit.title}</strong></span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => onSelectCourse(urgentCourse.id)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <span>Open Study Deck</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* "What's New Since Last Visit" notification bar */}
      {newResourcesCount > 0 && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="font-medium">
              <strong>{newResourcesCount} new resources</strong> uploaded this week!
            </span>
          </div>

          <button
            onClick={onFilterNewOnly}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              isShowingNewOnly
                ? 'bg-indigo-600 text-white'
                : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
            }`}
          >
            {isShowingNewOnly ? 'Show All Items' : 'Filter New Items'}
          </button>
        </div>
      )}
    </div>
  );
}
