import { useState } from 'react';
import { HelpCircle, X, Send, CheckCircle2, AlertCircle, ExternalLink, Check } from 'lucide-react';
import type { Course, NoteRequest, User } from '../types/index.ts';

interface RequestNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  currentUser: User | null;
  noteRequests: NoteRequest[];
  onSubmitRequest: (req: {
    courseId: string;
    userId: string;
    userName: string;
    topic: string;
    dateNeeded: string;
    details: string;
  }) => Promise<void>;
  onFulfillRequest: (reqId: string, fulfilledBy: string, url: string) => Promise<void>;
}

export function RequestNotesModal({
  isOpen,
  onClose,
  courses,
  currentUser,
  noteRequests,
  onSubmitRequest,
  onFulfillRequest,
}: RequestNotesModalProps) {
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [dateNeeded, setDateNeeded] = useState(new Date().toISOString().split('T')[0]);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fulfill state
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);
  const [fulfillUrl, setFulfillUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please specify the topic or lecture date missed.');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to post a request.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmitRequest({
        courseId,
        userId: currentUser.id,
        userName: currentUser.name,
        topic: topic.trim(),
        dateNeeded,
        details: details.trim(),
      });
      setTopic('');
      setDetails('');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit note request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFulfill = async (reqId: string) => {
    if (!fulfillUrl.trim() || !currentUser) return;
    await onFulfillRequest(reqId, currentUser.name, fulfillUrl.trim());
    setFulfillingId(null);
    setFulfillUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Classmate Notes Request Box
              </h3>
              <p className="text-xs text-slate-500">
                Missed a lecture, sick day, or lab? Ask classmates to upload photos or notes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-6 flex-1">
          {/* Post New Request */}
          <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
            <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
              Ask Classmates for Missed Notes:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.period})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date Missed
                </label>
                <input
                  type="date"
                  value={dateNeeded}
                  onChange={(e) => setDateNeeded(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Topic / Chapter / Lab Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Acid-Base Titration curve sketch from Tuesday whiteboard"
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Details / What you need
              </label>
              <input
                type="text"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g. My phone died right before he wrote the half-life derivation formulas..."
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-500">{error}</p>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Posting...' : 'Post Request'}</span>
              </button>
            </div>
          </form>

          {/* Active Note Requests Feed */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Active Community Requests ({noteRequests.length}):
            </h4>

            {noteRequests.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">
                No active note requests right now.
              </p>
            ) : (
              noteRequests.map((req) => {
                const c = courses.find((x) => x.id === req.courseId);
                const isFulfilled = req.status === 'fulfilled';

                return (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-xs flex flex-col space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {c?.name} &bull; Missed: {req.dateNeeded}
                      </span>
                      <span
                        className={`px-2 py-0.2 rounded-full font-bold text-[10px] ${
                          isFulfilled
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {isFulfilled ? 'Fulfilled ✓' : 'Seeking Notes'}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {req.topic}
                    </h5>

                    {req.details && (
                      <p className="text-xs text-slate-500 italic">
                        &ldquo;{req.details}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400">
                      <span>Posted by {req.userName}</span>

                      {isFulfilled ? (
                        <a
                          href={req.fulfilledUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-emerald-600 font-bold hover:underline"
                        >
                          <span>Shared by {req.fulfilledBy}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <div>
                          {fulfillingId === req.id ? (
                            <div className="flex items-center space-x-1">
                              <input
                                type="url"
                                placeholder="Paste link (Google Doc / photo)..."
                                value={fulfillUrl}
                                onChange={(e) => setFulfillUrl(e.target.value)}
                                className="text-xs px-2 py-1 border rounded bg-white dark:bg-slate-900"
                              />
                              <button
                                onClick={() => handleFulfill(req.id)}
                                className="px-2 py-1 bg-emerald-600 text-white rounded font-bold text-xs"
                              >
                                Send
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setFulfillingId(req.id)}
                              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                            >
                              + Share Notes Link
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
