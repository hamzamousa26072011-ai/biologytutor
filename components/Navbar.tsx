'use client';

import React from 'react';
import {
  Dna,
  CheckCircle2,
  MessageSquareText,
  Plus,
  FolderArchive,
  UserCheck,
  LogIn,
  Sun,
  Moon,
} from 'lucide-react';
import { StudentUser } from '@/lib/marking-engine';

interface NavbarProps {
  activeTab: 'check' | 'chat';
  setActiveTab: (tab: 'check' | 'chat') => void;
  onNewAction: () => void;
  onOpenSignIn: () => void;
  onOpenSavedPapers: () => void;
  savedCount: number;
  user: StudentUser | null;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  onNewAction,
  onOpenSignIn,
  onOpenSavedPapers,
  savedCount,
  user,
  isDark,
  onToggleTheme,
}: NavbarProps) {
  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-xl transition-colors duration-200 ${
        isDark
          ? 'border-b border-purple-500/25 bg-[#06050b]/85 text-white'
          : 'border-b border-[#E7E0D6] bg-[#FFFFFF]/90 text-[#1C1917]'
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-2.5 py-2 sm:flex-nowrap sm:px-6 sm:py-3">
        {/* Brand Header */}
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border transition-all ${
              isDark
                ? 'border-purple-400/40 bg-gradient-to-br from-purple-600/40 to-fuchsia-600/30 text-purple-200 shadow-[0_0_18px_rgba(168,85,247,0.35)]'
                : 'border-[#C85A32]/30 bg-[#C85A32]/10 text-[#9C3814]'
            }`}
          >
            <Dna className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="truncate text-xs font-extrabold tracking-tight sm:text-base">
                BIOLOGY TUTOR
              </span>
              <span
                className={`hidden items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase sm:inline-flex ${
                  isDark
                    ? 'border border-purple-400/35 bg-purple-950/70 text-purple-200'
                    : 'border border-[#2D6A4F]/25 bg-[#EAF2EC] text-[#2D6A4F]'
                }`}
              >
                Cambridge Standards • 0610
              </span>
            </div>
            <span
              className={`truncate text-[9px] font-medium sm:hidden ${
                isDark ? 'text-purple-300/80' : 'text-[#2D6A4F]'
              }`}
            >
              Cambridge Standards • 0610
            </span>
          </div>
        </div>

        {/* Center Main Navigation Tabs */}
        <nav
          aria-label="Main Navigation"
          className={`flex items-center rounded-xl p-1 ${
            isDark
              ? 'border border-purple-500/25 bg-[#0e0b18]/90'
              : 'border border-[#E7E0D6] bg-[#F8F6F1]'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('check')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all sm:px-3.5 sm:text-sm ${
              activeTab === 'check'
                ? isDark
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_14px_rgba(168,85,247,0.45)]'
                  : 'bg-[#C85A32] text-white shadow-xs'
                : isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Checking Questions</span>
            <span className="sm:hidden">Check</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all sm:px-3.5 sm:text-sm ${
              activeTab === 'chat'
                ? isDark
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_14px_rgba(168,85,247,0.45)]'
                  : 'bg-[#C85A32] text-white shadow-xs'
                : isDark
                ? 'text-slate-300 hover:text-white'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            <MessageSquareText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Chat Bot</span>
            <span className="sm:hidden">Chat</span>
          </button>
        </nav>

        {/* Right Controls: Context-Aware Action Button + Saved Papers + Sign In + Theme Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Context-Aware Action Button */}
          <button
            type="button"
            onClick={onNewAction}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all sm:px-3 ${
              isDark
                ? 'border border-purple-400/40 bg-purple-950/60 text-purple-200 hover:bg-purple-900/70'
                : 'border border-[#C85A32]/35 bg-[#C85A32]/10 text-[#9C3814] hover:bg-[#C85A32]/20'
            }`}
            title={
              activeTab === 'check'
                ? 'Clear current inputs, pages, and results for a new question'
                : 'Start a fresh Biology Tutor conversation'
            }
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden md:inline">
              {activeTab === 'check' ? 'New Question' : 'New Chat'}
            </span>
            <span className="md:hidden">
              {activeTab === 'check' ? 'New Q' : 'Reset'}
            </span>
          </button>

          {/* Saved Papers Modal Trigger */}
          <button
            type="button"
            onClick={onOpenSavedPapers}
            className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              isDark
                ? 'border border-purple-500/25 bg-[#0e0b18]/80 text-slate-200 hover:border-purple-400/50 hover:text-white'
                : 'border border-[#E7E0D6] bg-white text-[#1C1917] hover:bg-[#F8F6F1]'
            }`}
            title="View Saved Graded Papers"
          >
            <FolderArchive className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Saved Papers</span>
            {savedCount > 0 && (
              <span
                className={`rounded-md px-1.5 py-0.2 font-mono text-[10px] font-bold ${
                  isDark
                    ? 'bg-fuchsia-500/30 text-fuchsia-200'
                    : 'bg-[#EAF2EC] text-[#2D6A4F]'
                }`}
              >
                {savedCount}
              </span>
            )}
          </button>

          {/* Student Sign-In Button */}
          <button
            type="button"
            onClick={onOpenSignIn}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              user
                ? isDark
                  ? 'border border-emerald-500/40 bg-emerald-950/50 text-emerald-200'
                  : 'border border-[#2D6A4F]/30 bg-[#EAF2EC] text-[#2D6A4F]'
                : isDark
                ? 'border border-purple-500/30 bg-[#0e0b18]/80 text-slate-200 hover:border-purple-400/50'
                : 'border border-[#E7E0D6] bg-white text-[#1C1917] hover:bg-[#F8F6F1]'
            }`}
          >
            {user ? (
              <>
                <UserCheck className="h-3.5 w-3.5" />
                <span className="hidden max-w-[100px] truncate sm:inline">
                  {user.name || user.email.split('@')[0]}
                </span>
              </>
            ) : (
              <>
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </>
            )}
          </button>

          {/* 1-Click Sun/Moon Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
              isDark
                ? 'border-purple-500/30 bg-[#0e0b18]/90 text-amber-300 hover:border-purple-400/60 hover:bg-purple-950/60'
                : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#9C3814] hover:bg-[#EFECE6]'
            }`}
            title={
              isDark
                ? 'Switch to Warm Academic Ivory Light Theme'
                : 'Switch to DesignWave Cosmic Dark Theme'
            }
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
