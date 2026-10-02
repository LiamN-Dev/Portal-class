import { useState, useEffect, useMemo } from 'react';
import { Search, X, Copy, ExternalLink, Check, Layers, Filter } from 'lucide-react';
import type { ResourceItem, Course, Unit } from '../types/index.ts';
import { getResourceTypeConfig, getCategoryBadge, copyToClipboard } from '../utils/helpers.ts';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  resources: ResourceItem[];
  courses: Course[];
  units: Unit[];
  onSelectCourse: (courseId: string) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  resources,
  courses,
  units,
  onSelectCourse,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Close on Escape, Open on Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
          // Parent triggers open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const courseMap = useMemo(() => {
    const map = new Map<string, Course>();
    courses.forEach((c) => map.set(c.id, c));
    return map;
  }, [courses]);

  const unitMap = useMemo(() => {
    const map = new Map<string, Unit>();
    units.forEach((u) => map.set(u.id, u));
    return map;
  }, [units]);

  const filteredResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    return resources.filter((item) => {
      const course = courseMap.get(item.courseId);
      const unit = unitMap.get(item.unitId);

      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'completed_hw' && !item.isCompletedHw) return false;
        if (selectedCategory !== 'completed_hw' && item.category !== selectedCategory) return false;
      }

      if (!q) return true;

      const titleMatch = item.title.toLowerCase().includes(q);
      const descMatch = item.description.toLowerCase().includes(q);
      const tagMatch = item.tags.some((t) => t.toLowerCase().includes(q));
      const courseMatch = course ? course.name.toLowerCase().includes(q) || course.code.toLowerCase().includes(q) : false;
      const unitMatch = unit ? unit.title.toLowerCase().includes(q) : false;

      return titleMatch || descMatch || tagMatch || courseMatch || unitMatch;
    });
  }, [resources, query, selectedCategory, courseMap, unitMap]);

  if (!isOpen) return null;

  const handleCopy = async (e: React.MouseEvent, res: ResourceItem) => {
    e.stopPropagation();
    const ok = await copyToClipboard(res.url);
    if (ok) {
      setCopiedId(res.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all units, problem sets, formulas, or lecture slides..."
            className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </span>
          {[
            { id: 'all', label: 'All Items' },
            { id: 'completed_hw', label: '✓ Completed HW' },
            { id: 'study_guide', label: 'Study Guides' },
            { id: 'lab_report', label: 'Lab Reports' },
            { id: 'practice_exam', label: 'Practice Exams' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-2 flex-1">
          {filteredResults.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold">No materials match your search.</p>
              <p className="text-xs text-slate-400 mt-1">Try another keyword or filter tag.</p>
            </div>
          ) : (
            filteredResults.map((item) => {
              const course = courseMap.get(item.courseId);
              const unit = unitMap.get(item.unitId);
              const typeConfig = getResourceTypeConfig(item.type);
              const categoryBadge = getCategoryBadge(item.category);
              const TypeIcon = typeConfig.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (course) onSelectCourse(course.id);
                    onClose();
                  }}
                  className="group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    <div
                      className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${typeConfig.color}`}
                    >
                      <TypeIcon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 text-[11px] mb-0.5">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {course?.code || 'Course'}
                        </span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                          {unit?.title}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] ${categoryBadge.className}`}
                        >
                          {categoryBadge.label}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <button
                      onClick={(e) => handleCopy(e, item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                      title="Copy Link"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                      title="Open Resource"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer tip */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Click any resource to jump to its unit and course</span>
          <span>{filteredResults.length} items found</span>
        </div>
      </div>
    </div>
  );
}
