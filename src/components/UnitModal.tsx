import { useState, useEffect } from 'react';
import { Folder, X, Save } from 'lucide-react';
import type { Unit } from '../types/index.ts';

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  unitToEdit?: Unit | null;
  onSave: (unit: Unit) => Promise<void>;
}

export function UnitModal({
  isOpen,
  onClose,
  courseId,
  unitToEdit,
  onSave,
}: UnitModalProps) {
  const [unitNumber, setUnitNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Unit['status']>('unlocked');
  const [unlockAt, setUnlockAt] = useState('');
  const [isActiveSpotlight, setIsActiveSpotlight] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (unitToEdit) {
      setUnitNumber(unitToEdit.unitNumber);
      setTitle(unitToEdit.title);
      setDescription(unitToEdit.description);
      setStatus(unitToEdit.status);
      setUnlockAt(unitToEdit.unlockAt ? unitToEdit.unlockAt.slice(0, 16) : '');
      setIsActiveSpotlight(!!unitToEdit.isActiveSpotlight);
    } else {
      setUnitNumber(1);
      setTitle('');
      setDescription('');
      setStatus('unlocked');
      setUnlockAt('');
      setIsActiveSpotlight(false);
    }
  }, [unitToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload: Unit = {
      id: unitToEdit?.id || `u-${Date.now()}`,
      courseId,
      unitNumber,
      title: title.trim(),
      description: description.trim(),
      status,
      unlockAt: unlockAt ? new Date(unlockAt).toISOString() : undefined,
      isActiveSpotlight,
      order: unitNumber,
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
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {unitToEdit ? 'Edit Unit' : 'Create Unit'}
              </h3>
              <p className="text-xs text-slate-500">Unit hierarchy and locked vault permissions</p>
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit #
              </label>
              <input
                type="number"
                value={unitNumber}
                onChange={(e) => setUnitNumber(Number(e.target.value))}
                min={1}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Unit 1: Atomic Structure"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Key Topics
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Covering electron configurations, Coulombic forces, periodic trends..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Unit['status'])}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="unlocked">Unlocked (Open to Class)</option>
                <option value="locked">Locked (Time-Locked)</option>
                <option value="restricted">Restricted Access</option>
              </select>
            </div>

            {status === 'locked' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Scheduled Unlock Date
                </label>
                <input
                  type="datetime-local"
                  value={unlockAt}
                  onChange={(e) => setUnlockAt(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>

          <label className="flex items-center space-x-2 text-xs cursor-pointer p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              checked={isActiveSpotlight}
              onChange={(e) => setIsActiveSpotlight(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Active Unit Spotlight</span>
              <p className="text-[10px] text-slate-400">
                Immediately auto-expands this unit when classmates open the course.
              </p>
            </div>
          </label>

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
              <span>{isSaving ? 'Saving...' : 'Save Unit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
