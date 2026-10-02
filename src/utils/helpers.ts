import {
  FileText,
  FileCode,
  FileSpreadsheet,
  Layers,
  Video,
  Presentation,
  Bookmark,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import type { ResourceType, ResourceCategory, Course } from '../types/index.ts';

export function getCourseColorClasses(color: Course['color']) {
  switch (color) {
    case 'emerald':
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        accentBg: 'bg-emerald-500',
        border: 'border-emerald-500',
        ring: 'focus:ring-emerald-500',
        glow: 'shadow-emerald-500/10',
        text: 'text-emerald-600 dark:text-emerald-400',
        headerGradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
        pill: 'bg-emerald-500 text-white',
      };
    case 'rose':
      return {
        badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
        accentBg: 'bg-rose-500',
        border: 'border-rose-500',
        ring: 'focus:ring-rose-500',
        glow: 'shadow-rose-500/10',
        text: 'text-rose-600 dark:text-rose-400',
        headerGradient: 'from-rose-500/15 via-rose-500/5 to-transparent',
        pill: 'bg-rose-500 text-white',
      };
    case 'indigo':
      return {
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
        accentBg: 'bg-indigo-500',
        border: 'border-indigo-500',
        ring: 'focus:ring-indigo-500',
        glow: 'shadow-indigo-500/10',
        text: 'text-indigo-600 dark:text-indigo-400',
        headerGradient: 'from-indigo-500/15 via-indigo-500/5 to-transparent',
        pill: 'bg-indigo-500 text-white',
      };
    case 'amber':
      return {
        badge: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
        accentBg: 'bg-amber-500',
        border: 'border-amber-500',
        ring: 'focus:ring-amber-500',
        glow: 'shadow-amber-500/10',
        text: 'text-amber-600 dark:text-amber-400',
        headerGradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
        pill: 'bg-amber-500 text-white',
      };
    case 'cyan':
      return {
        badge: 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800',
        accentBg: 'bg-cyan-500',
        border: 'border-cyan-500',
        ring: 'focus:ring-cyan-500',
        glow: 'shadow-cyan-500/10',
        text: 'text-cyan-600 dark:text-cyan-400',
        headerGradient: 'from-cyan-500/15 via-cyan-500/5 to-transparent',
        pill: 'bg-cyan-500 text-white',
      };
    case 'purple':
    default:
      return {
        badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
        accentBg: 'bg-purple-500',
        border: 'border-purple-500',
        ring: 'focus:ring-purple-500',
        glow: 'shadow-purple-500/10',
        text: 'text-purple-600 dark:text-purple-400',
        headerGradient: 'from-purple-500/15 via-purple-500/5 to-transparent',
        pill: 'bg-purple-500 text-white',
      };
  }
}

export function getResourceTypeConfig(type: ResourceType) {
  switch (type) {
    case 'doc':
      return {
        label: 'Google Doc',
        icon: FileText,
        color: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900',
      };
    case 'pdf':
      return {
        label: 'PDF Document',
        icon: BookOpen,
        color: 'text-red-500 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900',
      };
    case 'quizlet':
      return {
        label: 'Quizlet Deck',
        icon: Layers,
        color: 'text-cyan-600 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:border-cyan-900',
      };
    case 'slides':
      return {
        label: 'Google Slides',
        icon: Presentation,
        color: 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900',
      };
    case 'video':
      return {
        label: 'Video Guide',
        icon: Video,
        color: 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900',
      };
    case 'sheets':
      return {
        label: 'Google Sheet',
        icon: FileSpreadsheet,
        color: 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900',
      };
    case 'notion':
      return {
        label: 'Notion Page',
        icon: Bookmark,
        color: 'text-slate-700 bg-slate-100 border-slate-300 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700',
      };
    case 'code':
      return {
        label: 'Code / GitHub',
        icon: FileCode,
        color: 'text-violet-500 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:border-violet-900',
      };
    case 'link':
    default:
      return {
        label: 'Web Link',
        icon: ExternalLink,
        color: 'text-gray-500 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700',
      };
  }
}

export function getCategoryBadge(category: ResourceCategory) {
  switch (category) {
    case 'completed_hw':
      return {
        label: 'Completed HW Key',
        className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 font-semibold',
      };
    case 'study_guide':
      return {
        label: 'Study Guide',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
      };
    case 'lecture_notes':
      return {
        label: 'Lecture Notes',
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
      };
    case 'lab_report':
      return {
        label: 'Lab Report',
        className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200',
      };
    case 'practice_exam':
      return {
        label: 'Practice Exam',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
      };
    case 'formula_sheet':
      return {
        label: 'Formula Sheet',
        className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
      };
    default:
      return {
        label: 'Resource',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      };
  }
}

export function formatTimeLeft(targetDateStr: string): string {
  const diffMs = new Date(targetDateStr).getTime() - Date.now();
  if (diffMs <= 0) return 'Due now / Past due';

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 1) return `In ${diffDays} days`;
  if (diffHours >= 1) return `In ${diffHours} hours`;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return `In ${diffMinutes} mins`;
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    // Fallback for older browsers / iframe restrictions
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      textArea.remove();
      return Promise.resolve(true);
    } catch {
      textArea.remove();
      return Promise.resolve(false);
    }
  }
}
