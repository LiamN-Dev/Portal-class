import { useState, useEffect } from 'react';
import { AlertTriangle, Info, Bell, Check, X, ExternalLink } from 'lucide-react';
import type { AdminPopup, User } from '../types/index.ts';

interface PopupAnnouncementModalProps {
  popups: AdminPopup[];
  currentUser: User | null;
}

export function PopupAnnouncementModal({ popups, currentUser }: PopupAnnouncementModalProps) {
  const [activePopup, setActivePopup] = useState<AdminPopup | null>(null);

  useEffect(() => {
    if (!currentUser || popups.length === 0) {
      setActivePopup(null);
      return;
    }

    // Find first active popup matching global or current user that hasn't been dismissed
    const relevant = popups.find((p) => {
      if (!p.active) return false;
      const isTargeted = p.scope === 'global' || p.targetUserId === currentUser.id;
      if (!isTargeted) return false;

      const isDismissed = localStorage.getItem(`studyvault_dismissed_pop_${p.id}`) === 'true';
      return !isDismissed;
    });

    setActivePopup(relevant || null);
  }, [popups, currentUser]);

  if (!activePopup) return null;

  const handleDismiss = () => {
    localStorage.setItem(`studyvault_dismissed_pop_${activePopup.id}`, 'true');
    setActivePopup(null);
  };

  const getStyle = () => {
    switch (activePopup.type) {
      case 'urgent':
        return {
          icon: AlertTriangle,
          badge: 'bg-rose-500 text-white',
          badgeText: '🚨 Urgent Notice',
          border: 'border-rose-400 dark:border-rose-800',
          bgHeader: 'bg-rose-50 dark:bg-rose-950/60',
          btn: 'bg-rose-600 hover:bg-rose-700 text-white',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          badge: 'bg-amber-500 text-white',
          badgeText: '⚠️ Important Notice',
          border: 'border-amber-400 dark:border-amber-800',
          bgHeader: 'bg-amber-50 dark:bg-amber-950/60',
          btn: 'bg-amber-600 hover:bg-amber-700 text-white',
        };
      case 'info':
      default:
        return {
          icon: Info,
          badge: 'bg-indigo-600 text-white',
          badgeText: '📢 Class Announcement',
          border: 'border-indigo-400 dark:border-indigo-800',
          bgHeader: 'bg-indigo-50 dark:bg-indigo-950/60',
          btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        };
    }
  };

  const style = getStyle();
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border ${style.border} overflow-hidden animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 ${style.bgHeader} border-b border-slate-200 dark:border-slate-800 flex items-center justify-between`}>
          <div className="flex items-center space-x-2.5">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${style.badge}`}>
              {style.badgeText}
            </span>
            {activePopup.scope === 'user' && (
              <span className="text-[10px] font-semibold text-slate-500 px-2 py-0.5 rounded bg-white/70 dark:bg-slate-800/80">
                Direct to You
              </span>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {activePopup.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date(activePopup.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap pl-13 pt-1">
            {activePopup.message}
          </div>

          {activePopup.actionUrl && (
            <div className="pl-13 pt-2">
              <a
                href={activePopup.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>{activePopup.actionText || 'Open Attached Resource'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleDismiss}
            className={`inline-flex items-center space-x-1.5 px-5 py-2 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer ${style.btn}`}
          >
            <Check className="w-4 h-4" />
            <span>I Understand / Acknowledge</span>
          </button>
        </div>
      </div>
    </div>
  );
}
