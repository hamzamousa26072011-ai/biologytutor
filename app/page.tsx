'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { CheckingQuestionsTab } from '@/components/CheckingQuestionsTab';
import { TutorChatTab } from '@/components/TutorChatTab';
import { SignInModal, SavedPapersModal } from '@/components/Modals';
import {
  ChatMessage,
  GradingResult,
  MAX_DAILY_QUESTIONS,
  PageItem,
  SavedPaper,
  StudentUser,
  canUserGradeQuestion,
  getDailyQuestionsUsed,
  incrementDailyQuestionUsage,
} from '@/lib/marking-engine';

export default function BiologyTutorPage() {
  // Theme state (Dark Default = DesignWave Cosmic Aesthetic; Light = Warm Academic Ivory & Terracotta)
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState<'check' | 'chat'>('check');

  // Student Sign-In, Daily Quota & Saved Papers state
  const [user, setUser] = useState<StudentUser | null>(null);
  const [dailyUsageMap, setDailyUsageMap] = useState<Record<string, number>>(
    {}
  );
  const [savedPapers, setSavedPapers] = useState<SavedPaper[]>([]);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSavedPapersOpen, setIsSavedPapersOpen] = useState(false);

  // Tab 1: Checking Questions state
  const [studentPages, setStudentPages] = useState<PageItem[]>([]);
  const [markSchemePages, setMarkSchemePages] = useState<PageItem[]>([]);
  const [studentManualText, setStudentManualText] = useState('');
  const [markSchemeManualText, setMarkSchemeManualText] = useState('');
  const [questionPromptText, setQuestionPromptText] = useState('');
  const [showStudentTextBox, setShowStudentTextBox] = useState(false);
  const [showMarkSchemeTextBox, setShowMarkSchemeTextBox] = useState(false);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(
    null
  );
  const [isGrading, setIsGrading] = useState(false);

  // In-Tab Question Examiner Chat state (Check Tab Only)
  const [examinerMessages, setExaminerMessages] = useState<ChatMessage[]>([]);
  const [isExaminerTyping, setIsExaminerTyping] = useState(false);

  // Tab 2: AI Biology Tutor Chat state
  const [tutorMessages, setTutorMessages] = useState<ChatMessage[]>([]);
  const [isTutorTyping, setIsTutorTyping] = useState(false);

  // Load persisted theme, student user, daily usage, and saved papers from localStorage
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedTheme = localStorage.getItem('biology-tutor-theme');
        if (savedTheme === 'light') {
          setIsDark(false);
          document.documentElement.classList.remove('dark');
        } else {
          setIsDark(true);
          document.documentElement.classList.add('dark');
        }

        const savedUserRaw = localStorage.getItem('biology-tutor-user');
        if (savedUserRaw) {
          setUser(JSON.parse(savedUserRaw));
        }

        const savedUsageRaw = localStorage.getItem('biology-tutor-daily-usage');
        if (savedUsageRaw) {
          setDailyUsageMap(JSON.parse(savedUsageRaw));
        }

        const savedPapersRaw = localStorage.getItem(
          'biology-tutor-saved-papers'
        );
        if (savedPapersRaw) {
          setSavedPapers(JSON.parse(savedPapersRaw));
        }
      } catch {
        // Ignore storage access errors
      }
    });
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    try {
      localStorage.setItem('biology-tutor-theme', nextDark ? 'dark' : 'light');
      if (nextDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // Ignore
    }
  };

  const handleSignIn = (newUser: StudentUser) => {
    setUser(newUser);
    try {
      localStorage.setItem('biology-tutor-user', JSON.stringify(newUser));
    } catch {
      // Ignore
    }
  };

  const handleQuickGoogleSignIn = () => {
    const googleUser: StudentUser = {
      email: 'hamzamousa26072011@gmail.com',
      name: 'Hamza Mousa',
      provider: 'google',
    };
    handleSignIn(googleUser);
  };

  const handleSignOut = () => {
    setUser(null);
    try {
      localStorage.removeItem('biology-tutor-user');
    } catch {
      // Ignore
    }
  };

  // Context-Aware Action Button handler (+ New Question on Check tab; + New Chat on Chat tab)
  const handleNewContextAction = () => {
    if (activeTab === 'check') {
      setStudentPages([]);
      setMarkSchemePages([]);
      setStudentManualText('');
      setMarkSchemeManualText('');
      setQuestionPromptText('');
      setShowStudentTextBox(false);
      setShowMarkSchemeTextBox(false);
      setGradingResult(null);
      setExaminerMessages([]);
    } else {
      setTutorMessages([]);
    }
  };

  // Combine background OCR text + manual text for grading
  const getCombinedStudentAnswer = () => {
    const ocrJoined = studentPages
      .map((p) => p.ocrText)
      .filter(Boolean)
      .join('\n');
    return [ocrJoined, studentManualText].filter(Boolean).join('\n').trim();
  };

  const getCombinedMarkScheme = () => {
    const ocrJoined = markSchemePages
      .map((p) => p.ocrText)
      .filter(Boolean)
      .join('\n');
    return [ocrJoined, markSchemeManualText].filter(Boolean).join('\n').trim();
  };

  // Grade Question handler (Enforces Sign-In & 10 Questions/Day Per User)
  const handleGradeSubmission = async () => {
    if (!user) {
      setIsSignInOpen(true);
      return;
    }

    const quotaCheck = canUserGradeQuestion(dailyUsageMap, user.email);
    if (!quotaCheck.allowed) {
      return;
    }

    const combinedStudent = getCombinedStudentAnswer();
    const combinedScheme = getCombinedMarkScheme();

    setIsGrading(true);
    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAnswer: combinedStudent,
          markScheme: combinedScheme,
          questionPrompt: questionPromptText,
          studentPages: studentPages.map((p) => ({
            dataUrl: p.dataUrl,
            mimeType: p.mimeType,
          })),
          markSchemePages: markSchemePages.map((p) => ({
            dataUrl: p.dataUrl,
            mimeType: p.mimeType,
          })),
        }),
      });

      const resultData: GradingResult = await res.json();
      setGradingResult(resultData);

      // Increment user's daily question count (max 10 per day)
      setDailyUsageMap((prev) => {
        const updated = incrementDailyQuestionUsage(prev, user.email);
        try {
          localStorage.setItem(
            'biology-tutor-daily-usage',
            JSON.stringify(updated)
          );
        } catch {
          // Ignore
        }
        return updated;
      });

      // Initialize the In-Tab Question Examiner Chat with a helpful summary message (without letter grade)
      setExaminerMessages([
        {
          id: `examiner-init-${Date.now()}`,
          role: 'assistant',
          content: `### Question Graded: ${resultData.questionTitle}
- You scored **${resultData.awardedMarks} / ${resultData.totalMarks} marks** (**${resultData.percentage}%**).
- Ask me anything below about why specific marks were awarded or lost, whether alternative wording would be accepted, or how the **Cambridge 0610 Marking Principles** apply to your answer.`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);

      // Automatically save to student's account history in localStorage
      const newPaper: SavedPaper = {
        id: `paper-${Date.now()}`,
        title: resultData.questionTitle || 'Cambridge 0610 Graded Question',
        createdAt: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        studentEmail: user.email,
        studentAnswerText:
          resultData.transcribedStudentAnswer || combinedStudent,
        markSchemeText: resultData.transcribedMarkScheme || combinedScheme,
        questionPrompt: questionPromptText,
        result: resultData,
      };

      setSavedPapers((prev) => {
        const updated = [newPaper, ...prev];
        try {
          localStorage.setItem(
            'biology-tutor-saved-papers',
            JSON.stringify(updated)
          );
        } catch {
          // Ignore
        }
        return updated;
      });
    } catch (error) {
      console.error('Failed to grade submission:', error);
    } finally {
      setIsGrading(false);
    }
  };

  // Load a saved paper back into the Checker
  const handleLoadSavedPaper = (paper: SavedPaper) => {
    setActiveTab('check');
    setStudentPages([]);
    setMarkSchemePages([]);
    setStudentManualText(paper.studentAnswerText);
    setMarkSchemeManualText(paper.markSchemeText);
    setQuestionPromptText(paper.questionPrompt || '');
    setShowStudentTextBox(Boolean(paper.studentAnswerText));
    setShowMarkSchemeTextBox(Boolean(paper.markSchemeText));
    setGradingResult(paper.result);
    setExaminerMessages([
      {
        id: `examiner-restored-${Date.now()}`,
        role: 'assistant',
        content: `### Restored Submission: ${paper.title}\n- Score: **${paper.result.awardedMarks} / ${paper.result.totalMarks} marks** (**${paper.result.percentage}%**). Ask any follow-up question below.`,
        timestamp: 'Restored',
      },
    ]);
  };

  const handleDeleteSavedPaper = (id: string) => {
    setSavedPapers((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(
          'biology-tutor-saved-papers',
          JSON.stringify(updated)
        );
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  // In-Tab Question Examiner Chat message handler
  const handleSendExaminerMessage = async (question: string) => {
    if (!gradingResult) return;
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: ChatMessage = {
      id: `examiner-u-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: nowTime,
    };

    const nextHistory = [...examinerMessages, userMsg];
    setExaminerMessages(nextHistory);
    setIsExaminerTyping(true);

    try {
      const res = await fetch('/api/examiner-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          result: gradingResult,
          studentAnswer:
            gradingResult.transcribedStudentAnswer ||
            getCombinedStudentAnswer(),
          markScheme:
            gradingResult.transcribedMarkScheme || getCombinedMarkScheme(),
          history: nextHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      setExaminerMessages((prev) => [
        ...prev,
        {
          id: `examiner-a-${Date.now()}`,
          role: 'assistant',
          content:
            data.reply ||
            'Review the underlined keywords in the official Cambridge 0610 mark scheme above.',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    } catch {
      setExaminerMessages((prev) => [
        ...prev,
        {
          id: `examiner-err-${Date.now()}`,
          role: 'assistant',
          content:
            '### Cambridge Examiner Note\n- Ensure all required **Cambridge 0610 keywords** from the rubric are included in context.',
          timestamp: nowTime,
        },
      ]);
    } finally {
      setIsExaminerTyping(false);
    }
  };

  const handleResetExaminerChat = () => {
    if (!gradingResult) {
      setExaminerMessages([]);
      return;
    }
    setExaminerMessages([
      {
        id: `examiner-reset-${Date.now()}`,
        role: 'assistant',
        content: `### Question Examiner Chat Reset\n- Ready to discuss **${gradingResult.questionTitle}** (**${gradingResult.awardedMarks}/${gradingResult.totalMarks} m**). Ask your question below.`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  };

  // Tab 2: AI Biology Tutor Chat message handler
  const handleSendTutorMessage = async (
    message: string,
    imageAttachment?: { dataUrl: string; mimeType: string }
  ) => {
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: ChatMessage = {
      id: `tutor-u-${Date.now()}`,
      role: 'user',
      content: message || 'Attached picture',
      imageUrl: imageAttachment?.dataUrl,
      timestamp: nowTime,
    };

    const updatedHistory = [...tutorMessages, userMsg];
    setTutorMessages(updatedHistory);
    setIsTutorTyping(true);

    try {
      const [res] = await Promise.all([
        fetch('/api/tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message || 'Explain this biology question or diagram.',
            imageDataUrl: imageAttachment?.dataUrl,
            imageMimeType: imageAttachment?.mimeType,
            history: updatedHistory.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }),
        new Promise((resolve) => setTimeout(resolve, 1400)),
      ]);
      const data = await res.json();
      setTutorMessages((prev) => [
        ...prev,
        {
          id: `tutor-a-${Date.now()}`,
          role: 'assistant',
          content: data.reply || 'Unable to retrieve syllabus notes response.',
          thought: data.thought || undefined,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    } catch {
      setTutorMessages((prev) => [
        ...prev,
        {
          id: `tutor-err-${Date.now()}`,
          role: 'assistant',
          content:
            '### Connection Notice\n- Please try asking your **Cambridge IGCSE Biology (0610)** question again.',
          timestamp: nowTime,
        },
      ]);
    } finally {
      setIsTutorTyping(false);
    }
  };

  const userSavedPapers = user
    ? savedPapers.filter((p) => p.studentEmail === user.email)
    : savedPapers;
  const dailyUsedCount = getDailyQuestionsUsed(dailyUsageMap, user?.email);

  return (
    <div
      className={`relative min-h-dvh w-full overflow-x-hidden transition-colors duration-300 ${
        isDark ? 'bg-[#06050b] text-white' : 'bg-[#F8F6F1] text-[#1C1917]'
      }`}
    >
      {/* Ambient Theme Background Layers */}
      {isDark ? (
        /* DesignWave Cosmic Aesthetic: Cyber Wireframe Grid + Glowing Purple/Violet Ambient Orbs & Rings */
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-[130px]" />
          <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-fuchsia-600/15 blur-[140px]" />
          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-violet-700/20 blur-[120px]" />
          {/* Ambient Orbital Rings */}
          <div className="absolute top-24 left-1/2 h-[540px] w-[540px] -translate-x-1/2 rounded-full border border-purple-500/10" />
          <div className="absolute top-12 left-1/2 h-[760px] w-[760px] -translate-x-1/2 rounded-full border border-fuchsia-500/10" />
          {/* Cyber Perspective Wireframe Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,92,246,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.07)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
      ) : (
        /* Light Theme: Warm Academic Ivory & Subtle Dot-Matrix Pattern */
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#D6CFC2_1px,transparent_1px)] [background-size:20px_20px] opacity-65" />
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex min-h-dvh flex-col">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onNewAction={handleNewContextAction}
          onOpenSignIn={() => setIsSignInOpen(true)}
          onOpenSavedPapers={() => setIsSavedPapersOpen(true)}
          savedCount={userSavedPapers.length}
          user={user}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
        />

        <main className="flex-1">
          {activeTab === 'check' ? (
            <CheckingQuestionsTab
              studentPages={studentPages}
              setStudentPages={setStudentPages}
              markSchemePages={markSchemePages}
              setMarkSchemePages={setMarkSchemePages}
              studentManualText={studentManualText}
              setStudentManualText={setStudentManualText}
              markSchemeManualText={markSchemeManualText}
              setMarkSchemeManualText={setMarkSchemeManualText}
              questionPromptText={questionPromptText}
              setQuestionPromptText={setQuestionPromptText}
              showStudentTextBox={showStudentTextBox}
              setShowStudentTextBox={setShowStudentTextBox}
              showMarkSchemeTextBox={showMarkSchemeTextBox}
              setShowMarkSchemeTextBox={setShowMarkSchemeTextBox}
              gradingResult={gradingResult}
              isGrading={isGrading}
              onGradeSubmission={handleGradeSubmission}
              examinerMessages={examinerMessages}
              onSendExaminerMessage={handleSendExaminerMessage}
              onResetExaminerChat={handleResetExaminerChat}
              isExaminerTyping={isExaminerTyping}
              user={user}
              onOpenSignIn={() => setIsSignInOpen(true)}
              onQuickGoogleSignIn={handleQuickGoogleSignIn}
              dailyUsedCount={dailyUsedCount}
              maxDailyQuestions={MAX_DAILY_QUESTIONS}
              isDark={isDark}
            />
          ) : (
            <TutorChatTab
              messages={tutorMessages}
              onSendMessage={handleSendTutorMessage}
              onResetChat={handleNewContextAction}
              isTyping={isTutorTyping}
              isDark={isDark}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <SignInModal
        key={user?.email || 'guest'}
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        dailyUsedCount={dailyUsedCount}
        isDark={isDark}
      />

      <SavedPapersModal
        isOpen={isSavedPapersOpen}
        onClose={() => setIsSavedPapersOpen(false)}
        papers={userSavedPapers}
        onLoadPaper={handleLoadSavedPaper}
        onDeletePaper={handleDeleteSavedPaper}
        isDark={isDark}
      />
    </div>
  );
}
