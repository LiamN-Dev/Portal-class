import { useState } from 'react';
import {
  Vault,
  Search,
  Sparkles,
  Sun,
  Moon,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  HelpCircle,
  LogOut,
  ChevronDown,
  Inbox,
  Eye,
  Download,
} from 'lucide-react';
import type { User, Course } from '../types/index.ts';

interface NavbarProps {
  currentUser: User | null;
  users: User[];
  courses: Course[];
  impersonatingUser: User | null;
  onImpersonate: (user: User | null) => void;
  onOpenSearch: () => void;
  onOpenSubmit: () => void;
  onOpenRequestNotes: () => void;
  onOpenAdminQueue: () => void;
  onOpenAI: () => void;
  onOpenExport: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  pendingCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Navbar({
  currentUser,
  users,
  courses,
  impersonatingUser,
  onImpersonate,
  onOpenSearch,
  onOpenSubmit,
  onOpenRequestNotes,
  onOpenAdminQueue,
  onOpenAI,
  onOpenExport,
  onOpenAuth,
  onLogout,
  pendingCount,
  isDark,
  onToggleTheme,
}: NavbarProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [previewDropdownOpen, setPreviewDropdownOpen] = useState(false);

  const effectiveUser = impersonatingUser || currentUser;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      {/* Impersonation Banner if active */}
      {impersonatingUser && (
        <div className="bg-amber-500 text-amber-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-inner">
          <div className="flex items-center space-x-2">
            <Eye className="w-3.5 h-3.5 animate-pulse" />
            <span>
              Previewing Vault as: <strong className="underline">{impersonatingUser.name}</strong> (@{impersonatingUser.username}) &bull; Enrolled in {impersonatingUser.enrolledCourseIds.length} course(s)
            </span>
          </div>
          <button
            onClick={() => onImpersonate(null)}
            className="bg-amber-900 hover:bg-amber-950 text-white px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer"
          >
            Exit Preview Mode
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 text-white shadow-md shadow-indigo-500/20">
            <Vault className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                StudyVault
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                ClassDeck
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Groupings &bull; HW Keys &bull; Study Materials
            </p>
          </div>
        </div>

        {/* Center: Command Palette Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-2.5">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span className="font-normal">Search units, homework keys, notes...</span>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Mobile search button */}
          <button
            onClick={onOpenSearch}
            className="p-2 md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick Submit Study Material */}
          <button
            onClick={onOpenSubmit}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-all cursor-pointer"
            title="Submit a study guide or completed hw link"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Submit Link</span>
          </button>

          {/* Request Notes */}
          <button
            onClick={onOpenRequestNotes}
            className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-all cursor-pointer"
            title="Request notes from classmates for missed class"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>Request Notes</span>
          </button>

          {/* Admin Queue Trigger with Badge */}
          {isAdmin && (
            <button
              onClick={onOpenAdminQueue}
              className="relative inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-all cursor-pointer shadow-2xs"
              title="Admin Queue & Approval Center"
            >
              <Inbox className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Queue</span>
              {pendingCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-rose-600 rounded-full animate-bounce">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {/* Admin "Preview As" Selector */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setPreviewDropdownOpen(!previewDropdownOpen)}
                className="hidden xl:inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/80 rounded-lg transition-all cursor-pointer"
                title="Preview what specific classmates see"
              >
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>{impersonatingUser ? impersonatingUser.name : 'Preview As...'}</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {previewDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setPreviewDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Simulate Classmate View
                  </div>
                  <button
                    onClick={() => {
                      onImpersonate(null);
                      setPreviewDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer ${
                      !impersonatingUser ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span>Full Admin Access (You)</span>
                    {!impersonatingUser && <UserCheck className="w-3.5 h-3.5" />}
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-700/60 my-1" />

                  {users
                    .filter((u) => u.role !== 'admin' && u.status === 'approved')
                    .map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          onImpersonate(user);
                          setPreviewDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer ${
                          impersonatingUser?.id === user.id
                            ? 'font-bold text-amber-600 dark:text-amber-400 bg-amber-50/50'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-[10px] text-slate-500">
                            @{user.username} &bull; {user.enrolledCourseIds.length} classes
                          </p>
                        </div>
                        {impersonatingUser?.id === user.id && <Eye className="w-3.5 h-3.5 text-amber-500" />}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* AI Study Assistant Button */}
          <button
            onClick={onOpenAI}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg shadow-sm shadow-indigo-500/25 transition-all cursor-pointer"
            title="Ask AI Peer Tutor or Analyze Homework Photo"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">AI Tutor</span>
          </button>

          {/* Export Backup Button */}
          <button
            onClick={onOpenExport}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Download StudyVault Backup (JSON/Markdown)"
            aria-label="Export"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Dark/Light mode toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Profile / Auth Switcher */}
          <div className="relative">
            {effectiveUser ? (
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 pl-2 pr-1.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                  {effectiveUser.name.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-semibold leading-tight text-slate-800 dark:text-slate-200">
                    {effectiveUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">
                    {effectiveUser.role === 'admin' ? 'Vault Admin' : 'Classmate'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Profile Dropdown */}
            {profileDropdownOpen && effectiveUser && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50"
                onMouseLeave={() => setProfileDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/60">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{effectiveUser.name}</p>
                  <p className="text-[11px] text-slate-500">@{effectiveUser.username}</p>
                  {effectiveUser.role === 'admin' && (
                    <span className="inline-flex items-center space-x-1 mt-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Admin Passcode Unlocked</span>
                    </span>
                  )}
                </div>

                <div className="px-3 py-1.5 text-[11px] text-slate-500">
                  Enrolled Classes: {effectiveUser.enrolledCourseIds.length}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700/60 my-1" />

                <button
                  onClick={() => {
                    onOpenAuth();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer"
                >
                  Switch User / Login as Another
                </button>

                <button
                  onClick={() => {
                    onLogout();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
