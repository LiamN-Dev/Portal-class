import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Vault,
  Sparkles,
  BookOpen,
  Plus,
  HelpCircle,
  Inbox,
  ShieldCheck,
  Eye,
  Search,
  Filter,
} from 'lucide-react';
import type {
  Course,
  Unit,
  ResourceItem,
  User,
  UnlockRequest,
  StudentSubmission,
  NoteRequest,
} from './types/index.ts';

// Components
import { Navbar } from './components/Navbar.tsx';
import { UrgencyBanner } from './components/UrgencyBanner.tsx';
import { CourseTabs } from './components/CourseTabs.tsx';
import { UnitAccordion } from './components/UnitAccordion.tsx';
import { CommandPalette } from './components/CommandPalette.tsx';
import { UnlockRequestModal } from './components/UnlockRequestModal.tsx';
import { AdminQueueModal } from './components/AdminQueueModal.tsx';
import { StudentSubmitModal } from './components/StudentSubmitModal.tsx';
import { RequestNotesModal } from './components/RequestNotesModal.tsx';
import { AIStudyAssistant } from './components/AIStudyAssistant.tsx';
import { BackupExportModal } from './components/BackupExportModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { CourseModal } from './components/CourseModal.tsx';
import { UnitModal } from './components/UnitModal.tsx';
import { ResourceModal } from './components/ResourceModal.tsx';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('studyvault_theme') === 'dark' ||
      (!('studyvault_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('studyvault_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('studyvault_theme', 'light');
    }
  }, [isDark]);

  // Main Vault State
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [unlockRequests, setUnlockRequests] = useState<UnlockRequest[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [noteRequests, setNoteRequests] = useState<NoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active User / Session (defaults to pre-seeded Admin Liam for seamless experience)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [impersonatingUser, setImpersonatingUser] = useState<User | null>(null);

  // Selected Course
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [filterNewOnly, setFilterNewOnly] = useState<boolean>(false);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminQueueOpen, setIsAdminQueueOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isRequestNotesOpen, setIsRequestNotesOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Course, Unit, Resource editing modals
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [unitToEdit, setUnitToEdit] = useState<Unit | null>(null);

  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<ResourceItem | null>(null);
  const [activeUnitForNewResource, setActiveUnitForNewResource] = useState<string>('');

  // Unlock request modal
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [lockedResourceTarget, setLockedResourceTarget] = useState<ResourceItem | null>(null);

  // Fetch initial state
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
        setUnits(data.units || []);
        setResources(data.resources || []);
        setUsers(data.users || []);
        setUnlockRequests(data.unlockRequests || []);
        setSubmissions(data.submissions || []);
        setNoteRequests(data.noteRequests || []);

        // Set default user to Admin if not set
        if (!currentUser) {
          const savedUserId = localStorage.getItem('studyvault_active_user');
          const found = data.users?.find((u: User) => u.id === savedUserId);
          const defaultAdmin = data.users?.find((u: User) => u.role === 'admin');
          setCurrentUser(found || defaultAdmin || null);
        }

        if (!selectedCourseId && data.courses && data.courses.length > 0) {
          setSelectedCourseId(data.courses[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load vault state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, selectedCourseId]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Save active user in localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('studyvault_active_user', currentUser.id);
    }
  }, [currentUser]);

  // Effective user taking impersonation into account
  const effectiveUser = impersonatingUser || currentUser;
  const isAdmin = currentUser?.role === 'admin' && !impersonatingUser;

  // Filter courses visible to this user
  const visibleCourses = useMemo(() => {
    if (isAdmin) return courses;
    if (!effectiveUser) return [];
    return courses.filter((c) => effectiveUser.enrolledCourseIds.includes(c.id));
  }, [courses, isAdmin, effectiveUser]);

  // Ensure selected course is valid for user
  useEffect(() => {
    if (visibleCourses.length > 0) {
      const exists = visibleCourses.some((c) => c.id === selectedCourseId);
      if (!exists) {
        setSelectedCourseId(visibleCourses[0].id);
      }
    }
  }, [visibleCourses, selectedCourseId]);

  const activeCourse = useMemo(() => {
    return courses.find((c) => c.id === selectedCourseId) || visibleCourses[0] || null;
  }, [courses, visibleCourses, selectedCourseId]);

  const activeCourseUnits = useMemo(() => {
    if (!activeCourse) return [];
    return units
      .filter((u) => u.courseId === activeCourse.id)
      .sort((a, b) => a.order - b.order);
  }, [units, activeCourse]);

  const activeSpotlightUnit = useMemo(() => {
    return activeCourseUnits.find((u) => u.isActiveSpotlight) || null;
  }, [activeCourseUnits]);

  // Dynamic Urgency Scoring: course with nearest upcoming exam/due date
  const urgentCourse = useMemo(() => {
    const coursesWithDueDate = visibleCourses.filter(
      (c) => c.nextDueDate && new Date(c.nextDueDate).getTime() > Date.now()
    );
    if (coursesWithDueDate.length === 0) return null;

    return coursesWithDueDate.sort(
      (a, b) => new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime()
    )[0];
  }, [visibleCourses]);

  // New resources uploaded in the last 7 days
  const newResourcesCount = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return resources.filter((r) => new Date(r.createdAt).getTime() > sevenDaysAgo).length;
  }, [resources]);

  // Pending count for admin queue notification badge
  const pendingQueueCount = useMemo(() => {
    const pendingUsers = users.filter((u) => u.status === 'pending').length;
    const pendingUnlocks = unlockRequests.filter((r) => r.status === 'pending').length;
    const pendingSubs = submissions.filter((s) => s.status === 'pending').length;
    return pendingUsers + pendingUnlocks + pendingSubs;
  }, [users, unlockRequests, submissions]);

  // Handlers for Login & Switch
  const handleLogin = async (username: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    setCurrentUser(data.user);
    setImpersonatingUser(null);
  };

  const handleRegister = async (regData: any) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    await fetchState();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setImpersonatingUser(null);
    localStorage.removeItem('studyvault_active_user');
  };

  // Handlers for admin queue approvals
  const handleApproveUser = async (userId: string, courseIds: string[]) => {
    await fetch(`/api/admin/users/${userId}/approve-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseIds }),
    });
    await fetchState();
  };

  const handleRejectUser = async (userId: string) => {
    await fetch(`/api/admin/users/${userId}/reject-request`, { method: 'POST' });
    await fetchState();
  };

  const handleUpdateUserCourses = async (userId: string, courseIds: string[]) => {
    await fetch(`/api/admin/users/${userId}/update-courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseIds }),
    });
    await fetchState();
  };

  const handleToggleUserStatus = async (userId: string) => {
    await fetch(`/api/admin/users/${userId}/toggle-status`, { method: 'POST' });
    await fetchState();
  };

  const handleResetPassword = async (userId: string, temporaryPassword?: string) => {
    await fetch(`/api/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temporaryPassword }),
    });
    await fetchState();
  };

  // Unlock Request handler
  const handleOpenUnlockModal = (res: ResourceItem) => {
    setLockedResourceTarget(res);
    setIsUnlockModalOpen(true);
  };

  const handleSubmitUnlockRequest = async (payload: any) => {
    const res = await fetch('/api/unlock-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit request');
    await fetchState();
  };

  const handleRespondUnlockRequest = async (
    reqId: string,
    decision: 'approve_permanent' | 'approve_temporary' | 'denied',
    adminNote?: string
  ) => {
    await fetch(`/api/unlock-requests/${reqId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, adminNote }),
    });
    await fetchState();
  };

  // Student submission handler
  const handleSubmitMaterial = async (subData: any) => {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subData),
    });
    if (!res.ok) throw new Error('Failed to submit');
    await fetchState();
  };

  const handleReviewSubmission = async (subId: string, action: 'approve' | 'reject') => {
    await fetch(`/api/submissions/${subId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    await fetchState();
  };

  // Notes request handler
  const handleSubmitNoteRequest = async (noteData: any) => {
    const res = await fetch('/api/notes-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData),
    });
    if (!res.ok) throw new Error('Failed to post request');
    await fetchState();
  };

  const handleFulfillNoteRequest = async (reqId: string, fulfilledBy: string, url: string) => {
    await fetch(`/api/notes-requests/${reqId}/fulfill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fulfilledBy, fulfilledUrl: url }),
    });
    await fetchState();
  };

  // Course, Unit, Resource CRUD
  const handleSaveCourse = async (coursePayload: Course) => {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coursePayload),
    });
    if (res.ok) {
      await fetchState();
      setSelectedCourseId(coursePayload.id);
    }
  };

  const handleSaveUnit = async (unitPayload: Unit) => {
    const res = await fetch('/api/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(unitPayload),
    });
    if (res.ok) await fetchState();
  };

  const handleSaveResource = async (resPayload: ResourceItem) => {
    const res = await fetch('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resPayload),
    });
    if (res.ok) await fetchState();
  };

  const handleDeleteResource = async (resId: string) => {
    if (confirm('Are you sure you want to remove this resource from the vault?')) {
      await fetch(`/api/resources/${resId}`, { method: 'DELETE' });
      await fetchState();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        users={users}
        courses={courses}
        impersonatingUser={impersonatingUser}
        onImpersonate={(u) => setImpersonatingUser(u)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onOpenRequestNotes={() => setIsRequestNotesOpen(true)}
        onOpenAdminQueue={() => setIsAdminQueueOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        pendingCount={pendingQueueCount}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dynamic Urgency / Spotlight Banner */}
        <UrgencyBanner
          urgentCourse={urgentCourse}
          activeSpotlightUnit={activeSpotlightUnit}
          onSelectCourse={(cId) => setSelectedCourseId(cId)}
          newResourcesCount={newResourcesCount}
          onFilterNewOnly={() => setFilterNewOnly(!filterNewOnly)}
          isShowingNewOnly={filterNewOnly}
        />

        {/* Course Tabs (with subject accents & urgency scoring tags) */}
        <div className="mb-6">
          <CourseTabs
            courses={visibleCourses}
            selectedCourseId={selectedCourseId}
            onSelectCourse={(id) => setSelectedCourseId(id)}
            isAdmin={isAdmin}
            onAddCourse={() => {
              setCourseToEdit(null);
              setIsCourseModalOpen(true);
            }}
          />
        </div>

        {/* Deep Unit Hierarchy & Resources Accordion */}
        {activeCourse ? (
          <UnitAccordion
            course={activeCourse}
            units={activeCourseUnits}
            resources={resources}
            currentUser={effectiveUser}
            isAdmin={isAdmin}
            onOpenUnlockModal={handleOpenUnlockModal}
            onAddResource={(unitId) => {
              setActiveUnitForNewResource(unitId);
              setResourceToEdit(null);
              setIsResourceModalOpen(true);
            }}
            onAddUnit={() => {
              setUnitToEdit(null);
              setIsUnitModalOpen(true);
            }}
            onEditUnit={(unit) => {
              setUnitToEdit(unit);
              setIsUnitModalOpen(true);
            }}
            onDeleteResource={handleDeleteResource}
            filterNewOnly={filterNewOnly}
          />
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 p-8">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No classes currently visible.
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              If you just registered, your administrator will approve your course permissions shortly. If you are an admin, create your first course!
            </p>
            {isAdmin && (
              <button
                onClick={() => {
                  setCourseToEdit(null);
                  setIsCourseModalOpen(true);
                }}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
              >
                + Create First Course Deck
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 bg-white dark:bg-slate-900 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center">
              <Vault className="w-3 h-3" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              StudyVault
            </span>
            <span>&bull; Academic Resource Hub & Completed HW Keys</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsExportOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Export Full Backup (.md / .json)
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Switch Account
            </button>
          </div>
        </div>
      </footer>

      {/* Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        resources={resources}
        courses={courses}
        units={units}
        onSelectCourse={(cId) => setSelectedCourseId(cId)}
      />

      {/* Unlock Request Modal */}
      <UnlockRequestModal
        isOpen={isUnlockModalOpen}
        onClose={() => {
          setIsUnlockModalOpen(false);
          setLockedResourceTarget(null);
        }}
        resource={lockedResourceTarget}
        course={courses.find((c) => c.id === lockedResourceTarget?.courseId) || null}
        currentUser={effectiveUser}
        onSubmitRequest={handleSubmitUnlockRequest}
      />

      {/* Admin Queue & Approval Center */}
      <AdminQueueModal
        isOpen={isAdminQueueOpen}
        onClose={() => setIsAdminQueueOpen(false)}
        users={users}
        courses={courses}
        units={units}
        unlockRequests={unlockRequests}
        submissions={submissions}
        onApproveUserRequest={handleApproveUser}
        onRejectUserRequest={handleRejectUser}
        onRespondUnlockRequest={handleRespondUnlockRequest}
        onReviewSubmission={handleReviewSubmission}
        onUpdateUserCourses={handleUpdateUserCourses}
        onToggleUserStatus={handleToggleUserStatus}
        onResetPassword={handleResetPassword}
      />

      {/* Student Submit Study Guide Modal */}
      <StudentSubmitModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        courses={courses}
        units={units}
        currentUser={effectiveUser}
        onSubmit={handleSubmitMaterial}
      />

      {/* Request Notes Modal */}
      <RequestNotesModal
        isOpen={isRequestNotesOpen}
        onClose={() => setIsRequestNotesOpen(false)}
        courses={courses}
        currentUser={effectiveUser}
        noteRequests={noteRequests}
        onSubmitRequest={handleSubmitNoteRequest}
        onFulfillRequest={handleFulfillNoteRequest}
      />

      {/* AI Study Assistant Drawer */}
      <AIStudyAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        activeCourse={activeCourse}
      />

      {/* Backup Export Modal */}
      <BackupExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        courses={courses}
        units={units}
        resources={resources}
      />

      {/* Auth / Switch Account Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        courses={courses}
        users={users}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Course Modal */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setCourseToEdit(null);
        }}
        courseToEdit={courseToEdit}
        onSave={handleSaveCourse}
      />

      {/* Unit Modal */}
      <UnitModal
        isOpen={isUnitModalOpen}
        onClose={() => {
          setIsUnitModalOpen(false);
          setUnitToEdit(null);
        }}
        courseId={selectedCourseId}
        unitToEdit={unitToEdit}
        onSave={handleSaveUnit}
      />

      {/* Resource Modal */}
      <ResourceModal
        isOpen={isResourceModalOpen}
        onClose={() => {
          setIsResourceModalOpen(false);
          setResourceToEdit(null);
        }}
        courseId={selectedCourseId}
        unitId={activeUnitForNewResource || activeCourseUnits[0]?.id || ''}
        users={users}
        resourceToEdit={resourceToEdit}
        onSave={handleSaveResource}
      />
    </div>
  );
}
