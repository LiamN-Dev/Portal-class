import { useState } from 'react';
import {
  Inbox,
  X,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Clock,
  Check,
  Ban,
  KeyRound,
  FileCheck2,
  Trash2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Grid,
} from 'lucide-react';
import type {
  User,
  Course,
  UnlockRequest,
  StudentSubmission,
  Unit,
} from '../types/index.ts';

interface AdminQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  courses: Course[];
  units: Unit[];
  unlockRequests: UnlockRequest[];
  submissions: StudentSubmission[];
  onApproveUserRequest: (userId: string, courseIds: string[]) => Promise<void>;
  onRejectUserRequest: (userId: string) => Promise<void>;
  onRespondUnlockRequest: (
    requestId: string,
    decision: 'approve_permanent' | 'approve_temporary' | 'denied',
    adminNote?: string
  ) => Promise<void>;
  onReviewSubmission: (
    submissionId: string,
    action: 'approve' | 'reject',
    courseId?: string,
    unitId?: string
  ) => Promise<void>;
  onUpdateUserCourses: (userId: string, courseIds: string[]) => Promise<void>;
  onToggleUserStatus: (userId: string) => Promise<void>;
  onResetPassword: (userId: string, temporaryPassword?: string) => Promise<void>;
}

export function AdminQueueModal({
  isOpen,
  onClose,
  users,
  courses,
  units,
  unlockRequests,
  submissions,
  onApproveUserRequest,
  onRejectUserRequest,
  onRespondUnlockRequest,
  onReviewSubmission,
  onUpdateUserCourses,
  onToggleUserStatus,
  onResetPassword,
}: AdminQueueModalProps) {
  const [activeTab, setActiveTab] = useState<
    'accounts' | 'unlocks' | 'submissions' | 'user_matrix'
  >('accounts');

  const [customCourseModalUser, setCustomCourseModalUser] = useState<User | null>(null);
  const [customSelectedCourses, setCustomSelectedCourses] = useState<string[]>([]);
  const [adminNotePromptId, setAdminNotePromptId] = useState<string | null>(null);
  const [adminNoteText, setAdminNoteText] = useState('');
  const [resetPwUserId, setResetPwUserId] = useState<string | null>(null);
  const [newTempPw, setNewTempPw] = useState('study123');

  if (!isOpen) return null;

  const pendingAccounts = users.filter((u) => u.status === 'pending');
  const pendingUnlocks = unlockRequests.filter((r) => r.status === 'pending');
  const pendingSubs = submissions.filter((s) => s.status === 'pending');

  const handleOpenCustomCourseAssign = (user: User) => {
    setCustomCourseModalUser(user);
    setCustomSelectedCourses(user.requestedCourses || []);
  };

  const handleSaveCustomCourses = async () => {
    if (!customCourseModalUser) return;
    await onApproveUserRequest(customCourseModalUser.id, customSelectedCourses);
    setCustomCourseModalUser(null);
  };

  const handleToggleMatrixCheckbox = async (userId: string, courseId: string, currentEnrolled: string[]) => {
    const next = currentEnrolled.includes(courseId)
      ? currentEnrolled.filter((id) => id !== courseId)
      : [...currentEnrolled, courseId];
    await onUpdateUserCourses(userId, next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Admin Control & Approval Center
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Private Admin View
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Manage incoming classmate requests, locked vault permits, submissions, and course access.
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2 bg-slate-50/50 dark:bg-slate-950/50 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'accounts'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Account Requests</span>
            {pendingAccounts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                {pendingAccounts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('unlocks')}
            className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'unlocks'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Vault Unlock Requests</span>
            {pendingUnlocks.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                {pendingUnlocks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'submissions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Student Submissions</span>
            {pendingSubs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-bold">
                {pendingSubs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('user_matrix')}
            className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'user_matrix'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Course Access Matrix</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: Pending Accounts */}
          {activeTab === 'accounts' && (
            <div className="space-y-3">
              {pendingAccounts.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <UserCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <p className="text-sm font-semibold">Account queue is clear!</p>
                  <p className="text-xs text-slate-400 mt-1">
                    All classmate registration requests have been processed.
                  </p>
                </div>
              ) : (
                pendingAccounts.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {user.name}
                        </h4>
                        <span className="text-xs text-slate-500">@{user.username}</span>
                        {user.email && (
                          <span className="text-xs text-slate-400">&bull; {user.email}</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[11px] font-semibold text-slate-500">
                          Requested Classes:
                        </span>
                        {user.requestedCourses && user.requestedCourses.length > 0 ? (
                          user.requestedCourses.map((cId) => {
                            const c = courses.find((x) => x.id === cId);
                            return (
                              <span
                                key={cId}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                              >
                                {c?.name || cId} ({c?.period})
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">None selected</span>
                        )}
                      </div>

                      {user.notes && (
                        <p className="text-xs text-slate-500 italic mt-1.5 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg">
                          &ldquo;{user.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() =>
                          onApproveUserRequest(user.id, user.requestedCourses || [])
                        }
                        className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                        title="Approve exactly with requested courses"
                      >
                        Approve & Assign Requested
                      </button>

                      <button
                        onClick={() => handleOpenCustomCourseAssign(user)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Pick custom courses for this user"
                      >
                        Custom Courses...
                      </button>

                      <button
                        onClick={() => onRejectUserRequest(user.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        title="Deny request"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Vault Unlock Requests */}
          {activeTab === 'unlocks' && (
            <div className="space-y-3">
              {pendingUnlocks.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Lock className="w-8 h-8 mx-auto mb-2 text-amber-500 opacity-60" />
                  <p className="text-sm font-semibold">No pending unlock requests.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    When classmates request access to padlocked homework keys or study guides, they will show here.
                  </p>
                </div>
              ) : (
                pendingUnlocks.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs flex flex-col space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          {req.courseName}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {req.resourceTitle}
                        </h4>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        Requested: {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-amber-800/80 text-xs">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {req.userName} (@{req.username}) says:
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5 italic">
                        &ldquo;{req.reason}&rdquo;
                      </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => onRespondUnlockRequest(req.id, 'approve_permanent')}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Approve Permanently</span>
                      </button>

                      <button
                        onClick={() => onRespondUnlockRequest(req.id, 'approve_temporary')}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-200 hover:bg-amber-300 dark:bg-amber-800 dark:hover:bg-amber-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                        title="Permit 24-hour study pass before auto-relocking"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Approve 24-Hour Pass</span>
                      </button>

                      <button
                        onClick={() => {
                          setAdminNotePromptId(req.id);
                          setAdminNoteText('This key will unlock for everyone after Friday class.');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Deny with Note...
                      </button>
                    </div>

                    {/* Deny Prompt if active */}
                    {adminNotePromptId === req.id && (
                      <div className="mt-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 space-y-2">
                        <label className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                          Denial Note to Classmate:
                        </label>
                        <input
                          type="text"
                          value={adminNoteText}
                          onChange={(e) => setAdminNoteText(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setAdminNotePromptId(null)}
                            className="text-xs px-2.5 py-1 text-slate-500"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              await onRespondUnlockRequest(req.id, 'denied', adminNoteText);
                              setAdminNotePromptId(null);
                            }}
                            className="text-xs px-3 py-1 bg-rose-600 text-white font-bold rounded-md"
                          >
                            Confirm Deny
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Student Submissions */}
          {activeTab === 'submissions' && (
            <div className="space-y-3">
              {pendingSubs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileCheck2 className="w-8 h-8 mx-auto mb-2 text-indigo-500 opacity-60" />
                  <p className="text-sm font-semibold">No pending student submissions.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    When classmates submit study notes or completed worksheets, they will appear here for your review and one-click publishing.
                  </p>
                </div>
              ) : (
                pendingSubs.map((sub) => {
                  const course = courses.find((c) => c.id === sub.courseId);
                  const unit = units.find((u) => u.id === sub.unitId);

                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-xs flex flex-col space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              {course?.name} &bull; {unit?.title || 'General'}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                              {sub.category}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                            {sub.title}
                          </h4>

                          <p className="text-xs text-slate-500 mt-0.5">
                            Submitted by: <strong>{sub.studentName}</strong>
                          </p>

                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">
                            &ldquo;{sub.notes}&rdquo;
                          </p>
                        </div>

                        <a
                          href={sub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg self-start"
                        >
                          <span>Review Link</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                        <button
                          onClick={() => onReviewSubmission(sub.id, 'reject')}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => onReviewSubmission(sub.id, 'approve')}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          Approve & Publish to Vault
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: User Matrix & Permission Center */}
          {activeTab === 'user_matrix' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200">
                <span className="font-bold">Course Checkbox Matrix:</span> Check or uncheck
                boxes to instantly grant or revoke access to entire classes for any classmate. Toggle the
                lock switch to suspend an account if needed.
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Classmate</th>
                      <th className="p-3">Status</th>
                      {courses.map((c) => (
                        <th key={c.id} className="p-3 text-center">
                          <div>{c.code}</div>
                          <div className="text-[10px] font-normal text-slate-400">
                            {c.period}
                          </div>
                        </th>
                      ))}
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                    {users.map((u) => {
                      const isSuspended = u.status === 'suspended';
                      return (
                        <tr
                          key={u.id}
                          className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${
                            isSuspended ? 'opacity-60 bg-slate-50 dark:bg-slate-950' : ''
                          }`}
                        >
                          <td className="p-3">
                            <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                            <p className="text-[11px] text-slate-400">
                              @{u.username} {u.role === 'admin' ? '(Admin)' : ''}
                            </p>
                            {u.temporaryPassword && (
                              <p className="text-[10px] text-amber-600 font-mono mt-0.5">
                                Temp Pw: {u.temporaryPassword}
                              </p>
                            )}
                          </td>

                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : u.status === 'suspended'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>

                          {/* Checkboxes for courses */}
                          {courses.map((course) => {
                            const isEnrolled = u.enrolledCourseIds.includes(course.id);
                            return (
                              <td key={course.id} className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isEnrolled}
                                  disabled={u.role === 'admin'}
                                  onChange={() =>
                                    handleToggleMatrixCheckbox(
                                      u.id,
                                      course.id,
                                      u.enrolledCourseIds
                                    )
                                  }
                                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                                />
                              </td>
                            );
                          })}

                          {/* Quick Admin Actions */}
                          <td className="p-3 text-right">
                            {u.role !== 'admin' && (
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => onToggleUserStatus(u.id)}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    isSuspended
                                      ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                                      : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60'
                                  }`}
                                  title={isSuspended ? 'Activate Account' : 'Suspend Account'}
                                >
                                  {isSuspended ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <Ban className="w-4 h-4" />
                                  )}
                                </button>

                                <button
                                  onClick={() => {
                                    setResetPwUserId(u.id);
                                    setNewTempPw('vault' + Math.floor(100 + Math.random() * 900));
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="Reset Password"
                                >
                                  <KeyRound className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Password Reset Prompt if active */}
              {resetPwUserId && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Set Temporary Password:
                    </span>
                    <input
                      type="text"
                      value={newTempPw}
                      onChange={(e) => setNewTempPw(e.target.value)}
                      className="px-2 py-1 text-xs rounded border border-amber-300 dark:border-amber-700 font-mono bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setResetPwUserId(null)}
                      className="text-xs px-2.5 py-1 text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        await onResetPassword(resetPwUserId, newTempPw);
                        setResetPwUserId(null);
                      }}
                      className="text-xs px-3 py-1 bg-amber-600 text-white font-bold rounded-md"
                    >
                      Save & Issue
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom Course Selection Modal */}
        {customCourseModalUser && (
          <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
              Select Courses for {customCourseModalUser.name}:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {courses.map((course) => {
                const checked = customSelectedCourses.includes(course.id);
                return (
                  <label
                    key={course.id}
                    className="flex items-center space-x-2 text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          setCustomSelectedCourses(customSelectedCourses.filter((id) => id !== course.id));
                        } else {
                          setCustomSelectedCourses([...customSelectedCourses, course.id]);
                        }
                      }}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {course.name} ({course.period})
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={() => setCustomCourseModalUser(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomCourses}
                className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Confirm & Approve Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
