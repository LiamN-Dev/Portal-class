import { useState } from 'react';
import { Download, X, Copy, Check, FileText, Code2 } from 'lucide-react';
import type { Course, Unit, ResourceItem } from '../types/index.ts';
import { copyToClipboard } from '../utils/helpers.ts';

interface BackupExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  units: Unit[];
  resources: ResourceItem[];
}

export function BackupExportModal({
  isOpen,
  onClose,
  courses,
  units,
  resources,
}: BackupExportModalProps) {
  const [format, setFormat] = useState<'markdown' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate Markdown
  const generateMarkdown = (): string => {
    let md = `# StudyVault - Academic Study Materials & Completed HW Backup\n`;
    md += `*Exported on: ${new Date().toLocaleString()}*\n\n`;

    courses.forEach((course) => {
      md += `## 📚 ${course.name} (${course.code} - ${course.period})\n`;
      md += `**Instructor:** ${course.teacher} | **Room:** ${course.room}\n`;
      md += `*${course.description}*\n\n`;

      const courseUnits = units.filter((u) => u.courseId === course.id);
      courseUnits.forEach((unit) => {
        md += `### 📂 ${unit.title}\n`;
        md += `*${unit.description}*\n\n`;

        const unitRes = resources.filter((r) => r.unitId === unit.id);
        if (unitRes.length === 0) {
          md += `- *(No resources posted yet)*\n\n`;
        } else {
          unitRes.forEach((res) => {
            const hwTag = res.isCompletedHw ? '[COMPLETED HW KEY] ' : '';
            md += `- **${hwTag}${res.title}** (${res.type.toUpperCase()})\n`;
            md += `  - Link: ${res.url}\n`;
            md += `  - Notes: ${res.description}\n`;
            if (res.previewSnippet) {
              md += `  - Excerpt: \`${res.previewSnippet}\`\n`;
            }
          });
          md += `\n`;
        }
      });
      md += `---\n\n`;
    });

    return md;
  };

  // Generate JSON
  const generateJSON = (): string => {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        vaultVersion: '1.0',
        courses,
        units,
        resources,
      },
      null,
      2
    );
  };

  const content = format === 'markdown' ? generateMarkdown() : generateJSON();

  const handleCopy = async () => {
    const ok = await copyToClipboard(content);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const filename = `studyvault-backup-${new Date().toISOString().split('T')[0]}.${
      format === 'markdown' ? 'md' : 'json'
    }`;
    const blob = new Blob([content], {
      type: format === 'markdown' ? 'text/markdown' : 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                One-Click Export & Backup
              </h3>
              <p className="text-xs text-slate-500">
                Safeguard all course study links, lecture slides, and completed keys.
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

        {/* Format Selector Bar */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold">Format:</span>
            <button
              onClick={() => setFormat('markdown')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                format === 'markdown'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Markdown (.md)</span>
            </button>
            <button
              onClick={() => setFormat('json')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                format === 'json'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>JSON Raw (.json)</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy All'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1 px-3 py-1 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed select-all">
          <pre className="whitespace-pre-wrap">{content}</pre>
        </div>
      </div>
    </div>
  );
}
