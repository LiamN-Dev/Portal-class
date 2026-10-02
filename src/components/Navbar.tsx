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
  Lock,
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
  aiTutorEnabled?: boolean;
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
  aiTutorEnabled,
}: NavbarProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [previewDropdownOpen, setPreviewDropdownOpen] = useState(false);
  const [showAiNotice, setShowAiNotice] = useState(false);

  const effectiveUser = impersonatingUser || currentUser;
  const isActualAdmin = currentUser?.role === 'admin';
  const isAiActiveForUser = isActualAdmin || effectiveUser?.aiTutorEnabled === true;

  const handleAiClick = () => {
    if (isAiActiveForUser) {
      onOpenAI();
    } else {
      setShowAiNotice(true);
      setTimeout(() => setShowAiNotice(false), 4000);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      {/* Impersonation Banner if active */}
      {impersonatingUser && (
        <div className="bg-amber-500 text-amber-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-inner">
          <div className="flex items-center space-x-2 truncate">
            <Eye className="w-3.5 h-3.5 animate-pulse flex-shrink-0" />
            <span className="truncate">
              Previewing Vault as: <strong className="underline">{impersonatingUser.name}</strong> (@{impersonatingUser.username}) &bull; Enrolled in {impersonatingUser.enrolledCourseIds.length} course(s)
            </span>
          </div>
          <button
            onClick={() => onImpersonate(null)}
            className="bg-amber-900 hover:bg-amber-950 text-white px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer flex-shrink-0 ml-2"
          >
            Exit Preview
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand */}
        <div className="flex items-center space-x-2.5 flex-shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 text-white shadow-md shadow-indigo-500/20">
            <Vault className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                StudyVault
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hidden sm:inline-block">
                Deck
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden md:block">
              Academic Hub & HW Keys
            </p>
          </div>
        </div>

        {/* Center: Search Bar Trigger (Clean, short placeholder, no cutoff) */}
        <div className="flex-1 max-w-[160px] sm:max-w-xs mx-1 sm:mx-2">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-2.5 sm:px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-2 truncate">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
              <span className="truncate">Search (⌘K)</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-medium text-slate-500 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded flex-shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {/* Quick Submit Study Material */}
          <button
            onClick={onOpenSubmit}
            className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-all cursor-pointer"
            title="Submit study guide or homework link"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Submit</span>
          </button>

          {/* Request Notes */}
          <button
            onClick={onOpenRequestNotes}
            className="hidden lg:inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-all cursor-pointer"
            title="Request notes from classmates"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>Request Notes</span>
          </button>

          {/* Admin Queue Button with Badge */}
          {isActualAdmin && (
            <button
              onClick={onOpenAdminQueue}
              className="relative inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Admin Queue & Approval Center"
            >
              <Inbox className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Queue</span>
              {pendingCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-rose-600 rounded-full animate-bounce">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {/* Admin "Preview As" Selector */}
          {isActualAdmin && (
            <div className="relative">
              <button
                onClick={() => setPreviewDropdownOpen(!previewDropdownOpen)}
                className="hidden xl:inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 rounded-xl transition-all cursor-pointer"
                title="Preview what specific classmates see"
              >
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span className="max-w-[80px] truncate">{impersonatingUser ? impersonatingUser.name : 'Preview'}</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {previewDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setPreviewDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Simulate Student View
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
                    <span>Full Admin View</span>
                    {!impersonatingUser && <UserCheck className="w-3.5 h-3.5" />}
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

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
                        <div className="truncate pr-2">
                          <p className="font-semibold truncate">{user.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {user.enrolledCourseIds.length} classes
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
          <div className="relative">
            <button
              onClick={handleAiClick}
              className={`inline-flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs ${
                isAiActiveForUser
                  ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                  : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
              title={
                isAiActiveForUser
                  ? 'AI Study Assistant'
                  : 'AI Tutor is deactivated for your account. Ask your administrator to enable access.'
              }
            >
              {isAiActiveForUser ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden sm:inline">AI Tutor</span>
              {!isAiActiveForUser && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold ml-0.5">
                  Locked
                </span>
              )}
            </button>

            {showAiNotice && (
              <div className="absolute right-0 mt-2 w-64 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95">
                <p className="font-bold">AI Tutor Deactivated</p>
                <p className="text-[11px] mt-1 opacity-90">
                  AI Study Assistant access has not been activated for your account. Please ask your administrator.
                </p>
              </div>
            )}
          </div>

          {/* Export Backup Button */}
          <button
            onClick={onOpenExport}
            className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Download StudyVault Backup (JSON/Markdown)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Dark/Light mode toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Toggle color theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Profile / Logout Dropdown */}
          <div className="relative">
            {effectiveUser ? (
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-1.5 pl-1.5 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {effectiveUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold leading-tight text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                    {effectiveUser.name}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-none">
                    {effectiveUser.role === 'admin' ? 'Admin' : 'Student'}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Profile Dropdown with Prominent Sign Out */}
            {profileDropdownOpen && effectiveUser && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setProfileDropdownOpen(false)}
              >
                <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{effectiveUser.name}</p>
                  <p className="text-[11px] text-slate-400">@{effectiveUser.username}</p>
                  {effectiveUser.role === 'admin' && (
                    <span className="inline-flex items-center space-x-1 mt-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Admin Account</span>
                    </span>
                  )}
                </div>

                <div className="px-3.5 py-1.5 text-[11px] text-slate-400">
                  Enrolled Classes: {effectiveUser.enrolledCourseIds.length}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out ({effectiveUser.name})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
