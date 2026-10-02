import { useState } from 'react';
import {
  Folder,
  FolderOpen,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Eye,
  Clock,
  Sparkles,
  Users,
  Trash2,
  Edit2,
  Info,
  ArrowUpDown,
  MoveRight,
} from 'lucide-react';
import type { Course, Unit, ResourceItem, User } from '../types/index.ts';
import {
  getCourseColorClasses,
  getResourceTypeConfig,
  getCategoryBadge,
  copyToClipboard,
} from '../utils/helpers.ts';

interface UnitAccordionProps {
  course: Course;
  units: Unit[];
  resources: ResourceItem[];
  currentUser: User | null;
  isAdmin: boolean;
  onOpenUnlockModal: (resource: ResourceItem) => void;
  onAddResource: (unitId: string) => void;
  onAddUnit: () => void;
  onEditUnit: (unit: Unit) => void;
  onDeleteUnit?: (unitId: string) => void;
  onReorderUnit?: (unitId: string, direction: 'up' | 'down') => void;
  onEditResource?: (resource: ResourceItem) => void;
  onDeleteResource: (resourceId: string) => void;
  onMoveResource?: (resourceId: string, newUnitId: string) => void;
  filterNewOnly?: boolean;
}

export function UnitAccordion({
  course,
  units,
  resources,
  currentUser,
  isAdmin,
  onOpenUnlockModal,
  onAddResource,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
  onReorderUnit,
  onEditResource,
  onDeleteResource,
  onMoveResource,
  filterNewOnly,
}: UnitAccordionProps) {
  // Category filter inside active course
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // By default expand units that are spotlighted or active
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    units.forEach((u) => {
      init[u.id] = u.isActiveSpotlight || u.order === 1;
    });
    return init;
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSnippets, setExpandedSnippets] = useState<Record<string, boolean>>({});
  const [movingResourceId, setMovingResourceId] = useState<string | null>(null);

  const colorStyle = getCourseColorClasses(course.color);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const handleCopyLink = async (resource: ResourceItem) => {
    const success = await copyToClipboard(resource.url);
    if (success) {
      setCopiedId(resource.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const toggleSnippet = (resId: string) => {
    setExpandedSnippets((prev) => ({ ...prev, [resId]: !prev[resId] }));
  };

  // Determine if a resource is locked for the current student
  const isResourceLocked = (res: ResourceItem): { locked: boolean; reason?: string } => {
    if (isAdmin) return { locked: false };

    // 1. Admin only draft
    if (res.visibilityScope === 'admin_only') {
      return { locked: true, reason: 'Admin Draft Only (Hidden from Class)' };
    }

    // 2. Restricted to specific students (e.g. lab group or peer tutoring)
    if (res.visibilityScope === 'restricted_students') {
      const allowed = res.allowedStudentIds || [];
      if (!currentUser || !allowed.includes(currentUser.id)) {
        return {
          locked: true,
          reason: 'Restricted Working Group (Lab Group or Peer Tutoring)',
        };
      }
    }

    // 3. Time-locked scheduled unlock
    if (res.scheduledUnlockAt) {
      const unlockTime = new Date(res.scheduledUnlockAt).getTime();
      if (Date.now() < unlockTime) {
        return {
          locked: true,
          reason: `Scheduled Lock (Reveals ${new Date(res.scheduledUnlockAt).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })})`,
        };
      }
    }

    // 4. Auto-lock after deadline
    if (res.autoLockAt) {
      const lockTime = new Date(res.autoLockAt).getTime();
      if (Date.now() > lockTime) {
        return {
          locked: true,
          reason: 'Post-Deadline Auto-Locked (Request unlock to review)',
        };
      }
    }

    return { locked: false };
  };

  return (
    <div className="space-y-4">
      {/* Course Banner - Clean & Focused */}
      <div
        className={`rounded-3xl p-5 sm:p-6 border ${colorStyle.border}/30 bg-gradient-to-br ${colorStyle.headerGradient} dark:bg-slate-900 shadow-xs relative overflow-hidden`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colorStyle.badge}`}>
                {course.code} &bull; {course.period}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Room {course.room} &bull; {course.teacher}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
              {course.name}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {isAdmin && (
              <button
                onClick={onAddUnit}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Unit</span>
              </button>
            )}
          </div>
        </div>

        {/* In-Course Category Filters */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center space-x-2 text-xs overflow-x-auto">
          <span className="text-slate-400 font-semibold text-[11px]">View:</span>
          {[
            { id: 'all', label: 'All Units & Items' },
            { id: 'completed_hw', label: '✓ Completed HW Keys' },
            { id: 'study_guide', label: 'Study Guides' },
            { id: 'practice_exam', label: 'Practice Exams' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                activeCategoryFilter === cat.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Units List */}
      <div className="space-y-3">
        {units.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
            <Folder className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No units defined for this course yet.
            </p>
            {isAdmin && (
              <button
                onClick={onAddUnit}
                className="mt-3 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl"
              >
                + Create Unit 1
              </button>
            )}
          </div>
        ) : (
          units.map((unit, unitIdx) => {
            const isExpanded = !!expandedUnits[unit.id];
            const isUnitLocked = unit.status === 'locked' && !isAdmin;

            let unitResources = resources.filter((r) => r.unitId === unit.id);

            // Filter by activeCategoryFilter
            if (activeCategoryFilter === 'completed_hw') {
              unitResources = unitResources.filter((r) => r.isCompletedHw);
            } else if (activeCategoryFilter !== 'all') {
              unitResources = unitResources.filter((r) => r.category === activeCategoryFilter);
            }

            if (filterNewOnly) {
              const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
              unitResources = unitResources.filter(
                (r) => new Date(r.createdAt).getTime() > sevenDaysAgo
              );
            }

            return (
              <div
                key={unit.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  unit.isActiveSpotlight
                    ? `border-indigo-400 dark:border-indigo-600 shadow-sm ring-1 ring-indigo-400/20 bg-white dark:bg-slate-900`
                    : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90'
                }`}
              >
                {/* Unit Header */}
                <div
                  onClick={() => !isUnitLocked && toggleUnit(unit.id)}
                  className={`p-4 flex items-center justify-between cursor-pointer select-none transition-colors ${
                    isUnitLocked
                      ? 'bg-slate-100/60 dark:bg-slate-800/40 cursor-not-allowed opacity-80'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <button
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      disabled={isUnitLocked}
                    >
                      {isUnitLocked ? (
                        <Lock className="w-5 h-5 text-amber-500" />
                      ) : isExpanded ? (
                        <FolderOpen className="w-5 h-5 text-indigo-500" />
                      ) : (
                        <Folder className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {unit.title}
                        </h3>

                        {unit.isActiveSpotlight && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500 text-white shadow-2xs">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>Active Spotlight</span>
                          </span>
                        )}

                        {unit.status === 'locked' && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Lock className="w-3 h-3" />
                            <span>
                              Locked{' '}
                              {unit.unlockAt
                                ? `until ${new Date(unit.unlockAt).toLocaleDateString([], {
                                    month: 'short',
                                    day: 'numeric',
                                  })}`
                                : ''}
                            </span>
                          </span>
                        )}

                        <span className="text-[11px] font-medium text-slate-400">
                          {unitResources.length} items
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {unit.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* Admin Unit Reorder / Edit / Delete */}
                    {isAdmin && (
                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                        {unitIdx > 0 && onReorderUnit && (
                          <button
                            onClick={() => onReorderUnit(unit.id, 'up')}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                            title="Move Unit Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                        )}
                        {unitIdx < units.length - 1 && onReorderUnit && (
                          <button
                            onClick={() => onReorderUnit(unit.id, 'down')}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                            title="Move Unit Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onEditUnit(unit)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          title="Edit Unit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteUnit && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${unit.title} and its resources?`)) {
                                onDeleteUnit(unit.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded"
                            title="Delete Unit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {!isUnitLocked && (
                      <div className="p-1 text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Unit Content Items */}
                {isExpanded && !isUnitLocked && (
                  <div className="border-t border-slate-100 dark:border-slate-800 p-3 sm:p-4 space-y-2.5 bg-slate-50/50 dark:bg-slate-950/40">
                    {unitResources.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500">
                        No materials posted under this filter yet.
                      </div>
                    ) : (
                      unitResources.map((item) => {
                        const typeConfig = getResourceTypeConfig(item.type);
                        const categoryBadge = getCategoryBadge(item.category);
                        const TypeIcon = typeConfig.icon;
                        const lockState = isResourceLocked(item);

                        // Padlock Card if locked
                        if (lockState.locked) {
                          return (
                            <div
                              key={item.id}
                              className="rounded-2xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/30 p-3.5 transition-all"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-start space-x-3">
                                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                                    <Lock className="w-4 h-4" />
                                  </div>

                                  <div>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                                        🔒 Locked Resource
                                      </span>
                                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                        {lockState.reason}
                                      </span>
                                    </div>

                                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 line-through opacity-75">
                                      {item.title}
                                    </h4>
                                  </div>
                                </div>

                                <button
                                  onClick={() => onOpenUnlockModal(item)}
                                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-200/80 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 rounded-lg shadow-2xs transition-all cursor-pointer self-start sm:self-center"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>Request Unlock</span>
                                </button>
                              </div>
                            </div>
                          );
                        }

                        // Normal Unlocked Item Card
                        return (
                          <div
                            key={item.id}
                            className={`rounded-2xl border bg-white dark:bg-slate-800/90 p-3.5 transition-all shadow-2xs hover:shadow-sm ${
                              item.isCompletedHw
                                ? 'border-emerald-300 dark:border-emerald-900/60 ring-1 ring-emerald-500/15'
                                : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex items-start space-x-3 min-w-0">
                                <div
                                  className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${typeConfig.color}`}
                                >
                                  <TypeIcon className="w-4 h-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  {/* Badges row */}
                                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${categoryBadge.className}`}
                                    >
                                      {item.isCompletedHw && '✓ '}
                                      {categoryBadge.label}
                                    </span>

                                    <span
                                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${typeConfig.color}`}
                                    >
                                      {typeConfig.label}
                                    </span>

                                    {item.visibilityScope === 'restricted_students' && (
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 flex items-center space-x-1">
                                        <Users className="w-2.5 h-2.5 mr-1" />
                                        <span>Working Group</span>
                                      </span>
                                    )}

                                    {item.visibilityScope === 'admin_only' && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                                        Draft
                                      </span>
                                    )}

                                    <span className="text-[11px] text-slate-400 ml-auto sm:ml-0 flex items-center gap-1">
                                      <Eye className="w-3 h-3" />
                                      <span>{item.viewCount}</span>
                                    </span>
                                  </div>

                                  {/* Title & Description */}
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                                    {item.title}
                                  </h4>

                                  {item.description && (
                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                                      {item.description}
                                    </p>
                                  )}

                                  {/* Quick Preview Snippet toggle */}
                                  {item.previewSnippet && (
                                    <div className="mt-1.5">
                                      <button
                                        onClick={() => toggleSnippet(item.id)}
                                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer"
                                      >
                                        <Info className="w-3 h-3" />
                                        <span>
                                          {expandedSnippets[item.id] ? 'Hide Key Snippet' : 'Peek Solution Snippet'}
                                        </span>
                                      </button>

                                      {expandedSnippets[item.id] && (
                                        <div className="mt-1 p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-mono text-slate-800 dark:text-slate-200">
                                          {item.previewSnippet}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right Action Buttons */}
                              <div className="flex items-center space-x-1.5 self-end sm:self-start pt-1">
                                {/* One-Click Clipboard Copy */}
                                <button
                                  onClick={() => handleCopyLink(item)}
                                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                    copiedId === item.id
                                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                                      : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'
                                  }`}
                                  title="Copy link to clipboard"
                                >
                                  {copiedId === item.id ? (
                                    <Check className="w-3.5 h-3.5 animate-scale" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                {/* Direct Open Link */}
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl shadow-xs transition-all"
                                >
                                  <span>Open</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>

                                {/* Admin Reorganize / Edit / Delete */}
                                {isAdmin && (
                                  <div className="flex items-center space-x-1 pl-1 border-l border-slate-200 dark:border-slate-700">
                                    {onEditResource && (
                                      <button
                                        onClick={() => onEditResource(item)}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg cursor-pointer"
                                        title="Edit Resource"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    {/* Move to another unit */}
                                    {onMoveResource && (
                                      <div className="relative">
                                        <button
                                          onClick={() =>
                                            setMovingResourceId(
                                              movingResourceId === item.id ? null : item.id
                                            )
                                          }
                                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg cursor-pointer"
                                          title="Move to another Unit"
                                        >
                                          <ArrowUpDown className="w-3.5 h-3.5" />
                                        </button>

                                        {movingResourceId === item.id && (
                                          <div
                                            className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 z-20"
                                            onMouseLeave={() => setMovingResourceId(null)}
                                          >
                                            <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">
                                              Move to Unit:
                                            </p>
                                            {units.map((u) => (
                                              <button
                                                key={u.id}
                                                disabled={u.id === item.unitId}
                                                onClick={() => {
                                                  onMoveResource(item.id, u.id);
                                                  setMovingResourceId(null);
                                                }}
                                                className="w-full text-left px-2 py-1 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-40"
                                              >
                                                {u.title}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    <button
                                      onClick={() => onDeleteResource(item.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
                                      title="Delete Resource"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Admin Add Resource to this Unit */}
                    {isAdmin && (
                      <button
                        onClick={() => onAddResource(unit.id)}
                        className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-xl text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer bg-white/40 dark:bg-slate-900/40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Post Material or Key to {unit.title}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
