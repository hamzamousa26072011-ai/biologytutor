'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  User,
  FolderArchive,
  ArrowUpRight,
  Trash2,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { SavedPaper, StudentUser } from '@/lib/marking-engine';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: StudentUser | null;
  onSignIn: (user: StudentUser) => void;
  onSignOut: () => void;
  isDark: boolean;
}

export function SignInModal({
  isOpen,
  onClose,
  user,
  onSignIn,
  onSignOut,
  isDark,
}: SignInModalProps) {
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

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
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-modal-title"
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
          isDark
            ? 'border-purple-500/35 bg-[#0e0b18] text-white shadow-[0_0_40px_rgba(139,92,246,0.25)]'
            : 'border-[#E7E0D6] bg-white text-[#1C1917]'
        }`}
      >
        <div className="flex items-center justify-between border-b pb-3 border-current/10">
          <div>
            <h2 id="signin-modal-title" className="text-lg font-bold">
              Student Sign-In
            </h2>
            <p
              className={`text-xs ${
                isDark ? 'text-slate-400' : 'text-[#57534E]'
              }`}
            >
              Automatically save every graded Biology (0610) question to your history.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Sign-In Modal"
            className={`rounded-lg p-1.5 transition-colors ${
              isDark
                ? 'text-slate-400 hover:bg-purple-950/60 hover:text-white'
                : 'text-[#57534E] hover:bg-[#F8F6F1] hover:text-[#1C1917]'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
                className={`w-full rounded-xl border py-2.5 pr-3 pl-9 text-base transition-colors focus:outline-none ${
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
                className={`w-full rounded-xl border py-2.5 pr-3 pl-9 text-base transition-colors focus:outline-none ${
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

          <div className="flex items-center justify-end gap-2 pt-2">
            {user && (
              <button
                type="button"
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className={`mr-auto flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
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
              className={`rounded-xl px-4 py-2 text-xs font-semibold ${
                isDark
                  ? 'text-slate-300 hover:bg-purple-950/50'
                  : 'text-[#57534E] hover:bg-[#F8F6F1]'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition-all ${
                isDark
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-[0_0_18px_rgba(168,85,247,0.4)] hover:brightness-110'
                  : 'bg-[#C85A32] hover:bg-[#9C3814]'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Save & Sign In
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-papers-title"
        className={`flex max-h-[82dvh] w-full max-w-2xl flex-col rounded-2xl border p-6 shadow-2xl ${
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
              <h2 id="saved-papers-title" className="text-lg font-bold">
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
            className={`rounded-lg p-1.5 transition-colors ${
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
                Sign in with your email and grade a question — every graded submission is saved here automatically.
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
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-mono text-base font-extrabold ${
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
                    {paper.result.grade}
                  </div>
                  <div>
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
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all ${
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
                    className={`rounded-lg p-1.5 transition-colors ${
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
