import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, X, Save, Clock, Users, EyeOff, FileText, Globe } from 'lucide-react';
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
      setVisibilityScope(resourceToEdit.visibilityScope || 'all_enrolled');
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
      scheduledUnlockAt: (visibilityScope === 'time_locked' && scheduledUnlockAt) ? new Date(scheduledUnlockAt).toISOString() : undefined,
      autoLockAt: (visibilityScope === 'time_locked' && autoLockAt) ? new Date(autoLockAt).toISOString() : undefined,
      isCompletedHw: category === 'completed_hw',
      createdAt: resourceToEdit?.createdAt || new Date().toISOString(),
      submittedBy: resourceToEdit?.submittedBy || 'Vault Admin',
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {resourceToEdit ? 'Edit Material' : 'Post Completed HW / Study Link'}
                </h3>
                <p className="text-xs text-slate-500">5 granular visibility modes & custom scheduling</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unit 2 Problem Set 4 Solutions & Answer Key"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
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
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500"
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
                Description / Homework Notes
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Explain what is included, common mistakes, or derivations..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Peek Solution Preview Snippet */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Key Answer Snippet (Optional peek for classmates)
              </label>
              <input
                type="text"
                value={previewSnippet}
                onChange={(e) => setPreviewSnippet(e.target.value)}
                placeholder="e.g. Q4 answer: Rate = k[A]^2. Final activation energy Ea = 54.2 kJ/mol."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            {/* Granular Visibility Mode Selection */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Item Visibility Control
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setVisibilityScope('all_enrolled')}
                    className={`p-2.5 rounded-xl border text-left flex items-start space-x-2 transition-all cursor-pointer ${
                      visibilityScope === 'all_enrolled'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="leading-tight">Showing Everyone</p>
                      <p className="text-[10px] font-normal text-slate-500 mt-0.5">All enrolled classmates</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibilityScope('hidden')}
                    className={`p-2.5 rounded-xl border text-left flex items-start space-x-2 transition-all cursor-pointer ${
                      visibilityScope === 'hidden'
                        ? 'border-slate-500 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <EyeOff className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="leading-tight">Showing No One</p>
                      <p className="text-[10px] font-normal text-slate-500 mt-0.5">Completely hidden</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibilityScope('time_locked')}
                    className={`p-2.5 rounded-xl border text-left flex items-start space-x-2 transition-all cursor-pointer ${
                      visibilityScope === 'time_locked'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="leading-tight">Time Lock</p>
                      <p className="text-[10px] font-normal text-slate-500 mt-0.5">Scheduled reveal date</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibilityScope('restricted_students')}
                    className={`p-2.5 rounded-xl border text-left flex items-start space-x-2 transition-all cursor-pointer ${
                      visibilityScope === 'restricted_students'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="leading-tight">Restricted</p>
                      <p className="text-[10px] font-normal text-slate-500 mt-0.5">Specific study partners</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibilityScope('draft')}
                    className={`p-2.5 rounded-xl border text-left flex items-start space-x-2 transition-all cursor-pointer sm:col-span-2 ${
                      visibilityScope === 'draft'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="leading-tight">Draft Mode</p>
                      <p className="text-[10px] font-normal text-slate-500 mt-0.5">Admin-only prep (students cannot see)</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Time Lock Settings */}
              {visibilityScope === 'time_locked' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Scheduled Unlock Date/Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledUnlockAt}
                      onChange={(e) => setScheduledUnlockAt(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">Reveals to class at this exact time</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Post-Deadline Auto-Lock (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={autoLockAt}
                      onChange={(e) => setAutoLockAt(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">Locks after assignment cutoff</p>
                  </div>
                </div>
              )}

              {/* Restricted Students Selector */}
              {visibilityScope === 'restricted_students' && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select permitted classmates:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    {users
                      .filter((u) => u.role !== 'admin' && u.status === 'approved')
                      .map((user) => {
                        const checked = allowedStudentIds.includes(user.id);
                        return (
                          <label
                            key={user.id}
                            className="flex items-center space-x-2 text-xs p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer select-none"
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
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="truncate">{user.name}</span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Filter Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Chapter 4, Test Review, Answer Key"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : resourceToEdit ? 'Save Changes' : 'Publish Resource'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
