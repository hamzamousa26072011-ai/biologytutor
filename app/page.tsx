'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Navbar, { ActiveTab, AppUser, ThemeMode } from '@/components/Navbar';
import CheckingQuestionsTab from '@/components/CheckingQuestionsTab';
import TutorChatTab from '@/components/TutorChatTab';
import { SavedPaperItem, SavedPapersModal, SignInModal } from '@/components/Modals';
import { GradingResult, getTodayDateKey } from '@/lib/marking-engine';
import {
  StoredAccountSummary,
  deletePaperFromFirebase,
  fetchSavedPapersFromFirebase,
  loadActiveLocalSession,
  loadLocalUsageMap,
  loadSavedAccounts,
  rememberSignedInAccount,
  removeSavedAccount,
  saveLocalUsageMap,
  savePaperToFirebase,
  signInWithFirebaseGooglePopup,
  signOutFromFirebase,
  subscribeToFirebaseAuth,
  syncFirebaseUserProfile,
  testFirestoreConnection,
  updateFirebaseDailyUsage,
} from '@/lib/firebase';

const SAVED_PAPERS_STORAGE_KEY = 'da7ee7_biology_saved_papers_v1';
const THEME_STORAGE_KEY = 'da7ee7_biology_theme_v1';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('checking');
  const [hasSwitchedTab, setHasSwitchedTab] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [theme, setTheme] = useState<ThemeMode>('dark');

  const [user, setUser] = useState<AppUser | null>(null);
  const [savedAccounts, setSavedAccounts] = useState<StoredAccountSummary[]>([]);
  const [usageByEmailDate, setUsageByEmailDate] = useState<Record<string, number>>({});
  const [savedPapers, setSavedPapers] = useState<SavedPaperItem[]>([]);

  const [signInOpen, setSignInOpen] = useState(false);
  const [signInReason, setSignInReason] = useState<string | null>(null);
  const [savedOpen, setSavedOpen] = useState(false);

  // Restore saved accounts, local session, local usage, and saved papers cleanly on client mount
  useEffect(() => {
    const hydrateTimer = window.setTimeout(() => {
      setSavedAccounts(loadSavedAccounts());
      setUsageByEmailDate(loadLocalUsageMap());

      const activeLocal = loadActiveLocalSession();
      if (activeLocal) {
        setUser(activeLocal);
      }

      try {
        const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setTheme(storedTheme);
        }
      } catch {
        // Ignore storage error
      }

      try {
        const rawPapers = window.localStorage.getItem(SAVED_PAPERS_STORAGE_KEY);
        if (rawPapers) {
          const parsed = JSON.parse(rawPapers);
          if (Array.isArray(parsed)) {
            setSavedPapers(parsed);
          }
        }
      } catch {
        // Ignore storage error
      }
    }, 0);

    void testFirestoreConnection();
    fetch('/api/tutor', { method: 'GET' }).catch(() => {});

    const unsubscribe = subscribeToFirebaseAuth(async (fbUser) => {
      if (fbUser && fbUser.email) {
        const syncedUser: AppUser = {
          uid: fbUser.uid,
          email: fbUser.email.trim().toLowerCase(),
          name: fbUser.displayName?.trim() || fbUser.email.split('@')[0] || 'Student',
          provider: 'google',
        };
        setUser(syncedUser);
        rememberSignedInAccount(syncedUser);
        setSavedAccounts(loadSavedAccounts());

        const remoteUsage = await syncFirebaseUserProfile(syncedUser);
        const dateKey = remoteUsage.dailyDateKey || getTodayDateKey();
        const usageKey = `${syncedUser.email}::${dateKey}`;
        setUsageByEmailDate((prev) => {
          const merged = {
            ...prev,
            [usageKey]: Math.max(prev[usageKey] ?? 0, remoteUsage.dailyUsedCount ?? 0),
          };
          saveLocalUsageMap(merged);
          return merged;
        });

        const remotePapers = await fetchSavedPapersFromFirebase(fbUser.uid);
        if (remotePapers.length > 0) {
          setSavedPapers(
            remotePapers.map((p) => ({
              id: p.id,
              title: p.title,
              awardedMarks: p.awardedMarks,
              totalMarks: p.totalMarks,
              percentage: p.percentage,
              examinerSummary: p.examinerSummary,
              correctedVersion: p.correctedVersion,
              createdAtLabel: new Date(p.createdAtMs).toLocaleDateString(),
            }))
          );
        }
      }
    });

    return () => {
      window.clearTimeout(hydrateTimer);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
  }, [theme]);

  const handleToggleTheme = () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore storage error
    }
  };

  const handleSelectTab = (tab: ActiveTab) => {
    if (tab !== activeTab) {
      setHasSwitchedTab(true);
      setActiveTab(tab);
    }
  };

  const handleNewQuestion = () => {
    setHasSwitchedTab(true);
    setActiveTab('checking');
    setResetSignal((n) => n + 1);
  };

  const handleRequireSignIn = (reason: string) => {
    setSignInReason(reason);
    setSignInOpen(true);
  };

  const handleGoogleSignIn = async () => {
    const profile = await signInWithFirebaseGooglePopup();
    setUser(profile);
    setSavedAccounts(loadSavedAccounts());
  };

  const handleEmailSignIn = async (email: string, name: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const uid = `email_${cleanEmail.replace(/[^a-z0-9]/g, '_').slice(0, 64)}`;
    const nextUser: AppUser = {
      uid,
      email: cleanEmail,
      name: name.trim() || cleanEmail.split('@')[0] || 'Student',
      provider: 'email',
    };
    setUser(nextUser);
    rememberSignedInAccount(nextUser);
    setSavedAccounts(loadSavedAccounts());
  };

  const handleSignOut = async () => {
    await signOutFromFirebase();
    setUser(null);
  };

  const handleRemoveSavedAccount = (email: string) => {
    setSavedAccounts(removeSavedAccount(email));
  };

  const handleConsumeDailyQuestion = (userEmail: string, isAdmin: boolean): number => {
    const today = getTodayDateKey();
    const normalizedEmail = userEmail.trim().toLowerCase();
    const key = `${normalizedEmail}::${today}`;
    const currentUsed = Math.max(0, Math.floor(usageByEmailDate[key] ?? 0));
    const nextUsed = currentUsed + 1;

    const nextMap = { ...usageByEmailDate, [key]: nextUsed };
    setUsageByEmailDate(nextMap);
    saveLocalUsageMap(nextMap);

    if (user) {
      void updateFirebaseDailyUsage(user.uid, normalizedEmail, today, nextUsed);
    }

    if (isAdmin) {
      return Infinity;
    }
    return Math.max(0, 10 - nextUsed);
  };

  const handleSavePaper = async (title: string, gradingResult: GradingResult) => {
    const localId = `paper-${Date.now()}`;
    let storedId = localId;

    if (user && user.provider === 'google') {
      const fbId = await savePaperToFirebase(user.uid, title, gradingResult);
      if (fbId) storedId = fbId;
    }

    const newItem: SavedPaperItem = {
      id: storedId,
      title,
      awardedMarks: gradingResult.awardedMarks,
      totalMarks: gradingResult.totalMarks,
      percentage: gradingResult.percentage,
      examinerSummary: gradingResult.examinerSummary,
      correctedVersion: gradingResult.correctedVersion,
      createdAtLabel: new Date().toLocaleDateString(),
    };

    setSavedPapers((prev) => {
      const next = [newItem, ...prev].slice(0, 30);
      try {
        window.localStorage.setItem(SAVED_PAPERS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  };

  const handleDeletePaper = (id: string) => {
    if (user && user.provider === 'google') {
      void deletePaperFromFirebase(user.uid, id);
    }
    setSavedPapers((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        window.localStorage.setItem(SAVED_PAPERS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onNewQuestion={handleNewQuestion}
        onOpenSaved={() => setSavedOpen(true)}
        savedCount={savedPapers.length}
        user={user}
        onOpenSignIn={() => {
          setSignInReason(null);
          setSignInOpen(true);
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-3 py-4 sm:px-5 sm:py-6">
        {activeTab === 'checking' ? (
          <motion.div
            key="checking-view"
            initial={hasSwitchedTab ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex flex-1 flex-col"
          >
            <CheckingQuestionsTab
              key={resetSignal}
              user={user}
              usageByEmailDate={usageByEmailDate}
              onRequireSignIn={handleRequireSignIn}
              onConsumeDailyQuestion={handleConsumeDailyQuestion}
              onSavePaper={handleSavePaper}
            />
          </motion.div>
        ) : (
          <motion.div
            key="tutor-view"
            initial={hasSwitchedTab ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex flex-1 min-h-0 flex-col"
          >
            <TutorChatTab />
          </motion.div>
        )}
      </main>

      <SignInModal
        isOpen={signInOpen}
        onClose={() => setSignInOpen(false)}
        user={user}
        reasonMessage={signInReason}
        savedAccounts={savedAccounts}
        usageByEmailDate={usageByEmailDate}
        onGoogleSignIn={handleGoogleSignIn}
        onEmailSignIn={handleEmailSignIn}
        onSignOut={handleSignOut}
        onRemoveSavedAccount={handleRemoveSavedAccount}
      />

      <SavedPapersModal
        isOpen={savedOpen}
        onClose={() => setSavedOpen(false)}
        papers={savedPapers}
        onDeletePaper={handleDeletePaper}
      />
    </div>
  );
}
