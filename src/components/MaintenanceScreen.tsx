import { useState, useEffect } from 'react';
import { ShieldAlert, Clock, Lock, KeyRound, ArrowRight, X } from 'lucide-react';
import type { SiteSettings } from '../types/index.ts';

interface MaintenanceScreenProps {
  settings: SiteSettings['maintenanceMode'];
  onAdminLogin: (username: string, password?: string) => Promise<void>;
}

export function MaintenanceScreen({ settings, onAdminLogin }: MaintenanceScreenProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const target = settings.countdownTarget
      ? new Date(settings.countdownTarget).getTime()
      : Date.now() + 3600 * 1000 * 2;

    const interval = setInterval(() => {
      const diff = Math.max(0, target - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.countdownTarget]);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await onAdminLogin(adminUsername, adminPassword);
      setIsAdminModalOpen(false);
    } catch (err: any) {
      setLoginError(err?.message || 'Invalid administrator password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white select-none">
      <div className="w-full max-w-xl text-center space-y-6">
        {/* Pulsing Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-2xl shadow-amber-500/10 animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Title */}
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-block mb-3">
            System Maintenance Mode
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            StudyVault is Under Maintenance
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
            {settings.message || 'Scheduled unit restructuring and updates are in progress. The vault will be back online shortly.'}
          </p>
        </div>

        {/* Live Countdown Clock */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-slate-400 mb-4">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Estimated Resumption In:</span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase mt-1">Days</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase mt-1">Hours</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase mt-1">Mins</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase mt-1">Secs</span>
            </div>
          </div>
        </div>

        {/* Admin Bypass Link */}
        <div className="pt-4">
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer inline-flex items-center space-x-1.5 opacity-60 hover:opacity-100"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Administrator Login Bypass</span>
          </button>
        </div>
      </div>

      {/* Admin Bypass Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Admin Access Verification</h3>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Only authenticated administrators can bypass maintenance mode.
            </p>

            <form onSubmit={handleAdminSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admin Passcode
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter vaultadmin password"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white"
                  required
                  autoFocus
                />
              </div>

              {loginError && (
                <p className="text-xs text-rose-400">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer"
              >
                {isLoggingIn ? 'Verifying...' : 'Bypass to Admin Panel'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
