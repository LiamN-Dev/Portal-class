import { Plus, BookOpen, Clock } from 'lucide-react';
import type { Course } from '../types/index.ts';
import { getCourseColorClasses, formatTimeLeft } from '../utils/helpers.ts';

interface CourseTabsProps {
  courses: Course[];
  selectedCourseId: string;
  onSelectCourse: (id: string) => void;
  isAdmin: boolean;
  onAddCourse: () => void;
}

export function CourseTabs({
  courses,
  selectedCourseId,
  onSelectCourse,
  isAdmin,
  onAddCourse,
}: CourseTabsProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900">
        <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          No courses currently assigned to your account.
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Ask your vault administrator to enable courses in the User Matrix.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
      {courses.map((course) => {
        const isSelected = course.id === selectedCourseId;
        const colorStyle = getCourseColorClasses(course.color);
        const timeLeft = course.nextDueDate ? formatTimeLeft(course.nextDueDate) : null;

        return (
          <button
            key={course.id}
            onClick={() => onSelectCourse(course.id)}
            className={`flex-shrink-0 group relative px-4 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              isSelected
                ? `bg-white dark:bg-slate-800 shadow-md ${colorStyle.border} border-2 ring-2 ${colorStyle.ring}/20`
                : 'bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${colorStyle.accentBg} ${
                  isSelected ? 'animate-pulse' : ''
                }`}
              />
              <span
                className={`text-xs font-bold tracking-tight ${
                  isSelected ? 'text-slate-900 dark:text-white' : 'group-hover:text-slate-900 dark:group-hover:text-white'
                }`}
              >
                {course.name}
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                {course.period}
              </span>
            </div>

            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 space-x-3">
              <span>{course.teacher}</span>
              {timeLeft && (
                <span className="flex items-center space-x-1 font-semibold text-rose-500 text-[10px]">
                  <Clock className="w-3 h-3" />
                  <span>{timeLeft}</span>
                </span>
              )}
            </div>
          </button>
        );
      })}

      {isAdmin && (
        <button
          onClick={onAddCourse}
          className="flex-shrink-0 flex items-center space-x-1.5 px-3 py-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 border border-dashed border-indigo-300 dark:border-indigo-800 rounded-xl transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Course</span>
        </button>
      )}
    </div>
  );
}
