import { useState, useEffect } from 'react';
import { PlusCircle, X, Save, Clock, Users, ShieldAlert } from 'lucide-react';
import type { ResourceItem, User, ResourceType, ResourceCategory, VisibilityScope } from '../types/index.ts';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  unitId: string;
  users: User[];
  resourceToEdit?: ResourceItem | null;
  onSave: (resource: ResourceItem) => Promise<void>;
}

export function ResourceModal({
  isOpen,
  onClose,
  courseId,
  unitId,
  users,
  resourceToEdit,
  onSave,
}: ResourceModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<ResourceType>('doc');
  const [category, setCategory] = useState<ResourceCategory>('completed_hw');
  const [visibilityScope, setVisibilityScope] = useState<VisibilityScope>('all_enrolled');
  const [allowedStudentIds, setAllowedStudentIds] = useState<string[]>([]);
  const [scheduledUnlockAt, setScheduledUnlockAt] = useState('');
  const [autoLockAt, setAutoLockAt] = useState('');
  const [previewSnippet, setPreviewSnippet] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (resourceToEdit) {
      setTitle(resourceToEdit.title);
      setDescription(resourceToEdit.description);
      setUrl(resourceToEdit.url);
      setType(resourceToEdit.type);
      setCategory(resourceToEdit.category);
      setVisibilityScope(resourceToEdit.visibilityScope);
      setAllowedStudentIds(resourceToEdit.allowedStudentIds || []);
      setScheduledUnlockAt(resourceToEdit.scheduledUnlockAt ? resourceToEdit.scheduledUnlockAt.slice(0, 16) : '');
      setAutoLockAt(resourceToEdit.autoLockAt ? resourceToEdit.autoLockAt.slice(0, 16) : '');
      setPreviewSnippet(resourceToEdit.previewSnippet || '');
      setTagsInput(resourceToEdit.tags ? resourceToEdit.tags.join(', ') : '');
    } else {
      setTitle('');
      setDescription('');
      setUrl('');
      setType('doc');
      setCategory('completed_hw');
      setVisibilityScope('all_enrolled');
      setAllowedStudentIds([]);
      setScheduledUnlockAt('');
      setAutoLockAt('');
      setPreviewSnippet('');
      setTagsInput('');
    }
  }, [resourceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload: ResourceItem = {
      id: resourceToEdit?.id || `r-${Date.now()}`,
      courseId,
      unitId,
      title: title.trim(),
      description: description.trim(),
      url: url.trim(),
      type,
      category,
      visibilityScope,
      allowedStudentIds: visibilityScope === 'restricted_students' ? allowedStudentIds : undefined,
      scheduledUnlockAt: scheduledUnlockAt ? new Date(scheduledUnlockAt).toISOString() : undefined,
      autoLockAt: autoLockAt ? new Date(autoLockAt).toISOString() : undefined,
      isCompletedHw: category === 'completed_hw',
      createdAt: resourceToEdit?.createdAt || new Date().toISOString(),
      submittedBy: resourceToEdit?.submittedBy || 'Liam Nystrom',
      viewCount: resourceToEdit?.viewCount || 0,
      tags: tags.length > 0 ? tags : ['Study Material'],
      previewSnippet: previewSnippet.trim() || undefined,
    };

    try {
      await onSave(payload);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {resourceToEdit ? 'Edit Material' : 'Post Completed HW / Study Link'}
              </h3>
              <p className="text-xs text-slate-500">Double-layered visibility & scheduled auto-locking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 2 Problem Set 4 Solutions & Answer Key"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Link URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://docs.google.com/... or https://quizlet.com/..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Material Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ResourceType)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="doc">Google Doc</option>
                <option value="pdf">PDF Document</option>
                <option value="quizlet">Quizlet Deck</option>
                <option value="slides">Google Slides</option>
                <option value="video">Video Walkthrough</option>
                <option value="sheets">Google Sheet</option>
                <option value="notion">Notion Page</option>
                <option value="code">Code / GitHub</option>
                <option value="link">Web Link</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="completed_hw">Completed HW Key</option>
                <option value="study_guide">Study Guide</option>
                <option value="lecture_notes">Lecture Notes</option>
                <option value="lab_report">Lab Report</option>
                <option value="practice_exam">Practice Exam</option>
                <option value="formula_sheet">Formula Sheet</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Explain what is included, common mistakes, or derivations..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Solution Snippet Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Key Solution / Formula Snippet (Optional peek for classmates)
            </label>
            <input
              type="text"
              value={previewSnippet}
              onChange={(e) => setPreviewSnippet(e.target.value)}
              placeholder="e.g. Q4 answer: Rate = k[A]^2. Final activation energy Ea = 54.2 kJ/mol."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>

          {/* Granular Visibility Scope */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Double-Layered Access Control
            </span>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Who can view this item?
              </label>
              <select
                value={visibilityScope}
                onChange={(e) => setVisibilityScope(e.target.value as VisibilityScope)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="all_enrolled">All Enrolled Classmates (Public to Class)</option>
                <option value="restricted_students">Specific Selected Students (Lab Group / Peer Tutoring)</option>
                <option value="admin_only">Admin Only (Draft Mode)</option>
              </select>
            </div>

            {visibilityScope === 'restricted_students' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Select Permitted Students:
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  {users
                    .filter((u) => u.role !== 'admin' && u.status === 'approved')
                    .map((user) => {
                      const checked = allowedStudentIds.includes(user.id);
                      return (
                        <label
                          key={user.id}
                          className="flex items-center space-x-1.5 text-xs cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              if (checked) {
                                setAllowedStudentIds(allowedStudentIds.filter((id) => id !== user.id));
                              } else {
                                setAllowedStudentIds([...allowedStudentIds, user.id]);
                              }
                            }}
                            className="rounded text-indigo-600"
                          />
                          <span className="truncate">{user.name}</span>
                        </label>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Time Locks & Auto Archiving */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Smart Time-Locking & Auto-Archiving
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Scheduled Unlock (Reveal at time)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledUnlockAt}
                  onChange={(e) => setScheduledUnlockAt(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Post-Deadline Auto-Lock (Padlock after time)
                </label>
                <input
                  type="datetime-local"
                  value={autoLockAt}
                  onChange={(e) => setAutoLockAt(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Rate Laws, Initial Rates, Problem Set"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Material'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
