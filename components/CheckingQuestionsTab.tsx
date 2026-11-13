'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Check,
  X,
  Copy,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Send,
  RotateCcw,
  Loader2,
  ShieldCheck,
  Award,
  Keyboard,
  Lock,
  LogIn,
  Chrome,
} from 'lucide-react';
import {
  ChatMessage,
  GradingResult,
  PageItem,
  StudentUser,
} from '@/lib/marking-engine';
import { FormattedContent } from './FormattedContent';

interface CheckingQuestionsTabProps {
  studentPages: PageItem[];
  setStudentPages: React.Dispatch<React.SetStateAction<PageItem[]>>;
  markSchemePages: PageItem[];
  setMarkSchemePages: React.Dispatch<React.SetStateAction<PageItem[]>>;
  studentManualText: string;
  setStudentManualText: (val: string) => void;
  markSchemeManualText: string;
  setMarkSchemeManualText: (val: string) => void;
  questionPromptText: string;
  setQuestionPromptText: (val: string) => void;
  showStudentTextBox: boolean;
  setShowStudentTextBox: (val: boolean) => void;
  showMarkSchemeTextBox: boolean;
  setShowMarkSchemeTextBox: (val: boolean) => void;
  gradingResult: GradingResult | null;
  isGrading: boolean;
  onGradeSubmission: () => void;
  examinerMessages: ChatMessage[];
  onSendExaminerMessage: (question: string) => void;
  onResetExaminerChat: () => void;
  isExaminerTyping: boolean;
  user: StudentUser | null;
  onOpenSignIn: () => void;
  onQuickGoogleSignIn: () => void;
  dailyUsedCount: number;
  maxDailyQuestions: number;
  isDark: boolean;
}

/**
 * Enhances uploaded exam images on the client using an offscreen canvas
 * to boost handwriting/table contrast and preserve high resolution for OCR.
 */
async function enhanceImageForOcr(
  file: File
): Promise<{ dataUrl: string; mimeType: string }> {
  const rawDataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });

  if (!file.type.startsWith('image/')) {
    return { dataUrl: rawDataUrl, mimeType: file.type || 'application/pdf' };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const maxDim = 2200;
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: rawDataUrl, mimeType: file.type || 'image/jpeg' });
          return;
        }

        // Fill white background for transparent PNGs and boost contrast for faint pencil/pen handwriting
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.filter = 'contrast(1.18) brightness(1.02)';
        ctx.drawImage(img, 0, 0, width, height);

        const enhancedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve({ dataUrl: enhancedDataUrl, mimeType: 'image/jpeg' });
      } catch {
        resolve({ dataUrl: rawDataUrl, mimeType: file.type || 'image/jpeg' });
      }
    };
    img.onerror = () =>
      resolve({ dataUrl: rawDataUrl, mimeType: file.type || 'image/jpeg' });
    img.src = rawDataUrl;
  });
}

