'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Dna,
  FolderOpen,
  LogIn,
  MessageSquare,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { isAdminEmail } from '@/lib/marking-engine';

export type ActiveTab = 'checking' | 'tutor';
export type ThemeMode = 'dark' | 'light';

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  provider: 'google' | 'email';
}

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onNewQuestion: () => void;
  onOpenSaved: () => void;
  savedCount: number;
  user: AppUser | null;
  onOpenSignIn: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export default function Navbar({
  activeTab,
  onSelectTab,
  onNewQuestion,
  onOpenSaved,
  savedCount,
  user,
  onOpenSignIn,
  theme,
  onToggleTheme,
}: NavbarProps) {
  const userIsAdmin = isAdminEmail(user?.email);

  const handleBrandRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/90 dark:border-purple-500/20 bg-white/95 dark:bg-[#0c0519]/90 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-2.5 sm:gap-x-3 gap-y-2.5 px-3 py-2.5 sm:px-5 sm:py-3">
        {/* Brand Emblem — clicking refreshes the page */}
        <button
          type="button"
          onClick={handleBrandRefresh}
          aria-label="Refresh da7ee7-biology"
          title="Refresh da7ee7-biology"
          className="order-1 flex min-w-0 items-center gap-2 sm:gap-2.5 rounded-xl px-1 py-0.5 text-left transition hover:opacity-90 active:scale-[0.98]"
        >
          <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-[11px] sm:rounded-xl border border-orange-200/90 bg-orange-50 text-[#ea580c] shadow-sm shadow-orange-500/10 dark:border-[1.5px] dark:border-[#b366ff] dark:bg-[radial-gradient(circle_at_50%_20%,#7e22ce_0%,#581c87_58%,#3b0764_100%)] dark:text-white dark:ring-1 dark:ring-purple-300/35 dark:shadow-[0_0_16px_rgba(147,51,234,0.45),inset_0_1px_1px_rgba(243,232,255,0.45)]">
            <Dna className="h-4 w-4 sm:h-5 sm:w-5 dark:h-[19px] dark:w-[19px] sm:dark:h-[22px] sm:dark:w-[22px] dark:stroke-[2.35] dark:drop-shadow-[0_2px_4px_rgba(15,4,35,0.65)]" />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-sm sm:text-base font-bold tracking-tight text-stone-900 dark:text-white">
                da7ee7-biology
              </span>
              <span className="inline-flex shrink-0 items-center rounded-md border border-stone-200 dark:border-purple-400/30 bg-stone-100 dark:bg-purple-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-stone-600 dark:text-purple-200">
                0610
              </span>
            </span>
            <span className="block truncate text-[11px] sm:text-xs text-stone-500 dark:text-purple-300/75">
              Cambridge IGCSE Biology
            </span>
          </span>
        </button>

        {/* Right Action Controls — balanced utility strip on Phone, top-right on Tablet & Laptop */}
        <div className="order-2 lg:order-3 flex w-full sm:w-auto shrink-0 items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onNewQuestion}
            aria-label="New Question"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 dark:border-purple-400/30 bg-white dark:bg-purple-500/15 px-3 sm:px-3.5 text-xs sm:text-sm font-medium text-stone-800 dark:text-purple-100 transition hover:bg-orange-50/70 hover:border-orange-200 dark:hover:bg-purple-500/25 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 shrink-0 text-[#ea580c] dark:text-fuchsia-300" />
            <span className="whitespace-nowrap">New Question</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onOpenSaved}
              aria-label={`Saved papers (${savedCount})`}
              className="relative inline-flex h-9 w-9 sm:w-auto sm:px-3 items-center justify-center gap-1.5 rounded-xl border border-stone-200 dark:border-purple-400/25 bg-white dark:bg-[#160b29] text-xs sm:text-sm font-medium text-stone-800 dark:text-purple-100 transition hover:border-stone-300 dark:hover:border-purple-400/45 hover:bg-stone-50 dark:hover:bg-[#1e1036] active:scale-[0.98]"
            >
              <FolderOpen className="h-4 w-4 shrink-0 text-stone-600 dark:text-purple-200" />
              <span className="hidden xl:inline whitespace-nowrap">Saved</span>
              {savedCount > 0 && (
                <span className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#ea580c] dark:bg-fuchsia-500 px-1 text-[10px] font-bold text-white">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Theme Switcher — reachable across Phone, Tablet & Laptop */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="inline-flex h-9 w-9 xl:w-auto xl:px-3 items-center justify-center gap-1.5 rounded-xl border border-stone-200 dark:border-purple-400/25 bg-white dark:bg-[#160b29] text-xs font-medium text-stone-800 dark:text-purple-100 transition hover:border-orange-300 dark:hover:border-fuchsia-400/60 hover:bg-orange-50/60 dark:hover:bg-[#1e1036] active:scale-[0.97]"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 shrink-0 text-amber-300" />
              ) : (
                <Moon className="h-4 w-4 shrink-0 text-stone-700" />
              )}
              <span className="hidden xl:inline whitespace-nowrap">
                {theme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenSignIn}
              aria-label={user ? `Account ${user.name}` : 'Sign In'}
              className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-2.5 sm:px-3.5 text-xs sm:text-sm font-medium transition active:scale-[0.98] ${
                userIsAdmin
                  ? 'border-emerald-400/60 dark:border-emerald-400/45 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-500/25'
                  : user
                    ? 'border-orange-200 dark:border-fuchsia-400/35 bg-orange-50 dark:bg-fuchsia-500/15 text-orange-950 dark:text-fuchsia-100 hover:bg-orange-100 dark:hover:bg-fuchsia-500/25'
                    : 'border-stone-200 dark:border-purple-400/30 bg-white dark:bg-[#160b29] text-stone-800 dark:text-purple-100 hover:border-orange-300 dark:hover:border-fuchsia-400/60 hover:bg-orange-50/60 dark:hover:bg-[#1e1036]'
              }`}
            >
              {userIsAdmin ? (
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
              ) : user ? (
                <UserIcon className="h-4 w-4 shrink-0 text-[#ea580c] dark:text-fuchsia-300" />
              ) : (
                <LogIn className="h-4 w-4 shrink-0 text-stone-600 dark:text-purple-200" />
              )}
              <span className="max-w-[74px] sm:max-w-[116px] truncate whitespace-nowrap">
                {user ? (userIsAdmin ? 'Admin' : user.name.split(' ')[0]) : 'Sign In'}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs — Always visible, full-width on Phone & Tablet, centered inline on Laptop */}
        <nav
          aria-label="Primary workspace navigation"
          className="order-3 w-full lg:order-2 lg:w-auto flex items-center rounded-2xl border border-stone-200 dark:border-purple-500/25 bg-stone-100/90 dark:bg-[#120824] p-1 shadow-inner shadow-stone-900/5 dark:shadow-black/40"
        >
          <button
            type="button"
            onClick={() => onSelectTab('checking')}
            aria-pressed={activeTab === 'checking'}
            className={`relative flex-1 lg:flex-none inline-flex h-9 sm:h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'checking'
                ? 'text-white'
                : 'text-stone-600 dark:text-purple-200/75 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {activeTab === 'checking' && (
              <motion.span
                layoutId="active-nav-tab"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#f97316] dark:from-fuchsia-500 dark:to-purple-600 shadow-lg shadow-orange-500/25 dark:shadow-fuchsia-500/30"
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5 whitespace-nowrap">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Checking Questions</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('tutor')}
            aria-pressed={activeTab === 'tutor'}
            className={`relative flex-1 lg:flex-none inline-flex h-9 sm:h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'tutor'
                ? 'text-white'
                : 'text-stone-600 dark:text-purple-200/75 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {activeTab === 'tutor' && (
              <motion.span
                layoutId="active-nav-tab"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#f97316] dark:from-fuchsia-500 dark:to-purple-600 shadow-lg shadow-orange-500/25 dark:shadow-fuchsia-500/30"
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5 whitespace-nowrap">
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span>Chat Bot</span>
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
