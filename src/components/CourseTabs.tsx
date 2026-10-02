import { Plus, BookOpen, Clock, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import type { Course } from '../types/index.ts';
import { getCourseColorClasses, formatTimeLeft } from '../utils/helpers.ts';

interface CourseTabsProps {
  courses: Course[];
  selectedCourseId: string;
  onSelectCourse: (id: string) => void;
  isAdmin: boolean;
  onAddCourse: () => void;
  onEditCourse?: (course: Course) => void;
  onDeleteCourse?: (courseId: string) => void;
  onReorderCourses?: (courseIds: string[]) => void;
}

export function CourseTabs({
  courses,
  selectedCourseId,
  onSelectCourse,
  isAdmin,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onReorderCourses,
}: CourseTabsProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
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

  const handleMove = (index: number, direction: 'left' | 'right') => {
    if (!onReorderCourses) return;
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= courses.length) return;

    const list = [...courses];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;
    onReorderCourses(list.map((c) => c.id));
  };

  return (
    <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
      {courses.map((course, idx) => {
        const isSelected = course.id === selectedCourseId;
        const colorStyle = getCourseColorClasses(course.color);
        const timeLeft = course.nextDueDate ? formatTimeLeft(course.nextDueDate) : null;

        return (
          <div key={course.id} className="relative group flex-shrink-0">
            <button
              onClick={() => onSelectCourse(course.id)}
              className={`w-full flex-shrink-0 group relative px-4 py-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? `bg-white dark:bg-slate-900 shadow-sm ${colorStyle.border} border-2 ring-2 ${colorStyle.ring}/15`
                  : 'bg-white/80 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${colorStyle.accentBg} ${
                    isSelected ? 'animate-pulse' : ''
                  }`}
                />
                <span
                  className={`text-xs font-bold tracking-tight truncate max-w-[150px] ${
                    isSelected ? 'text-slate-900 dark:text-white' : 'group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}
                >
                  {course.name}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {course.period}
                </span>
              </div>

              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 space-x-3">
                <span className="truncate max-w-[120px]">{course.teacher}</span>
                {timeLeft && (
                  <span className="flex items-center space-x-1 font-semibold text-rose-500 text-[10px] flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{timeLeft}</span>
                  </span>
                )}
              </div>
            </button>

            {/* Admin Course Rearrange / Quick Edit Actions on Hover/Select */}
            {isAdmin && isSelected && (
              <div className="absolute -top-3 right-1 flex items-center space-x-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-1.5 py-0.5 shadow-md z-10 animate-in fade-in">
                {idx > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(idx, 'left');
                    }}
                    className="p-1 hover:text-indigo-600 rounded"
                    title="Move Course Left"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                )}
                {idx < courses.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(idx, 'right');
                    }}
                    className="p-1 hover:text-indigo-600 rounded"
                    title="Move Course Right"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
                {onEditCourse && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCourse(course);
                    }}
                    className="p-1 hover:text-indigo-600 rounded"
                    title="Edit Course Details"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
                {onDeleteCourse && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCourse(course.id);
                    }}
                    className="p-1 hover:text-rose-500 rounded"
                    title="Delete Course Deck"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {isAdmin && (
        <button
          onClick={onAddCourse}
          className="flex-shrink-0 flex items-center space-x-1.5 px-3.5 py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 border border-dashed border-indigo-300 dark:border-indigo-800 rounded-2xl transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Course</span>
        </button>
      )}
    </div>
  );
}