export function CheckingQuestionsTab({
  studentPages,
  setStudentPages,
  markSchemePages,
  setMarkSchemePages,
  studentManualText,
  setStudentManualText,
  markSchemeManualText,
  setMarkSchemeManualText,
  questionPromptText,
  setQuestionPromptText,
  showStudentTextBox,
  setShowStudentTextBox,
  showMarkSchemeTextBox,
  setShowMarkSchemeTextBox,
  gradingResult,
  isGrading,
  onGradeSubmission,
  examinerMessages,
  onSendExaminerMessage,
  onResetExaminerChat,
  isExaminerTyping,
  user,
  onOpenSignIn,
  onQuickGoogleSignIn,
  dailyUsedCount,
  maxDailyQuestions,
  isDark,
}: CheckingQuestionsTabProps) {
  const studentCameraRef = useRef<HTMLInputElement>(null);
  const studentUploadRef = useRef<HTMLInputElement>(null);
  const schemeCameraRef = useRef<HTMLInputElement>(null);
  const schemeUploadRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const examinerLastMsgRef = useRef<HTMLDivElement>(null);

  const [copiedModelAnswer, setCopiedModelAnswer] = useState(false);
  const [examinerInput, setExaminerInput] = useState('');

  const remainingQuestions = Math.max(0, maxDailyQuestions - dailyUsedCount);
  const isDailyLimitReached = Boolean(user && remainingQuestions <= 0);

  // Automatically scroll directly to the generated answer section as soon as grading finishes
  useEffect(() => {
    if (gradingResult && !isGrading) {
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [gradingResult, isGrading]);

  // Enhance uploaded pages for high-clarity OCR and start background OCR extraction immediately
  const handleFilesSelected = async (
    files: FileList | null,
    targetType: 'student' | 'markscheme'
  ) => {
    if (!files || files.length === 0) return;
    if (!user) {
      onOpenSignIn();
      return;
    }

    const setter =
      targetType === 'student' ? setStudentPages : setMarkSchemePages;

    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const id = `${targetType}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;

      const { dataUrl, mimeType } = await enhanceImageForOcr(file);

      const newPage: PageItem = {
        id,
        pageNumber: 1,
        fileName: file.name,
        mimeType,
        dataUrl,
        ocrStatus: 'processing',
        ocrText: '',
      };

      setter((prev) => {
        const updated = [...prev, newPage].map((item, idx) => ({
          ...item,
          pageNumber: idx + 1,
        }));
        return updated;
      });

      // Run background OCR immediately so transcription is pre-extracted and ready
      fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl,
          mimeType,
          targetType,
          fileName: file.name,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setter((prev) =>
            prev.map((item) =>
              item.id === id
                ? {
                    ...item,
                    ocrStatus: 'done',
                    ocrText: typeof data?.text === 'string' ? data.text : '',
                  }
                : item
            )
          );
        })
        .catch(() => {
          setter((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, ocrStatus: 'done' } : item
            )
          );
        });
    }
  };

  const handleRemovePage = (
    id: string,
    targetType: 'student' | 'markscheme'
  ) => {
    const setter =
      targetType === 'student' ? setStudentPages : setMarkSchemePages;
    setter((prev) =>
      prev
        .filter((p) => p.id !== id)
        .map((item, idx) => ({ ...item, pageNumber: idx + 1 }))
    );
  };

  const handleCopyCorrected = async () => {
    if (!gradingResult?.correctedVersion) return;
    try {
      await navigator.clipboard.writeText(gradingResult.correctedVersion);
      setCopiedModelAnswer(true);
      setTimeout(() => setCopiedModelAnswer(false), 2000);
    } catch {
      setCopiedModelAnswer(true);
      setTimeout(() => setCopiedModelAnswer(false), 2000);
    }
  };

  const handleExaminerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examinerInput.trim() || isExaminerTyping) return;
    onSendExaminerMessage(examinerInput.trim());
    setExaminerInput('');
  };

  const hasStudentInput =
    studentPages.length > 0 || studentManualText.trim().length > 0;
  const hasSchemeInput =
    markSchemePages.length > 0 || markSchemeManualText.trim().length > 0;
  const isOcrBusy =
    studentPages.some((p) => p.ocrStatus === 'processing') ||
    markSchemePages.some((p) => p.ocrStatus === 'processing');

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5 overflow-hidden px-3 py-4 sm:space-y-6 sm:px-6 sm:py-7">
      {/* Top Banner: Paper Correction + Daily 10-Question Allowance Status */}
      <div
        className={`flex min-w-0 flex-col justify-between gap-3 overflow-hidden rounded-2xl border p-4 sm:flex-row sm:items-center ${
          isDark
            ? 'border-purple-500/30 bg-[#0e0b18]/80 shadow-[0_0_30px_rgba(139,92,246,0.12)]'
            : 'border-[#E7E0D6] bg-white shadow-xs'
        }`}
      >
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldCheck
              className={`h-4 w-4 shrink-0 ${
                isDark ? 'text-purple-400' : 'text-[#2D6A4F]'
              }`}
            />
            <h1 className="truncate text-sm font-extrabold tracking-tight sm:text-base">
              Paper Correction
            </h1>
          </div>
          <p
            className={`text-xs ${
              isDark ? 'text-slate-300' : 'text-[#57534E]'
            }`}
          >
            Enhanced Handwriting &amp; Table OCR • Whole marks only • Enforces Cambridge Unit &amp; Keyword Principles
          </p>
        </div>

        {/* Daily Question Quota Badge / Sign-In Prompt */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {user ? (
            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-xs font-bold ${
                remainingQuestions > 0
                  ? isDark
                    ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-300'
                    : 'border-[#2D6A4F]/30 bg-[#EAF2EC] text-[#2D6A4F]'
                  : isDark
                  ? 'border-rose-500/40 bg-rose-950/60 text-rose-300'
                  : 'border-rose-300 bg-rose-50 text-rose-700'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>
                {remainingQuestions} / {maxDailyQuestions} questions left today
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenSignIn}
              className={`flex min-h-[38px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                isDark
                  ? 'border-amber-400/40 bg-amber-950/50 text-amber-200 hover:bg-amber-900/60'
                  : 'border-[#C85A32]/40 bg-[#C85A32]/10 text-[#9C3814] hover:bg-[#C85A32]/20'
              }`}
            >
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>Sign in required • 10 questions/day</span>
            </button>
          )}
        </div>
      </div>

      {/* Sign-In Required Notice Banner when user is not signed in */}
      {!user && (
        <div
          className={`flex flex-col justify-between gap-4 rounded-2xl border p-4 sm:p-5 md:flex-row md:items-center ${
            isDark
              ? 'border-purple-400/45 bg-gradient-to-r from-purple-950/70 via-[#0e0b18] to-fuchsia-950/60 shadow-[0_0_25px_rgba(168,85,247,0.18)]'
              : 'border-[#C85A32]/35 bg-[#F8F6F1] shadow-xs'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                isDark
                  ? 'border-purple-400/40 bg-purple-900/50 text-purple-200'
                  : 'border-[#C85A32]/30 bg-[#C85A32]/15 text-[#9C3814]'
              }`}
            >
              <Lock className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold sm:text-base">
                Sign in required to use Paper Correction
              </h2>
              <p
                className={`text-xs sm:text-sm ${
                  isDark ? 'text-slate-300' : 'text-[#57534E]'
                }`}
              >
                Please sign in with Google or your student email to upload and mark exam papers. Each signed-in student receives{' '}
                <span className="font-bold">10 questions per day</span> and automatic Saved Papers history.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onQuickGoogleSignIn}
              className={`flex min-h-[44px] flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-bold transition-all active:scale-[0.99] ${
                isDark
                  ? 'border-white/30 bg-white text-[#1C1917] shadow-sm hover:bg-slate-100'
                  : 'border-[#1C1917]/20 bg-[#1C1917] text-white hover:bg-[#292524]'
              }`}
            >
              <Chrome className="h-4 w-4 shrink-0 text-blue-500" />
              <span>Sign in with Google</span>
            </button>

            <button
              type="button"
              onClick={onOpenSignIn}
              className={`flex min-h-[44px] flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition-all active:scale-[0.99] ${
                isDark
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-[0_0_18px_rgba(168,85,247,0.4)] hover:brightness-110'
                  : 'bg-[#C85A32] hover:bg-[#9C3814]'
              }`}
            >
              <LogIn className="h-4 w-4 shrink-0" />
              <span>Student Sign In</span>
            </button>
          </div>
        </div>
      )}

      {/* Two Clean Side-by-Side Input Cards on Tablet (md:) & Desktop (Stacked on Mobile) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Card 1: Student's Answer */}
        <section
          aria-label="Student's Answer Card"
          className={`flex flex-col justify-between rounded-2xl border p-4 transition-all sm:p-5 ${
            isDark
              ? 'border-purple-500/30 bg-[#0e0b18]/75 backdrop-blur-md'
              : 'border-[#E7E0D6] bg-white shadow-xs'
          }`}
        >
          <div>
            {/* Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs font-bold ${
                    isDark
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-400/40'
                      : 'bg-[#C85A32]/15 text-[#9C3814]'
                  }`}
                >
                  01
                </span>
                <div>
                  <h2 className="text-sm font-bold sm:text-base">
                    Student&apos;s Answer
                  </h2>
                  <p
                    className={`text-[11px] ${
                      isDark ? 'text-slate-400' : 'text-[#57534E]'
                    }`}
                  >
                    Multi-page handwritten or typed exam answer
                  </p>
                </div>
              </div>

              {/* Header Action Buttons: Add Pic + Upload */}
              <div className="flex items-center gap-1.5">
                <input
                  ref={studentCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleFilesSelected(e.target.files, 'student');
                    e.target.value = '';
                  }}
                />
                <input
                  ref={studentUploadRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleFilesSelected(e.target.files, 'student');
                    e.target.value = '';
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      onOpenSignIn();
                      return;
                    }
                    studentCameraRef.current?.click();
                  }}
                  className={`flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all active:scale-[0.98] ${
                    isDark
                      ? 'border-purple-500/35 bg-purple-950/60 text-purple-200 hover:bg-purple-900/70'
                      : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#1C1917] hover:bg-[#EFECE6]'
                  }`}
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Add Pic</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      onOpenSignIn();
                      return;
                    }
                    studentUploadRef.current?.click();
                  }}
                  className={`flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all active:scale-[0.98] ${
                    isDark
                      ? 'border-purple-500/35 bg-purple-950/60 text-purple-200 hover:bg-purple-900/70'
                      : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#1C1917] hover:bg-[#EFECE6]'
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload</span>
                </button>
              </div>
            </div>

            {/* Compact Dashed Tap-Zone (Default Clean State) */}
            {studentPages.length === 0 ? (
              <div
                onClick={() => {
                  if (!user) {
                    onOpenSignIn();
                    return;
                  }
                  studentUploadRef.current?.click();
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (!user) {
                      onOpenSignIn();
                      return;
                    }
                    studentUploadRef.current?.click();
                  }
                }}
                className={`group flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-all ${
                  isDark
                    ? 'border-purple-500/30 bg-[#06050b]/40 hover:border-purple-400/60 hover:bg-purple-950/25'
                    : 'border-[#E7E0D6] bg-[#F8F6F1]/60 hover:border-[#C85A32]/60 hover:bg-[#F8F6F1]'
                }`}
              >
                <div
                  className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                    isDark
                      ? 'bg-purple-900/40 text-purple-300'
                      : 'bg-[#C85A32]/15 text-[#9C3814]'
                  }`}
                >
                  <Camera className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold sm:text-sm">
                  Tap to take photo or upload pages
                </p>
                <p
                  className={`mt-0.5 text-[11px] ${
                    isDark ? 'text-slate-400' : 'text-[#57534E]'
                  }`}
                >
                  High-contrast handwriting OCR • Multi-page photos &amp; PDFs
                </p>
              </div>
            ) : (
              /* Horizontal Multi-Page Thumbnail Carousel */
              <div className="flex items-center gap-2.5 overflow-x-auto py-2 touch-pan-x no-scrollbar">
                {studentPages.map((page) => (
                  <div
                    key={page.id}
                    className={`relative flex h-24 w-20 shrink-0 flex-col justify-between overflow-hidden rounded-xl border p-1.5 ${
                      isDark
                        ? 'border-purple-500/40 bg-[#06050b]'
                        : 'border-[#E7E0D6] bg-[#F8F6F1]'
                    }`}
                  >
                    {page.mimeType.includes('pdf') ? (
                      <div className="flex flex-1 items-center justify-center">
                        <FileText className="h-7 w-7 opacity-70" />
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={page.dataUrl}
                        alt={`Student page ${page.pageNumber}`}
                        className="h-14 w-full rounded-md object-cover"
                      />
                    )}
                    <div className="flex items-center justify-between px-0.5">
                      <span className="font-mono text-[10px] font-bold">
                        P. {page.pageNumber}
                      </span>
                      {page.ocrStatus === 'processing' ? (
                        <Loader2 className="h-3 w-3 animate-spin text-purple-400" />
                      ) : (
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isDark ? 'bg-emerald-400' : 'bg-[#2D6A4F]'
                          }`}
                          title="Enhanced OCR Ready"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePage(page.id, 'student')}
                      aria-label={`Delete Student Page ${page.pageNumber}`}
                      className="absolute top-1 right-1 rounded-md bg-black/75 p-1 text-rose-300 hover:bg-rose-600 hover:text-white"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* + Add Page Card */}
                <button
                  type="button"
                  onClick={() => studentUploadRef.current?.click()}
                  className={`flex h-24 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-xs font-semibold transition-colors ${
                    isDark
                      ? 'border-purple-500/40 bg-purple-950/30 text-purple-200 hover:bg-purple-900/50'
                      : 'border-[#C85A32]/40 bg-[#F8F6F1] text-[#9C3814] hover:bg-[#EFECE6]'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-[11px]">+ Add Page</span>
                </button>
              </div>
            )}

            {/* Discreet Toggle for Manual Text Input */}
            <div className="mt-2.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    onOpenSignIn();
                    return;
                  }
                  setShowStudentTextBox(!showStudentTextBox);
                }}
                className={`inline-flex min-h-[36px] items-center gap-1.5 text-xs font-medium underline-offset-4 hover:underline ${
                  isDark ? 'text-purple-300/90' : 'text-[#9C3814]'
                }`}
              >
                <Keyboard className="h-3.5 w-3.5" />
                <span>
                  {showStudentTextBox
                    ? 'Hide text input'
                    : 'Or type / paste text'}
                </span>
              </button>
              {studentPages.length > 0 && (
                <span
                  className={`font-mono text-[11px] ${
                    isDark ? 'text-emerald-300' : 'text-[#2D6A4F]'
                  }`}
                >
                  {isOcrBusy
                    ? 'Enhancing & scanning OCR...'
                    : `${studentPages.length} page(s) OCR ready`}
                </span>
              )}
            </div>

            {showStudentTextBox && (
              <div className="mt-2.5 space-y-2">
                <input
                  type="text"
                  value={questionPromptText}
                  onChange={(e) => setQuestionPromptText(e.target.value)}
                  placeholder="Optional question prompt / printed answer line (e.g. Answer line: ........... %)"
                  className={`w-full rounded-xl border px-3 py-2.5 text-base sm:text-xs focus:outline-none ${
                    isDark
                      ? 'border-purple-500/30 bg-[#06050b] text-white placeholder-slate-500 focus:border-purple-400'
                      : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#1C1917] placeholder-stone-400 focus:border-[#C85A32]'
                  }`}
                />
                <textarea
                  rows={3}
                  value={studentManualText}
                  onChange={(e) => setStudentManualText(e.target.value)}
                  placeholder="Type or paste the student's answer here..."
                  className={`w-full rounded-xl border p-3 text-base sm:text-sm focus:outline-none ${
                    isDark
                      ? 'border-purple-500/30 bg-[#06050b] text-white placeholder-slate-500 focus:border-purple-400'
                      : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#1C1917] placeholder-stone-400 focus:border-[#C85A32]'
                  }`}
                />
              </div>
            )}
          </div>
        </section>

        {/* Card 2: Official Mark Scheme */}
        <section
          aria-label="Official Mark Scheme Card"
          className={`flex flex-col justify-between rounded-2xl border p-4 transition-all sm:p-5 ${
            isDark
              ? 'border-purple-500/30 bg-[#0e0b18]/75 backdrop-blur-md'
              : 'border-[#E7E0D6] bg-white shadow-xs'
          }`}
        >
          <div>
            {/* Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs font-bold ${
                    isDark
                      ? 'bg-fuchsia-600/30 text-fuchsia-200 border border-fuchsia-400/40'
                      : 'bg-[#EAF2EC] text-[#2D6A4F]'
                  }`}
                >
                  02
                </span>
                <div>
                  <h2 className="text-sm font-bold sm:text-base">
                    Official Mark Scheme
                  </h2>
                  <p
                    className={`text-[11px] ${
                      isDark ? 'text-slate-400' : 'text-[#57534E]'
                    }`}
                  >
                    Cambridge 0610 rubric points &amp; auto mark detection
                  </p>
                </div>
              </div>

              {/* Header Action Buttons: Add Pic + Upload */}
              <div className="flex items-center gap-1.5">
                <input
                  ref={schemeCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleFilesSelected(e.target.files, 'markscheme');
                    e.target.value = '';
                  }}
                />
                <input
                  ref={schemeUploadRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleFilesSelected(e.target.files, 'markscheme');
                    e.target.value = '';
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      onOpenSignIn();
                      return;
                    }
                    schemeCameraRef.current?.click();
                  }}
                  className={`flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all active:scale-[0.98] ${
                    isDark
                      ? 'border-purple-500/35 bg-purple-950/60 text-purple-200 hover:bg-purple-900/70'
                      : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#1C1917] hover:bg-[#EFECE6]'
                  }`}
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Add Pic</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      onOpenSignIn();
                      return;
                    }
                    schemeUploadRef.current?.click();
                  }}
                  className={`flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all active:scale-[0.98] ${
                    isDark
                      ? 'border-purple-500/35 bg-purple-950/60 text-purple-200 hover:bg-purple-900/70'
                      : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#1C1917] hover:bg-[#EFECE6]'
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload</span>
                </button>
              </div>
            </div>

            {/* Compact Dashed Tap-Zone (Default Clean State) */}
            {markSchemePages.length === 0 ? (
              <div
                onClick={() => {
                  if (!user) {
                    onOpenSignIn();
                    return;
                  }
                  schemeUploadRef.current?.click();
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (!user) {
                      onOpenSignIn();
                      return;
                    }
                    schemeUploadRef.current?.click();
                  }
                }}
                className={`group flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-all ${
                  isDark
                    ? 'border-purple-500/30 bg-[#06050b]/40 hover:border-purple-400/60 hover:bg-purple-950/25'
                    : 'border-[#E7E0D6] bg-[#F8F6F1]/60 hover:border-[#C85A32]/60 hover:bg-[#F8F6F1]'
                }`}
              >
                <div
                  className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                    isDark
                      ? 'bg-fuchsia-900/40 text-fuchsia-300'
                      : 'bg-[#EAF2EC] text-[#2D6A4F]'
                  }`}
                >
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold sm:text-sm">
                  Tap to take photo or upload pages
                </p>
                <p
                  className={`mt-0.5 text-[11px] ${
                    isDark ? 'text-slate-400' : 'text-[#57534E]'
                  }`}
                >
                  4-column Cambridge table OCR &amp; auto mark detection
                </p>
              </div>
            ) : (
              /* Horizontal Multi-Page Thumbnail Carousel */
              <div className="flex items-center gap-2.5 overflow-x-auto py-2 touch-pan-x no-scrollbar">
                {markSchemePages.map((page) => (
                  <div
                    key={page.id}
                    className={`relative flex h-24 w-20 shrink-0 flex-col justify-between overflow-hidden rounded-xl border p-1.5 ${
                      isDark
                        ? 'border-purple-500/40 bg-[#06050b]'
                        : 'border-[#E7E0D6] bg-[#F8F6F1]'
                    }`}
                  >
                    {page.mimeType.includes('pdf') ? (
                      <div className="flex flex-1 items-center justify-center">
                        <FileText className="h-7 w-7 opacity-70" />
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={page.dataUrl}
                        alt={`Mark scheme page ${page.pageNumber}`}
                        className="h-14 w-full rounded-md object-cover"
                      />
                    )}
                    <div className="flex items-center justify-between px-0.5">
                      <span className="font-mono text-[10px] font-bold">
                        P. {page.pageNumber}
                      </span>
                      {page.ocrStatus === 'processing' ? (
                        <Loader2 className="h-3 w-3 animate-spin text-purple-400" />
                      ) : (
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isDark ? 'bg-emerald-400' : 'bg-[#2D6A4F]'
                          }`}
                          title="Enhanced OCR Ready"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePage(page.id, 'markscheme')}
                      aria-label={`Delete Mark Scheme Page ${page.pageNumber}`}
                      className="absolute top-1 right-1 rounded-md bg-black/75 p-1 text-rose-300 hover:bg-rose-600 hover:text-white"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* + Add Page Card */}
                <button
                  type="button"
                  onClick={() => schemeUploadRef.current?.click()}
                  className={`flex h-24 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-xs font-semibold transition-colors ${
                    isDark
                      ? 'border-purple-500/40 bg-purple-950/30 text-purple-200 hover:bg-purple-900/50'
                      : 'border-[#C85A32]/40 bg-[#F8F6F1] text-[#9C3814] hover:bg-[#EFECE6]'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-[11px]">+ Add Page</span>
                </button>
              </div>
            )}

            {/* Discreet Toggle for Manual Mark Scheme Text Input */}
            <div className="mt-2.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    onOpenSignIn();
                    return;
                  }
                  setShowMarkSchemeTextBox(!showMarkSchemeTextBox);
                }}
                className={`inline-flex min-h-[36px] items-center gap-1.5 text-xs font-medium underline-offset-4 hover:underline ${
                  isDark ? 'text-purple-300/90' : 'text-[#9C3814]'
                }`}
              >
                <Keyboard className="h-3.5 w-3.5" />
                <span>
                  {showMarkSchemeTextBox
                    ? 'Hide text input'
                    : 'Or type / paste text'}
                </span>
              </button>
              {markSchemePages.length > 0 && (
                <span
                  className={`font-mono text-[11px] ${
                    isDark ? 'text-emerald-300' : 'text-[#2D6A4F]'
                  }`}
                >
                  {isOcrBusy
                    ? 'Enhancing & scanning rubric...'
                    : `${markSchemePages.length} page(s) OCR ready`}
                </span>
              )}
            </div>

            {showMarkSchemeTextBox && (
              <div className="mt-2.5">
                <textarea
                  rows={4}
                  value={markSchemeManualText}
                  onChange={(e) => setMarkSchemeManualText(e.target.value)}
                  placeholder="Paste official Cambridge 0610 mark scheme points (e.g. [B1] net movement of water molecules; [B1] down a water potential gradient...)"
                  className={`w-full rounded-xl border p-3 font-mono text-base sm:text-xs focus:outline-none ${
                    isDark
                      ? 'border-purple-500/30 bg-[#06050b] text-white placeholder-slate-500 focus:border-purple-400'
                      : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#1C1917] placeholder-stone-400 focus:border-[#C85A32]'
                  }`}
                />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Primary Action Button: Start Marking (Enforces Sign-In & 10 Questions/Day Limit) */}
      <div className="flex flex-col items-center justify-center gap-2 pt-1">
        {!user ? (
          <button
            type="button"
            onClick={onOpenSignIn}
            className={`flex min-h-[48px] w-full max-w-md items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all active:scale-[0.99] ${
              isDark
                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 shadow-[0_0_25px_rgba(168,85,247,0.45)] hover:brightness-110'
                : 'bg-[#C85A32] shadow-md hover:bg-[#9C3814]'
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>Sign In to Start Marking (10 Questions/Day)</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={
                isGrading ||
                isDailyLimitReached ||
                (!hasStudentInput && !hasSchemeInput)
              }
              onClick={onGradeSubmission}
              className={`flex min-h-[48px] w-full max-w-md items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${
                isDark
                  ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 shadow-[0_0_25px_rgba(168,85,247,0.45)] hover:brightness-110'
                  : 'bg-[#C85A32] shadow-md hover:bg-[#9C3814]'
              }`}
            >
              {isGrading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Marking...</span>
                </>
              ) : isDailyLimitReached ? (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Daily Limit Reached (10/10 Used Today)</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Start Marking</span>
                </>
              )}
            </button>

            <p
              className={`text-center font-mono text-xs ${
                isDailyLimitReached
                  ? 'font-semibold text-rose-400'
                  : isDark
                  ? 'text-slate-400'
                  : 'text-[#57534E]'
              }`}
            >
              {isDailyLimitReached
                ? `You have used all ${maxDailyQuestions} questions for today (${user.email}). Your daily limit resets tomorrow.`
                : `Signed in as ${user.name || user.email} • ${remainingQuestions} of ${maxDailyQuestions} questions left today`}
            </p>
          </>
        )}
      </div>

      {/* ===================================================================== */}
      {/* RESULTS SECTION (Auto-Scrolled Directly Into View When Generated)      */}
      {/* ===================================================================== */}
      {gradingResult && (
        <div
          id="grading-results-section"
          ref={resultsRef}
          className="scroll-mt-28 sm:scroll-mt-24 space-y-5 pt-2 animate-in fade-in duration-300"
        >
          {/* 1. Question Score Bar (Grade Removed as Requested; Shows Marks & Percentage) */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 ${
              isDark
                ? 'border-purple-500/40 bg-[#0e0b18]/90 shadow-[0_0_35px_rgba(139,92,246,0.2)]'
                : 'border-[#E7E0D6] bg-white shadow-sm'
            }`}
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-extrabold sm:text-lg">
                    {gradingResult.questionTitle}
                  </h2>
                  {/* Percentage Badge */}
                  <span
                    className={`rounded-md px-2.5 py-0.5 font-mono text-xs font-bold ${
                      isDark
                        ? 'border border-purple-400/40 bg-purple-900/50 text-purple-200'
                        : 'border border-[#2D6A4F]/30 bg-[#EAF2EC] text-[#2D6A4F]'
                    }`}
                  >
                    {gradingResult.percentage}%
                  </span>
                  {gradingResult.unitRuleApplied && (
                    <span
                      className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${
                        isDark
                          ? 'border border-emerald-400/40 bg-emerald-950/60 text-emerald-300'
                          : 'border border-[#2D6A4F]/30 bg-[#EAF2EC] text-[#2D6A4F]'
                      }`}
                    >
                      ✓ Cambridge Unit Rule Protected
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs sm:text-sm ${
                    isDark ? 'text-slate-300' : 'text-[#57534E]'
                  }`}
                >
                  {gradingResult.examinerSummary}
                </p>
              </div>

              {/* Awarded Marks (X / Y) & Marks Lost (-Z) */}
              <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                <div
                  className={`rounded-xl border px-3.5 py-2 text-center ${
                    isDark
                      ? 'border-emerald-500/35 bg-emerald-950/40 text-emerald-300'
                      : 'border-[#2D6A4F]/30 bg-[#EAF2EC] text-[#2D6A4F]'
                  }`}
                >
                  <div className="font-mono text-lg font-extrabold">
                    {gradingResult.awardedMarks} / {gradingResult.totalMarks}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider">
                    Awarded Marks
                  </div>
                </div>

                <div
                  className={`rounded-xl border px-3.5 py-2 text-center ${
                    gradingResult.marksLost > 0
                      ? isDark
                        ? 'border-rose-500/35 bg-rose-950/40 text-rose-300'
                        : 'border-rose-300 bg-rose-50 text-rose-700'
                      : isDark
                      ? 'border-purple-500/25 bg-[#06050b]/60 text-slate-400'
                      : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#57534E]'
                  }`}
                >
                  <div className="font-mono text-lg font-extrabold">
                    -{gradingResult.marksLost}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider">
                    Marks Lost
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Answer Comparison Against the Mark Scheme */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 ${
              isDark
                ? 'border-purple-500/30 bg-[#0e0b18]/80'
                : 'border-[#E7E0D6] bg-white shadow-xs'
            }`}
          >
            <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Award
                  className={`h-4 w-4 ${
                    isDark ? 'text-purple-400' : 'text-[#C85A32]'
                  }`}
                />
                <h3 className="text-sm font-bold sm:text-base">
                  Answer vs. Mark Scheme Comparison (Key Points)
                </h3>
              </div>
              <span
                className={`font-mono text-xs ${
                  isDark ? 'text-slate-400' : 'text-[#57534E]'
                }`}
              >
                Whole marks only • Positive marking
              </span>
            </div>

            <div className="space-y-2.5">
              {gradingResult.rubricPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col justify-between gap-2.5 rounded-xl border p-3.5 sm:flex-row sm:items-start ${
                    pt.satisfied
                      ? isDark
                        ? 'border-emerald-500/30 bg-emerald-950/20'
                        : 'border-[#2D6A4F]/25 bg-[#EAF2EC]/50'
                      : isDark
                      ? 'border-rose-500/30 bg-rose-950/20'
                      : 'border-rose-200 bg-rose-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-bold ${
                        pt.satisfied
                          ? isDark
                            ? 'bg-emerald-500/25 text-emerald-300'
                            : 'bg-[#2D6A4F] text-white'
                          : isDark
                          ? 'bg-rose-500/25 text-rose-300'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {pt.satisfied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                    </span>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 font-mono text-xs font-bold ${
                            isDark
                              ? 'border border-purple-400/40 bg-purple-950/70 text-purple-200'
                              : 'border border-[#E7E0D6] bg-white text-[#9C3814]'
                          }`}
                        >
                          {pt.code}
                        </span>
                        <span className="text-sm font-semibold">
                          {pt.description}
                        </span>
                      </div>
                      <p
                        className={`text-xs ${
                          isDark ? 'text-slate-300' : 'text-[#57534E]'
                        }`}
                      >
                        {pt.examinerNote}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 self-end rounded-lg px-2.5 py-1 font-mono text-xs font-bold sm:self-center ${
                      pt.satisfied
                        ? isDark
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-[#EAF2EC] text-[#2D6A4F]'
                        : isDark
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {pt.satisfied ? `+${pt.marksAwarded} m` : '0 m'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Mistakes & Why Marks Were Lost (Shown when marksLost > 0) */}
          {gradingResult.marksLost > 0 &&
            gradingResult.lostMarksBreakdown.length > 0 && (
              <div
                className={`rounded-2xl border p-4 sm:p-5 ${
                  isDark
                    ? 'border-rose-500/35 bg-[#0e0b18]/85'
                    : 'border-rose-200 bg-white shadow-xs'
                }`}
              >
                <div className="mb-3.5 flex items-center gap-2">
                  <AlertTriangle
                    className={`h-4 w-4 ${
                      isDark ? 'text-rose-400' : 'text-rose-600'
                    }`}
                  />
                  <h3 className="text-sm font-bold sm:text-base">
                    Mistakes &amp; Why Marks Were Lost (-{gradingResult.marksLost} m)
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {gradingResult.lostMarksBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className={`space-y-2 rounded-xl border p-4 ${
                        isDark
                          ? 'border-rose-500/25 bg-[#06050b]/70'
                          : 'border-rose-200/80 bg-rose-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${
                            isDark
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          Missed {item.rubricCode}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span
                            className={`font-bold ${
                              isDark ? 'text-rose-300' : 'text-rose-700'
                            }`}
                          >
                            Mistake in student&apos;s answer:{' '}
                          </span>
                          <span
                            className={
                              isDark ? 'text-slate-200' : 'text-[#1C1917]'
                            }
                          >
                            {item.whatWasWrong}
                          </span>
                        </div>

                        <div>
                          <span
                            className={`font-bold ${
                              isDark ? 'text-amber-300' : 'text-[#9C3814]'
                            }`}
                          >
                            Why mark was deducted (Cambridge Principles):{' '}
                          </span>
                          <span
                            className={
                              isDark ? 'text-slate-300' : 'text-[#57534E]'
                            }
                          >
                            {item.whyMarkDeducted}
                          </span>
                        </div>

                        <div>
                          <span
                            className={`font-bold ${
                              isDark ? 'text-emerald-300' : 'text-[#2D6A4F]'
                            }`}
                          >
                            How to earn full marks:{' '}
                          </span>
                          <span
                            className={
                              isDark ? 'text-slate-200' : 'text-[#1C1917]'
                            }
                          >
                            {item.howToEarnFullMarks}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* 4. How to Earn Full Marks & Corrected Version (100% Full Marks) */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 ${
              isDark
                ? 'border-emerald-500/35 bg-[#0e0b18]/85'
                : 'border-[#2D6A4F]/30 bg-white shadow-xs'
            }`}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${
                    isDark ? 'text-emerald-400' : 'text-[#2D6A4F]'
                  }`}
                />
                <h3 className="text-sm font-bold sm:text-base">
                  How to Earn Full Marks &amp; Corrected Version (100% Full Marks)
                </h3>
              </div>

              <button
                type="button"
                onClick={handleCopyCorrected}
                className={`flex min-h-[38px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                  isDark
                    ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200 hover:bg-emerald-900/60'
                    : 'border-[#2D6A4F]/30 bg-[#EAF2EC] text-[#2D6A4F] hover:bg-[#d8e8dc]'
                }`}
              >
                {copiedModelAnswer ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Model Answer</span>
                  </>
                )}
              </button>
            </div>

            {gradingResult.howToEarnFullMarksSummary && (
              <div
                className={`mb-3 rounded-xl border p-4 ${
                  isDark
                    ? 'border-emerald-500/25 bg-emerald-950/20'
                    : 'border-[#2D6A4F]/25 bg-[#EAF2EC]/50'
                }`}
              >
                <div
                  className={`mb-1.5 text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-emerald-300' : 'text-[#2D6A4F]'
                  }`}
                >
                  How to Earn a Full Mark on This Question:
                </div>
                <FormattedContent
                  content={gradingResult.howToEarnFullMarksSummary}
                  isDark={isDark}
                />
              </div>
            )}

            <div
              className={`rounded-xl border p-4 ${
                isDark
                  ? 'border-purple-500/20 bg-[#06050b]/80'
                  : 'border-[#E7E0D6] bg-[#F8F6F1]'
              }`}
            >
              <div
                className={`mb-1.5 text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'text-purple-300' : 'text-[#9C3814]'
                }`}
              >
                Full-Mark Model Answer (100%):
              </div>
              <FormattedContent
                content={gradingResult.correctedVersion}
                isDark={isDark}
              />
            </div>
          </div>

          {/* 5. In-Tab "Chat with Question Examiner" (Check Tab Only) */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 ${
              isDark
                ? 'border-purple-500/40 bg-[#0e0b18]/90'
                : 'border-[#E7E0D6] bg-white shadow-xs'
            }`}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-current/10">
              <div>
                <h3 className="text-sm font-bold sm:text-base">
                  Chat with Question Examiner
                </h3>
                <p
                  className={`text-xs ${
                    isDark ? 'text-slate-400' : 'text-[#57534E]'
                  }`}
                >
                  Ask follow-up questions about your graded answer, alternative phrasing, or the mark scheme
                </p>
              </div>

              <button
                type="button"
                onClick={onResetExaminerChat}
                className={`flex min-h-[38px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                  isDark
                    ? 'border-purple-500/35 bg-purple-950/50 text-purple-200 hover:bg-purple-900/60'
                    : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#9C3814] hover:bg-[#EFECE6]'
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>New Question Chat</span>
              </button>
            </div>

            {/* Suggested Examiner Prompts */}
            <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 touch-pan-x no-scrollbar">
              {[
                'Could I get marks if I worded it differently?',
                'Why was my unit or formula penalized or accepted?',
                'Which exact Cambridge 0610 keywords are underlined here?',
              ].map((promptText, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSendExaminerMessage(promptText)}
                  className={`min-h-[36px] shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    isDark
                      ? 'border-purple-500/25 bg-[#06050b] text-purple-200 hover:border-purple-400'
                      : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#1C1917] hover:border-[#C85A32]'
                  }`}
                >
                  {promptText}
                </button>
              ))}
            </div>

            {/* Examiner Conversation Messages */}
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {examinerMessages.map((msg, idx) => {
                const isLast = idx === examinerMessages.length - 1;
                return (
                  <div
                    key={msg.id}
                    ref={isLast ? examinerLastMsgRef : undefined}
                    className={`rounded-xl border p-3.5 ${
                      msg.role === 'user'
                        ? isDark
                          ? 'ml-auto max-w-xl border-purple-400/40 bg-purple-950/60 text-white'
                          : 'ml-auto max-w-xl border-[#C85A32]/30 bg-[#C85A32]/10 text-[#1C1917]'
                        : isDark
                        ? 'border-purple-500/25 bg-[#06050b]/90'
                        : 'border-[#E7E0D6] bg-[#F8F6F1]'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between text-[10px] font-mono uppercase opacity-70">
                      <span>
                        {msg.role === 'user'
                          ? 'Student'
                          : '0610 Question Examiner'}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <FormattedContent content={msg.content} isDark={isDark} />
                  </div>
                );
              })}
              {isExaminerTyping && (
                <div
                  className={`flex items-center gap-2 rounded-xl border p-3 text-xs ${
                    isDark
                      ? 'border-purple-500/20 bg-[#06050b]/70 text-purple-200'
                      : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#57534E]'
                  }`}
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Examiner is reviewing your rubric points...</span>
                </div>
              )}
            </div>

            {/* Examiner Chat Input Bar */}
            <form onSubmit={handleExaminerSubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={examinerInput}
                onChange={(e) => setExaminerInput(e.target.value)}
                placeholder="Ask the Question Examiner about your answer or rubric..."
                className={`min-h-[44px] flex-1 rounded-xl border px-3.5 py-2.5 text-base sm:text-sm focus:outline-none ${
                  isDark
                    ? 'border-purple-500/35 bg-[#06050b] text-white placeholder-slate-500 focus:border-purple-400'
                    : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#1C1917] placeholder-stone-400 focus:border-[#C85A32]'
                }`}
              />
              <button
                type="submit"
                disabled={!examinerInput.trim() || isExaminerTyping}
                className={`flex min-h-[44px] items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all disabled:opacity-50 ${
                  isDark
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110'
                    : 'bg-[#C85A32] hover:bg-[#9C3814]'
                }`}
              >
                <Send className="h-3.5 w-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
