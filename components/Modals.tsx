'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  User,
  FolderArchive,
  ArrowUpRight,
  Trash2,
  LogOut,
  CheckCircle2,
  Chrome,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  MAX_DAILY_QUESTIONS,
  SavedPaper,
  StudentUser,
} from '@/lib/marking-engine';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: StudentUser | null;
  onSignIn: (user: StudentUser) => void;
  onSignOut: () => void;
  dailyUsedCount?: number;
  isDark: boolean;
}

export function SignInModal({
  isOpen,
  onClose,
  user,
  onSignIn,
  onSignOut,
  dailyUsedCount = 0,
  isDark,
}: SignInModalProps) {
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [googleEmail, setGoogleEmail] = useState(
    user?.provider === 'google' ? user.email : 'Hamzamousa26072011@gmail.com'
  );
  const [googleName, setGoogleName] = useState(
    user?.provider === 'google' && user.name ? user.name : 'Hamza Mousa'
  );
  const [error, setError] = useState('');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.email) {
        onSignIn({
          email: String(event.data.email).trim().toLowerCase(),
          name: event.data.name || undefined,
          provider: 'google',
        });
        onClose();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSignIn, onClose]);

  if (!isOpen) return null;

  const remainingQuestions = Math.max(0, MAX_DAILY_QUESTIONS - dailyUsedCount);

  const handleGoogleSignInConfirm = (selectedEmail?: string, selectedName?: string) => {
    const targetEmail = (selectedEmail ?? googleEmail).trim().toLowerCase();
    const targetName = (selectedName ?? googleName).trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }
    setError('');
    onSignIn({
      email: targetEmail,
      name: targetName || targetEmail.split('@')[0],
      provider: 'google',
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid student email address.');
      return;
    }
    setError('');
    onSignIn({
      email: trimmedEmail,
      name: name.trim() || undefined,
      provider: 'email',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-modal-title"
        className={`w-full max-w-md rounded-2xl border p-5 sm:p-6 shadow-2xl transition-all ${
          isDark
            ? 'border-purple-500/35 bg-[#0e0b18] text-white shadow-[0_0_40px_rgba(139,92,246,0.25)]'
            : 'border-[#E7E0D6] bg-white text-[#1C1917]'
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b pb-3 border-current/10">
          <div>
            <h2 id="signin-modal-title" className="text-base sm:text-lg font-bold">
              Student Sign-In
            </h2>
            <p
              className={`mt-0.5 text-xs ${
                isDark ? 'text-slate-400' : 'text-[#57534E]'
              }`}
            >
              Sign in is required for Paper Correction • Includes{' '}
              <span className="font-bold">10 questions per day</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Sign-In Modal"
            className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg p-1.5 transition-colors ${
              isDark
                ? 'text-slate-400 hover:bg-purple-950/60 hover:text-white'
                : 'text-[#57534E] hover:bg-[#F8F6F1] hover:text-[#1C1917]'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Daily Quota Status Pill */}
        <div
          className={`mt-3.5 flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs ${
            isDark
              ? 'border-purple-500/30 bg-[#06050b]/80 text-purple-200'
              : 'border-[#2D6A4F]/25 bg-[#EAF2EC]/70 text-[#2D6A4F]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="font-semibold">
              Daily Paper Correction Allowance
            </span>
          </div>
          <span className="font-mono font-bold">
            {user
              ? `${remainingQuestions} / ${MAX_DAILY_QUESTIONS} left today`
              : `${MAX_DAILY_QUESTIONS} questions / day`}
          </span>
        </div>

        {/* Sign in with Google Option */}
        <div className="mt-4 space-y-2.5">
          {!showGoogleChooser ? (
            <button
              type="button"
              onClick={() => setShowGoogleChooser(true)}
              className={`flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-bold transition-all active:scale-[0.99] ${
                isDark
                  ? 'border-purple-400/45 bg-white text-[#1C1917] shadow-[0_0_20px_rgba(255,255,255,0.12)] hover:bg-slate-100'
                  : 'border-[#1C1917]/20 bg-[#1C1917] text-white shadow-sm hover:bg-[#292524]'
              }`}
            >
              <Chrome className="h-4 w-4 shrink-0 text-blue-500" />
              <span>Sign in with Google</span>
            </button>
          ) : (
            <div
              className={`space-y-3 rounded-xl border p-3.5 ${
                isDark
                  ? 'border-purple-400/40 bg-[#06050b]'
                  : 'border-[#E7E0D6] bg-[#F8F6F1]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Chrome className="h-4 w-4 text-blue-500" />
                  <span>Choose a Google Account</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleChooser(false)}
                  className="text-[11px] opacity-70 hover:opacity-100"
                >
                  Back
                </button>
              </div>

              {/* 1-Click Quick Google Account Button */}
              <button
                type="button"
                onClick={() =>
                  handleGoogleSignInConfirm(
                    'Hamzamousa26072011@gmail.com',
                    'Hamza Mousa'
                  )
                }
                className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition-all ${
                  isDark
                    ? 'border-purple-500/35 bg-purple-950/40 hover:border-purple-400 hover:bg-purple-900/50'
                    : 'border-[#E7E0D6] bg-white hover:border-[#C85A32]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    H
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold">Hamza Mousa</div>
                    <div className="truncate font-mono text-[11px] opacity-75">
                      Hamzamousa26072011@gmail.com
                    </div>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold ${
                    isDark
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#C85A32] text-white'
                  }`}
                >
                  Continue
                </span>
              </button>

              <div className="space-y-2 pt-1">
                <label
                  htmlFor="google-account-email"
                  className="block text-[11px] font-semibold opacity-80"
                >
                  Or use another Google account:
                </label>
                <input
                  id="google-account-email"
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="your.name@gmail.com"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                    isDark
                      ? 'border-purple-500/30 bg-[#0e0b18] text-white focus:border-purple-400'
                      : 'border-[#E7E0D6] bg-white text-[#1C1917] focus:border-[#C85A32]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleGoogleSignInConfirm()}
                  className={`flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white transition-all ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-500'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Continue with Google Account</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-current/10" />
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              isDark ? 'text-slate-400' : 'text-[#57534E]'
            }`}
          >
            Or sign in with email
          </span>
          <div className="h-px flex-1 bg-current/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label
              htmlFor="student-email-input"
              className={`mb-1.5 block text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-purple-200' : 'text-[#57534E]'
              }`}
            >
              Email Address <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Mail
                className={`pointer-events-none absolute top-3 left-3 h-4 w-4 ${
                  isDark ? 'text-purple-400' : 'text-[#9C3814]'
                }`}
              />
              <input
                id="student-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@cambridge-igcse.edu"
                className={`w-full rounded-xl border py-2.5 pr-3 pl-9 text-base sm:text-sm transition-colors focus:outline-none ${
                  isDark
                    ? 'border-purple-500/30 bg-[#06050b] text-white placeholder-slate-500 focus:border-purple-400'
                    : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#1C1917] placeholder-stone-400 focus:border-[#C85A32]'
                }`}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="student-name-input"
              className={`mb-1.5 block text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-purple-200' : 'text-[#57534E]'
              }`}
            >
              Student Name (Optional)
            </label>
            <div className="relative">
              <User
                className={`pointer-events-none absolute top-3 left-3 h-4 w-4 ${
                  isDark ? 'text-purple-400' : 'text-[#9C3814]'
                }`}
              />
              <input
                id="student-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className={`w-full rounded-xl border py-2.5 pr-3 pl-9 text-base sm:text-sm transition-colors focus:outline-none ${
                  isDark
                    ? 'border-purple-500/30 bg-[#06050b] text-white placeholder-slate-500 focus:border-purple-400'
                    : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#1C1917] placeholder-stone-400 focus:border-[#C85A32]'
                }`}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-400">{error}</p>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            {user && (
              <button
                type="button"
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className={`mr-auto flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                  isDark
                    ? 'border-rose-500/30 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50'
                    : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`min-h-[40px] rounded-xl px-4 py-2 text-xs font-semibold ${
                isDark
                  ? 'text-slate-300 hover:bg-purple-950/50'
                  : 'text-[#57534E] hover:bg-[#F8F6F1]'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex min-h-[40px] items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition-all ${
                isDark
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-[0_0_18px_rgba(168,85,247,0.4)] hover:brightness-110'
                  : 'bg-[#C85A32] hover:bg-[#9C3814]'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Save &amp; Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface SavedPapersModalProps {
  isOpen: boolean;
  onClose: () => void;
  papers: SavedPaper[];
  onLoadPaper: (paper: SavedPaper) => void;
  onDeletePaper: (id: string) => void;
  isDark: boolean;
}

export function SavedPapersModal({
  isOpen,
  onClose,
  papers,
  onLoadPaper,
  onDeletePaper,
  isDark,
}: SavedPapersModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-papers-title"
        className={`flex max-h-[85dvh] w-full max-w-2xl flex-col rounded-2xl border p-5 sm:p-6 shadow-2xl ${
          isDark
            ? 'border-purple-500/35 bg-[#0e0b18] text-white shadow-[0_0_40px_rgba(139,92,246,0.25)]'
            : 'border-[#E7E0D6] bg-white text-[#1C1917]'
        }`}
      >
        <div className="flex items-center justify-between border-b pb-3 border-current/10">
          <div className="flex items-center gap-2.5">
            <FolderArchive
              className={`h-5 w-5 ${
                isDark ? 'text-purple-400' : 'text-[#C85A32]'
              }`}
            />
            <div>
              <h2 id="saved-papers-title" className="text-base sm:text-lg font-bold">
                Saved Papers History
              </h2>
              <p
                className={`text-xs ${
                  isDark ? 'text-slate-400' : 'text-[#57534E]'
                }`}
              >
                Past graded Cambridge IGCSE Biology (0610) question submissions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Saved Papers Modal"
            className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg p-1.5 transition-colors ${
              isDark
                ? 'text-slate-400 hover:bg-purple-950/60 hover:text-white'
                : 'text-[#57534E] hover:bg-[#F8F6F1] hover:text-[#1C1917]'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex-1 space-y-2.5 overflow-y-auto pr-1">
          {papers.length === 0 ? (
            <div
              className={`rounded-xl border border-dashed p-8 text-center ${
                isDark
                  ? 'border-purple-500/25 bg-[#06050b]/60 text-slate-400'
                  : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#57534E]'
              }`}
            >
              <p className="text-sm font-semibold">No saved papers yet</p>
              <p className="mt-1 text-xs">
                Sign in with Google or email and grade a question — every graded submission is saved here automatically.
              </p>
            </div>
          ) : (
            papers.map((paper) => (
              <div
                key={paper.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${
                  isDark
                    ? 'border-purple-500/25 bg-[#06050b]/80 hover:border-purple-400/50'
                    : 'border-[#E7E0D6] bg-[#F8F6F1]/70 hover:border-[#C85A32]/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-11 w-12 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-extrabold ${
                      paper.result.percentage >= 80
                        ? isDark
                          ? 'border border-emerald-400/40 bg-emerald-950/60 text-emerald-300'
                          : 'border border-[#2D6A4F]/30 bg-[#EAF2EC] text-[#2D6A4F]'
                        : paper.result.percentage >= 60
                        ? isDark
                          ? 'border border-purple-400/40 bg-purple-950/60 text-purple-200'
                          : 'border border-amber-500/30 bg-amber-50 text-amber-800'
                        : isDark
                        ? 'border border-rose-500/40 bg-rose-950/60 text-rose-300'
                        : 'border border-rose-300 bg-rose-50 text-rose-800'
                    }`}
                  >
                    {paper.result.percentage}%
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold line-clamp-1">
                      {paper.title}
                    </h3>
                    <div
                      className={`mt-0.5 flex flex-wrap items-center gap-2 font-mono text-xs ${
                        isDark ? 'text-slate-400' : 'text-[#57534E]'
                      }`}
                    >
                      <span>{paper.createdAt}</span>
                      <span>•</span>
                      <span
                        className={
                          isDark
                            ? 'font-semibold text-purple-300'
                            : 'font-semibold text-[#9C3814]'
                        }
                      >
                        {paper.result.awardedMarks}/{paper.result.totalMarks} m (
                        {paper.result.percentage}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadPaper(paper);
                      onClose();
                    }}
                    className={`flex min-h-[38px] items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all ${
                      isDark
                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110'
                        : 'bg-[#C85A32] hover:bg-[#9C3814]'
                    }`}
                  >
                    <span>Load</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePaper(paper.id)}
                    aria-label="Delete saved paper"
                    className={`min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg p-1.5 transition-colors ${
                      isDark
                        ? 'text-slate-400 hover:bg-rose-950/60 hover:text-rose-300'
                        : 'text-[#57534E] hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
