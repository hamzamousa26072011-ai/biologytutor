'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  FolderOpen,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react';
import { AppUser } from './Navbar';
import {
  MAX_DAILY_QUESTIONS,
  getRemainingDailyQuestions,
  getTodayDateKey,
  isAdminEmail,
} from '@/lib/marking-engine';
import { StoredAccountSummary } from '@/lib/firebase';

export interface SavedPaperItem {
  id: string;
  title: string;
  awardedMarks: number;
  totalMarks: number;
  percentage: number;
  examinerSummary: string;
  correctedVersion: string;
  createdAtLabel: string;
}

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser | null;
  reasonMessage?: string | null;
  savedAccounts: StoredAccountSummary[];
  usageByEmailDate: Record<string, number>;
  onGoogleSignIn: () => Promise<void>;
  onEmailSignIn: (email: string, name: string) => Promise<void>;
  onSignOut: () => Promise<void>;
  onRemoveSavedAccount: (email: string) => void;
}

export function SignInModal({
  isOpen,
  onClose,
  user,
  reasonMessage,
  savedAccounts,
  usageByEmailDate,
  onGoogleSignIn,
  onEmailSignIn,
  onSignOut,
  onRemoveSavedAccount,
}: SignInModalProps) {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setErrorMsg(null);
    onClose();
  };

  const userIsAdmin = isAdminEmail(user?.email);
  const remainingToday = user
    ? getRemainingDailyQuestions(usageByEmailDate, user.email, getTodayDateKey())
    : 0;

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = emailInput.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);
    try {
      const derivedName = nameInput.trim() || trimmedEmail.split('@')[0] || 'Student';
      await onEmailSignIn(trimmedEmail, derivedName);
      setEmailInput('');
      setNameInput('');
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleClick = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await onGoogleSignIn();
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Google sign-in popup was closed or blocked. You can also type your email below.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickSavedAccount = async (account: StoredAccountSummary) => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await onEmailSignIn(account.email, account.name);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to switch account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signin-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-stone-200 dark:border-purple-500/30 bg-white dark:bg-[#120824] p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="signin-modal-title"
                  className="text-lg font-bold text-stone-900 dark:text-white"
                >
                  {user ? 'Your da7ee7-biology Account' : 'Sign In Required'}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-purple-200/75">
                  {user
                    ? 'Your account details and marked history are saved for future sign-ins.'
                    : reasonMessage ||
                      'Sign in with Google or your email to use Paper Correction and save your progress.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close sign in dialog"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 dark:border-purple-500/25 bg-stone-50 dark:bg-purple-500/10 text-stone-700 dark:text-purple-200 hover:bg-orange-50 dark:hover:bg-purple-500/25"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-xl border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-200">
                {errorMsg}
              </div>
            )}

            {user ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-stone-200 dark:border-purple-500/25 bg-stone-50/80 dark:bg-[#1b0e33] p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                        userIsAdmin
                          ? 'border-emerald-300 dark:border-emerald-400/40 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'border-orange-200 dark:border-fuchsia-400/40 bg-orange-50 dark:bg-fuchsia-500/20 text-[#ea580c] dark:text-fuchsia-300'
                      }`}
                    >
                      {userIsAdmin ? (
                        <ShieldCheck className="h-5 w-5" />
                      ) : (
                        <UserIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-stone-600 dark:text-purple-200/75">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {userIsAdmin ? (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-300 dark:border-emerald-400/35 bg-emerald-100/80 dark:bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
                      <span>Admin Account · Unlimited Paper Correction access active</span>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-stone-200 dark:border-purple-500/25 bg-white dark:bg-[#130926] px-3 py-2 text-xs text-stone-700 dark:text-purple-200">
                      <span>Daily Paper Correction Quota</span>
                      <span className="font-semibold text-[#c2410c] dark:text-fuchsia-300">
                        {remainingToday} of {MAX_DAILY_QUESTIONS} left today
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={async () => {
                    setSubmitting(true);
                    await onSignOut();
                    setSubmitting(false);
                    onClose();
                  }}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-300 dark:border-rose-400/35 bg-rose-50 dark:bg-rose-500/15 text-sm font-semibold text-rose-700 dark:text-rose-200 transition hover:bg-rose-100 dark:hover:bg-rose-500/25 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleGoogleClick}
                  className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-stone-200 dark:border-transparent bg-stone-900 dark:bg-white px-4 text-sm font-semibold text-white dark:text-slate-900 shadow-lg transition hover:opacity-95 active:scale-[0.99] disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4 text-[#f97316] dark:text-fuchsia-600" />
                  <span>Sign in with Google</span>
                </button>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-stone-200 dark:border-purple-500/20" />
                  <span className="mx-3 shrink text-[11px] uppercase tracking-wider text-stone-500 dark:text-purple-300/60">
                    Or enter your email
                  </span>
                  <div className="flex-grow border-t border-stone-200 dark:border-purple-500/20" />
                </div>

                <form onSubmit={handleSubmitEmail} className="space-y-3">
                  <div>
                    <label
                      htmlFor="signin-name-input"
                      className="mb-1 block text-xs font-medium text-stone-700 dark:text-purple-200/80"
                    >
                      Name (optional)
                    </label>
                    <input
                      id="signin-name-input"
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Your name"
                      className="h-10 w-full rounded-xl border border-stone-200 dark:border-purple-500/30 bg-stone-50/70 dark:bg-[#1a0d30] px-3.5 text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-purple-300/40 outline-none focus:border-[#ea580c] dark:focus:border-fuchsia-400"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="signin-email-input"
                      className="mb-1 block text-xs font-medium text-stone-700 dark:text-purple-200/80"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-purple-300/60" />
                      <input
                        id="signin-email-input"
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="student@example.com"
                        className="h-10 w-full rounded-xl border border-stone-200 dark:border-purple-500/30 bg-stone-50/70 dark:bg-[#1a0d30] pl-9 pr-3.5 text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-purple-300/40 outline-none focus:border-[#ea580c] dark:focus:border-fuchsia-400"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#f97316] dark:from-fuchsia-500 dark:to-purple-600 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 dark:shadow-fuchsia-500/25 transition hover:opacity-95 active:scale-[0.99] disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{submitting ? 'Signing in...' : 'Continue to Paper Correction'}</span>
                  </button>
                </form>

                {savedAccounts.length > 0 && (
                  <div className="pt-2 border-t border-stone-200 dark:border-purple-500/20">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-purple-300/70">
                      Saved Accounts
                    </p>
                    <div className="space-y-1.5">
                      {savedAccounts.map((acc) => (
                        <div
                          key={acc.email}
                          className="flex items-center justify-between gap-2 rounded-xl border border-stone-200 dark:border-purple-500/20 bg-stone-50/80 dark:bg-[#190c2e] px-3 py-2"
                        >
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleQuickSavedAccount(acc)}
                            className="flex min-w-0 flex-1 items-center gap-2.5 text-left hover:opacity-90"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-purple-500/20 text-xs font-bold text-[#c2410c] dark:text-fuchsia-300">
                              {acc.name.slice(0, 1).toUpperCase()}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-semibold text-stone-900 dark:text-white">
                                {acc.name}
                              </span>
                              <span className="block truncate text-[11px] text-stone-600 dark:text-purple-200/70">
                                {acc.email}
                              </span>
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveSavedAccount(acc.email)}
                            aria-label={`Remove saved account ${acc.email}`}
                            className="rounded-lg p-1.5 text-stone-500 dark:text-purple-300/60 hover:bg-rose-100 dark:hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface SavedPapersModalProps {
  isOpen: boolean;
  onClose: () => void;
  papers: SavedPaperItem[];
  onDeletePaper: (id: string) => void;
}

export function SavedPapersModal({
  isOpen,
  onClose,
  papers,
  onDeletePaper,
}: SavedPapersModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="saved-papers-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-stone-200 dark:border-purple-500/30 bg-white dark:bg-[#120824] p-5 sm:p-6 shadow-2xl max-h-[85vh] flex flex-col"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="h-5 w-5 text-[#ea580c] dark:text-fuchsia-300" />
                <h2
                  id="saved-papers-title"
                  className="text-lg font-bold text-stone-900 dark:text-white"
                >
                  Saved Marked Papers
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close saved papers dialog"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 dark:border-purple-500/25 bg-stone-50 dark:bg-purple-500/10 text-stone-700 dark:text-purple-200 hover:bg-orange-50 dark:hover:bg-purple-500/25"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {papers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 dark:border-purple-500/30 bg-stone-50/70 dark:bg-[#180c2d]/60 p-8 text-center">
                <p className="text-sm font-medium text-stone-900 dark:text-purple-100">
                  No saved papers yet
                </p>
                <p className="mt-1 text-xs text-stone-600 dark:text-purple-300/70">
                  Mark a Cambridge 0610 Biology answer and click Save Paper to keep your feedback for revision.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {papers.map((paper) => (
                  <div
                    key={paper.id}
                    className="rounded-xl border border-stone-200 dark:border-purple-500/25 bg-stone-50/80 dark:bg-[#190c2e] p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-stone-900 dark:text-white">
                          {paper.title}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-stone-500 dark:text-purple-300/70">
                          {paper.createdAtLabel}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-lg border border-orange-200 dark:border-fuchsia-400/35 bg-orange-50 dark:bg-fuchsia-500/15 px-2 py-0.5 font-mono text-xs font-bold text-[#c2410c] dark:text-fuchsia-200">
                          {paper.awardedMarks}/{paper.totalMarks} ({paper.percentage}%)
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeletePaper(paper.id)}
                          aria-label={`Delete saved paper ${paper.title}`}
                          className="rounded-lg p-1.5 text-stone-500 dark:text-purple-300/60 hover:bg-rose-100 dark:hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-stone-700 dark:text-purple-200/80">
                      {paper.examinerSummary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
