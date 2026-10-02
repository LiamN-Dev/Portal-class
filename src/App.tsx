import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Vault,
  BookOpen,
  Plus,
  ShieldAlert,
  LogOut,
  Sliders,
} from 'lucide-react';
import type {
  Course,
  Unit,
  ResourceItem,
  User,
  UnlockRequest,
  StudentSubmission,
  NoteRequest,
  AdminPopup,
  SiteSettings,
  VisibilityScope,
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
import { CourseModal } from './components/CourseModal.tsx';
import { UnitModal } from './components/UnitModal.tsx';
import { ResourceModal } from './components/ResourceModal.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { MaintenanceScreen } from './components/MaintenanceScreen.tsx';
import { PopupAnnouncementModal } from './components/PopupAnnouncementModal.tsx';

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
  const [popups, setPopups] = useState<AdminPopup[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    maintenanceMode: {
      enabled: false,
      countdownTarget: new Date(Date.now() + 3600 * 1000 * 2).toISOString(),
      message: 'StudyVault is undergoing scheduled unit restructuring and updates. Back soon!',
    },
    aiTutorEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Authentication State: On site open, users must sign in!
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('studyvault_logged_in_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [impersonatingUser, setImpersonatingUser] = useState<User | null>(null);

  // Selected Course
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [filterNewOnly, setFilterNewOnly] = useState<boolean>(false);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

  // Fetch initial state from server
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
        if (data.siteSettings) setSiteSettings(data.siteSettings);
        if (data.popups) setPopups(data.popups);

        // Verify current user is still valid
        if (currentUser) {
          const fresh = data.users?.find((u: User) => u.id === currentUser.id);
          if (fresh) {
            setCurrentUser(fresh);
            localStorage.setItem('studyvault_logged_in_user', JSON.stringify(fresh));
          }
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

  // Effective user taking impersonation into account
  const effectiveUser = impersonatingUser || currentUser;
  const isAdmin = currentUser?.role === 'admin' && !impersonatingUser;

  // Filter courses visible to this user
  const visibleCourses = useMemo(() => {
    if (isAdmin) return courses;
    if (!effectiveUser) return [];
    return courses.filter((c) => effectiveUser.enrolledCourseIds.includes(c.id));
  }, [courses, isAdmin, effectiveUser]);

  // Ensure selected course is valid
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

  // Dynamic Urgency Scoring
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

  // Authentication Handlers
  const handleLogin = async (username: string, password?: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    setCurrentUser(data.user);
    setImpersonatingUser(null);
    localStorage.setItem('studyvault_logged_in_user', JSON.stringify(data.user));
    await fetchState();
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    localStorage.removeItem('studyvault_logged_in_user');
    sessionStorage.clear();
    setCurrentUser(null);
    setImpersonatingUser(null);
  };

  const handleToggleUserAI = async (userId: string) => {
    await fetch(`/api/admin/users/${userId}/toggle-ai`, { method: 'POST' });
    await fetchState();
  };

  const handleToggleAllAI = async (enabled: boolean) => {
    await fetch('/api/admin/users/toggle-ai-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    await fetchState();
  };

  const handleCleanSlate = async () => {
    const res = await fetch('/api/admin/clean-slate', { method: 'POST' });
    if (res.ok) {
      await fetchState();
      setSelectedCourseId('');
    }
  };

  const handleResetDemo = async () => {
    const res = await fetch('/api/admin/reset-demo', { method: 'POST' });
    if (res.ok) {
      await fetchState();
    }
  };

  const handleUpdateResourceVisibility = async (resourceId: string, scope: VisibilityScope) => {
    await fetch(`/api/resources/${resourceId}/visibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibilityScope: scope }),
    });
    await fetchState();
  };

  // Admin Queue Approvals
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

  // Unlock Request Handlers
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

  // Student Submissions Handlers
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

  // Notes Request Handlers
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

  // Popups Handlers
  const handleCreatePopup = async (popupData: any) => {
    await fetch('/api/admin/popups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(popupData),
    });
    await fetchState();
  };

  const handleTogglePopup = async (id: string) => {
    await fetch(`/api/admin/popups/${id}/toggle`, { method: 'POST' });
    await fetchState();
  };

  const handleDeletePopup = async (id: string) => {
    await fetch(`/api/admin/popups/${id}`, { method: 'DELETE' });
    await fetchState();
  };

  // Site Settings Handler
  const handleUpdateSiteSettings = async (settingsData: Partial<SiteSettings>) => {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData),
    });
    if (res.ok) {
      const data = await res.json();
      setSiteSettings(data.siteSettings);
    }
  };

  // Course CRUD & Organization
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

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Are you sure you want to permanently delete this course and all its units?')) {
      await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
      await fetchState();
    }
  };

  const handleReorderCourses = async (courseIds: string[]) => {
    const res = await fetch('/api/courses/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseIds }),
    });
    if (res.ok) {
      const data = await res.json();
      setCourses(data.courses);
    }
  };

  // Unit CRUD & Organization
  const handleSaveUnit = async (unitPayload: Unit) => {
    const res = await fetch('/api/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(unitPayload),
    });
    if (res.ok) await fetchState();
  };

  const handleDeleteUnit = async (unitId: string) => {
    await fetch(`/api/units/${unitId}`, { method: 'DELETE' });
    await fetchState();
  };

  const handleReorderUnit = async (unitId: string, direction: 'up' | 'down') => {
    const res = await fetch('/api/units/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitId, direction }),
    });
    if (res.ok) {
      const data = await res.json();
      setUnits(data.units);
    }
  };

  // Resource CRUD & Move
  const handleSaveResource = async (resPayload: ResourceItem) => {
    const res = await fetch('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resPayload),
    });
    if (res.ok) await fetchState();
  };

  const handleDeleteResource = async (resId: string) => {
    if (confirm('Remove this resource from the vault?')) {
      await fetch(`/api/resources/${resId}`, { method: 'DELETE' });
      await fetchState();
    }
  };

  const handleMoveResource = async (resourceId: string, newUnitId: string) => {
    const res = await fetch(`/api/resources/${resourceId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newUnitId }),
    });
    if (res.ok) await fetchState();
  };

  // --- RENDERING CONDITIONAL GATES ---

  // GATE 1: Maintenance Mode for non-admin users
  const isMaintenanceActive = siteSettings.maintenanceMode.enabled;
  if (isMaintenanceActive && (!currentUser || currentUser.role !== 'admin')) {
    return (
      <MaintenanceScreen
        settings={siteSettings.maintenanceMode}
        onAdminLogin={handleLogin}
      />
    );
  }

  // GATE 2: On site open, show Login screen if not authenticated
  if (!currentUser) {
    return (
      <LoginScreen
        courses={courses}
        isMaintenanceMode={isMaintenanceActive}
        maintenanceMessage={siteSettings.maintenanceMode.message}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  // GATE 3: Authenticated Vault View
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Admin Maintenance Mode Top Warning Banner */}
      {isMaintenanceActive && currentUser.role === 'admin' && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-inner z-50">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>
              ⚠️ MAINTENANCE MODE IS ACTIVE — Regular students are blocked. Only you (Admin) can view the vault.
            </span>
          </div>
          <button
            onClick={() =>
              handleUpdateSiteSettings({
                maintenanceMode: { ...siteSettings.maintenanceMode, enabled: false },
              })
            }
            className="bg-amber-950 hover:bg-black text-white px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors"
          >
            Turn Off Maintenance
          </button>
        </div>
      )}

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
        onOpenAuth={() => {}}
        onLogout={handleLogout}
        pendingCount={pendingQueueCount}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        aiTutorEnabled={siteSettings.aiTutorEnabled}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dynamic Personalized Urgency / Greeting Banner */}
        <UrgencyBanner
          urgentCourse={urgentCourse}
          activeSpotlightUnit={activeSpotlightUnit}
          onSelectCourse={(cId) => setSelectedCourseId(cId)}
          newResourcesCount={newResourcesCount}
          userName={effectiveUser?.name || 'Student'}
          enrolledCoursesCount={visibleCourses.length}
          isAdmin={isAdmin}
          onAddCourse={() => {
            setCourseToEdit(null);
            setIsCourseModalOpen(true);
          }}
        />

        {/* Course Tabs (with reordering and admin controls) */}
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
            onEditCourse={(c) => {
              setCourseToEdit(c);
              setIsCourseModalOpen(true);
            }}
            onDeleteCourse={handleDeleteCourse}
            onReorderCourses={handleReorderCourses}
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
            onDeleteUnit={handleDeleteUnit}
            onReorderUnit={handleReorderUnit}
            onEditResource={(res) => {
              setResourceToEdit(res);
              setIsResourceModalOpen(true);
            }}
            onDeleteResource={handleDeleteResource}
            onMoveResource={handleMoveResource}
            onUpdateResourceVisibility={handleUpdateResourceVisibility}
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
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-sm"
              >
                + Create First Course Deck
              </button>
            )}
          </div>
        )}
      </main>

      {/* Broadcast Popups Modal (Targeted or Global) */}
      <PopupAnnouncementModal
        popups={popups}
        currentUser={effectiveUser}
      />

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
            <span>&bull; Academic Study Materials & Completed HW</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsExportOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Export Backup
            </button>
            <span>&bull;</span>
            <button
              onClick={handleLogout}
              className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out ({effectiveUser?.name || 'User'})</span>
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

      {/* Admin Queue & Site Operations Center */}
      <AdminQueueModal
        isOpen={isAdminQueueOpen}
        onClose={() => setIsAdminQueueOpen(false)}
        users={users}
        courses={courses}
        units={units}
        unlockRequests={unlockRequests}
        submissions={submissions}
        popups={popups}
        siteSettings={siteSettings}
        onApproveUserRequest={handleApproveUser}
        onRejectUserRequest={handleRejectUser}
        onRespondUnlockRequest={handleRespondUnlockRequest}
        onReviewSubmission={handleReviewSubmission}
        onUpdateUserCourses={handleUpdateUserCourses}
        onToggleUserStatus={handleToggleUserStatus}
        onResetPassword={handleResetPassword}
        onCreatePopup={handleCreatePopup}
        onTogglePopup={handleTogglePopup}
        onDeletePopup={handleDeletePopup}
        onUpdateSiteSettings={handleUpdateSiteSettings}
        onToggleUserAI={handleToggleUserAI}
        onToggleAllAI={handleToggleAllAI}
        onCleanSlate={handleCleanSlate}
        onResetDemo={handleResetDemo}
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
        currentUser={effectiveUser}
      />

      {/* Backup Export Modal */}
      <BackupExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        courses={courses}
        units={units}
        resources={resources}
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
