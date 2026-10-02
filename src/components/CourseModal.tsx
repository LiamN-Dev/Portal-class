import { useState, useEffect } from 'react';
import { BookOpen, X, Save } from 'lucide-react';
import type { Course } from '../types/index.ts';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit?: Course | null;
  onSave: (course: Course) => Promise<void>;
}

export function CourseModal({
  isOpen,
  onClose,
  courseToEdit,
  onSave,
}: CourseModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [period, setPeriod] = useState('Period 1');
  const [teacher, setTeacher] = useState('');
  const [room, setRoom] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<Course['color']>('emerald');
  const [nextDueDate, setNextDueDate] = useState('');
  const [nextDueTitle, setNextDueTitle] = useState('');
  const [urgencyType, setUrgencyType] = useState<Course['urgencyType']>('exam');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (courseToEdit) {
      setName(courseToEdit.name);
      setCode(courseToEdit.code);
      setPeriod(courseToEdit.period);
      setTeacher(courseToEdit.teacher);
      setRoom(courseToEdit.room);
      setDescription(courseToEdit.description);
      setColor(courseToEdit.color);
      setNextDueDate(courseToEdit.nextDueDate ? courseToEdit.nextDueDate.slice(0, 16) : '');
      setNextDueTitle(courseToEdit.nextDueTitle || '');
      setUrgencyType(courseToEdit.urgencyType || 'exam');
    } else {
      setName('');
      setCode('');
      setPeriod('Period 1');
      setTeacher('');
      setRoom('');
      setDescription('');
      setColor('indigo');
      setNextDueDate('');
      setNextDueTitle('');
      setUrgencyType('exam');
    }
  }, [courseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const accentHexMap = {
      emerald: '#10b981',
      rose: '#f43f5e',
      indigo: '#6366f1',
      amber: '#f59e0b',
      cyan: '#06b6d4',
      purple: '#8b5cf6',
    };

    const coursePayload: Course = {
      id: courseToEdit?.id || `c-${Date.now()}`,
      name: name.trim(),
      code: code.trim(),
      period,
      teacher: teacher.trim(),
      room: room.trim(),
      description: description.trim(),
      color,
      accentHex: accentHexMap[color] || '#6366f1',
      icon: 'BookOpen',
      nextDueDate: nextDueDate ? new Date(nextDueDate).toISOString() : undefined,
      nextDueTitle: nextDueTitle.trim() || undefined,
      urgencyType,
    };

    try {
      await onSave(coursePayload);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {courseToEdit ? 'Edit Course' : 'Create New Course Deck'}
              </h3>
              <p className="text-xs text-slate-500">Configure subject identity and exam dates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AP Chemistry Honors"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CHEM-502"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Period
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="Period 3"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Teacher
              </label>
              <input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="Dr. Henderson"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Room
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Sci-304"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Color Theme Accent
            </label>
            <div className="flex items-center space-x-3">
              {[
                { id: 'emerald', label: 'Emerald (Chem)', bg: 'bg-emerald-500' },
                { id: 'rose', label: 'Rose (Calc)', bg: 'bg-rose-500' },
                { id: 'indigo', label: 'Indigo (Lit)', bg: 'bg-indigo-500' },
                { id: 'amber', label: 'Amber (History)', bg: 'bg-amber-500' },
                { id: 'cyan', label: 'Cyan (CompSci)', bg: 'bg-cyan-500' },
                { id: 'purple', label: 'Purple (General)', bg: 'bg-purple-500' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setColor(c.id as Course['color'])}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-all cursor-pointer ${
                    color === c.id ? 'ring-4 ring-offset-2 ring-slate-400 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief course overview and curriculum topics..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Urgency Scoring Section */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
              ⚡ Dynamic Urgency Scoring (Upcoming Event)
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Next Due / Test Date
                </label>
                <input
                  type="datetime-local"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={nextDueTitle}
                  onChange={(e) => setNextDueTitle(e.target.value)}
                  placeholder="e.g. Unit 2 Exam"
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
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
              <span>{isSaving ? 'Saving...' : 'Save Course'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
