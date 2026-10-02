import { useState } from 'react';
import { Lock, X, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ResourceItem, Course, User } from '../types/index.ts';

interface UnlockRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ResourceItem | null;
  course: Course | null;
  currentUser: User | null;
  onSubmitRequest: (payload: {
    resourceId: string;
    resourceTitle: string;
    courseId: string;
    courseName: string;
    userId: string;
    userName: string;
    username: string;
    reason: string;
  }) => Promise<void>;
}

export function UnlockRequestModal({
  isOpen,
  onClose,
  resource,
  course,
  currentUser,
  onSubmitRequest,
}: UnlockRequestModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !resource || !course) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a brief reason for your unlock request.');
      return;
    }

    if (!currentUser) {
      setError('You must be signed in to submit an unlock request.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmitRequest({
        resourceId: resource.id,
        resourceTitle: resource.title,
        courseId: course.id,
        courseName: course.name,
        userId: currentUser.id,
        userName: currentUser.name,
        username: currentUser.username,
        reason: reason.trim(),
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setReason('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Request Vault Item Unlock
              </h3>
              <p className="text-xs text-slate-500">{course.name} ({course.period})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Unlock Request Sent!
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your administrator has received your request. You will be notified once approved (permanent or 24-hour pass).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Target Item summary */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Requested Item
              </span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {resource.title}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                {resource.description}
              </p>
            </div>

            {/* Student Info */}
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>
                Requesting as: <strong className="text-slate-700 dark:text-slate-300">{currentUser?.name}</strong> (@{currentUser?.username})
              </span>
            </div>

            {/* Reason Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Reason for Access <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="e.g. I was absent on Tuesday due to morning practice/sickness and need the review sheet to catch up for Friday's test..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Admins can approve permanent access or issue a 24-Hour Study Pass.
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
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
                disabled={isSubmitting}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending Request...' : 'Submit Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
