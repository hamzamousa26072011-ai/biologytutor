'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  BookmarkCheck,
  BookmarkPlus,
  Camera,
  CheckCircle2,
  Eye,
  FileText,
  Keyboard,
  Loader2,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import { AppUser } from './Navbar';
import FormattedContent from './FormattedContent';
import ImagePreviewModal, { PreviewImageData } from './ImagePreviewModal';
import {
  GradingResult,
  MAX_DAILY_QUESTIONS,
  canUserGradeQuestion,
  getTodayDateKey,
  isAdminEmail,
} from '@/lib/marking-engine';

export interface UploadedPage {
  id: string;
  name: string;
  mimeType: string;
  dataUrl: string;
  base64Data: string;
  isPdf: boolean;
}

interface ExaminerChatMsg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface CheckingQuestionsTabProps {
  user: AppUser | null;
  usageByEmailDate: Record<string, number>;
  onRequireSignIn: (reason: string) => void;
  onConsumeDailyQuestion: (userEmail: string, isAdmin: boolean) => number;
  onSavePaper: (title: string, result: GradingResult) => Promise<void>;
}

async function enhanceImageForOcr(file: File): Promise<{
  dataUrl: string;
  base64Data: string;
  mimeType: string;
}> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

  if (file.type === 'application/pdf' || typeof document === 'undefined') {
    return {
      dataUrl: rawDataUrl,
      base64Data: rawDataUrl.split(',')[1] || '',
      mimeType: file.type || 'application/pdf',
    };
  }

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new window.Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('Image decode failed'));
      element.src = rawDataUrl;
    });

    const minWidth = 1000;
    const maxWidth = 1800;
    let targetW = img.naturalWidth || img.width;
    let targetH = img.naturalHeight || img.height;

    if (targetW > 0 && targetW < minWidth) {
      const scale = minWidth / targetW;
      targetW = Math.round(targetW * scale);
      targetH = Math.round(targetH * scale);
    } else if (targetW > maxWidth) {
      const scale = maxWidth / targetW;
      targetW = Math.round(targetW * scale);
      targetH = Math.round(targetH * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, targetW);
    canvas.height = Math.max(1, targetH);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return {
        dataUrl: rawDataUrl,
        base64Data: rawDataUrl.split(',')[1] || '',
        mimeType: file.type || 'image/jpeg',
      };
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.filter = 'contrast(1.12) brightness(1.03)';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const enhancedUrl = canvas.toDataURL('image/jpeg', 0.9);
    return {
      dataUrl: enhancedUrl,
      base64Data: enhancedUrl.split(',')[1] || '',
      mimeType: 'image/jpeg',
    };
  } catch {
    return {
      dataUrl: rawDataUrl,
      base64Data: rawDataUrl.split(',')[1] || '',
      mimeType: file.type || 'image/jpeg',
    };
  }
}

export default function CheckingQuestionsTab({
  user,
  usageByEmailDate,
  onRequireSignIn,
  onConsumeDailyQuestion,
  onSavePaper,
}: CheckingQuestionsTabProps) {
  const [studentPages, setStudentPages] = useState<UploadedPage[]>([]);
  const [markSchemePages, setMarkSchemePages] = useState<UploadedPage[]>([]);
  const [studentText, setStudentText] = useState('');
  const [markSchemeText, setMarkSchemeText] = useState('');
  const [showStudentText, setShowStudentText] = useState(false);
  const [showMarkSchemeText, setShowMarkSchemeText] = useState(false);

  const [isMarking, setIsMarking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [postMarkRemaining, setPostMarkRemaining] = useState<number | null>(null);
  const [paperSaved, setPaperSaved] = useState(false);

  const [examinerChat, setExaminerChat] = useState<ExaminerChatMsg[]>([]);
  const [followUpInput, setFollowUpInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [previewImage, setPreviewImage] = useState<PreviewImageData | null>(null);

  const studentCameraRef = useRef<HTMLInputElement | null>(null);
  const studentUploadRef = useRef<HTMLInputElement | null>(null);
  const schemeCameraRef = useRef<HTMLInputElement | null>(null);
  const schemeUploadRef = useRef<HTMLInputElement | null>(null);
  const resultsSectionRef = useRef<HTMLDivElement | null>(null);

  const userIsAdmin = isAdminEmail(user?.email);

  const requireSignedInGate = (): boolean => {
    if (!user) {
      onRequireSignIn(
        "Sign in required to use Student's Answer and Official Mark Scheme for Paper Correction."
      );
      return false;
    }
    return true;
  };

  const handleFilesSelected = async (
    files: FileList | null,
    target: 'student' | 'mark_scheme'
  ) => {
    if (!files || files.length === 0) return;
    if (!requireSignedInGate()) return;

    const processed: UploadedPage[] = [];
    for (const file of Array.from(files)) {
      const enhanced = await enhanceImageForOcr(file);
      processed.push({
        id: `${target}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        mimeType: enhanced.mimeType,
        dataUrl: enhanced.dataUrl,
        base64Data: enhanced.base64Data,
        isPdf: file.type === 'application/pdf',
      });
    }

    if (target === 'student') {
      setStudentPages((prev) => [...prev, ...processed]);
    } else {
      setMarkSchemePages((prev) => [...prev, ...processed]);
    }
    setErrorMsg(null);
  };

  const handleToggleText = (target: 'student' | 'mark_scheme') => {
    if (!requireSignedInGate()) return;
    if (target === 'student') {
      setShowStudentText((prev) => !prev);
    } else {
      setShowMarkSchemeText((prev) => !prev);
    }
  };

  const handleTriggerInput = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (!requireSignedInGate()) return;
    ref.current?.click();
  };

  const handleStartMarking = async () => {
    setErrorMsg(null);

    if (!user) {
      onRequireSignIn(
        "Sign in required to transcribe and mark Student's Answer against Official Mark Scheme."
      );
      return;
    }

    const todayKey = getTodayDateKey();
    const quota = canUserGradeQuestion(usageByEmailDate, user.email, todayKey);
    if (!quota.allowed) {
      setErrorMsg(
        quota.reason ||
          `You have reached your daily limit of ${MAX_DAILY_QUESTIONS} questions for today.`
      );
      return;
    }

    const hasStudent = studentText.trim().length > 0 || studentPages.length > 0;
    const hasScheme = markSchemeText.trim().length > 0 || markSchemePages.length > 0;

    if (!hasStudent || !hasScheme) {
      setErrorMsg(
        "Please provide both the Student's Answer and the Official Mark Scheme before starting marking."
      );
      return;
    }

    setIsMarking(true);
    setPaperSaved(false);
    setExaminerChat([]);

    try {
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAnswer: studentText.trim(),
          markScheme: markSchemeText.trim(),
          studentPages: studentPages.map((p) => ({
            mimeType: p.mimeType,
            base64Data: p.base64Data,
            label: p.name,
          })),
          markSchemePages: markSchemePages.map((p) => ({
            mimeType: p.mimeType,
            base64Data: p.base64Data,
            label: p.name,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.result) {
        throw new Error(data.error || 'Unable to complete marking right now.');
      }

      const gradedResult = data.result as GradingResult;
      setResult(gradedResult);

      if (gradedResult.extractedStudentAnswer && !studentText.trim() && studentPages.length > 0) {
        setStudentText(gradedResult.extractedStudentAnswer);
        setShowStudentText(true);
      }
      if (
        gradedResult.extractedMarkScheme &&
        !markSchemeText.trim() &&
        markSchemePages.length > 0
      ) {
        setMarkSchemeText(gradedResult.extractedMarkScheme);
        setShowMarkSchemeText(true);
      }

      const remainingAfter = onConsumeDailyQuestion(user.email, quota.isAdmin);
      setPostMarkRemaining(remainingAfter);

      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Marking failed. Please try again.');
    } finally {
      setIsMarking(false);
    }
  };

  const handleSaveCurrentPaper = async () => {
    if (!result) return;
    const titleSeed =
      (markSchemeText || studentText || 'Cambridge 0610 Question')
        .split('\n')[0]
        .trim()
        .slice(0, 70) || 'Cambridge 0610 Question';
    await onSavePaper(titleSeed, result);
    setPaperSaved(true);
  };

  const handleExaminerFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = followUpInput.trim();
    if (!q || !result || isChatting) return;

    const userMsg: ExaminerChatMsg = { id: `eu-${Date.now()}`, role: 'user', text: q };
    setExaminerChat((prev) => [...prev, userMsg]);
    setFollowUpInput('');
    setIsChatting(true);

    try {
      const res = await fetch('/api/examiner-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          gradingResult: result,
          studentAnswer: result.extractedStudentAnswer || studentText,
          markScheme: result.extractedMarkScheme || markSchemeText,
        }),
      });
      const data = await res.json();
      setExaminerChat((prev) => [
        ...prev,
        {
          id: `ea-${Date.now()}`,
          role: 'assistant',
          text: data.reply || 'Refer to the rubric breakdown above for each mark point.',
        },
      ]);
    } catch {
      setExaminerChat((prev) => [
        ...prev,
        {
          id: `eerr-${Date.now()}`,
          role: 'assistant',
          text: 'Unable to fetch examiner follow-up right now.',
        },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Paper Correction Header Banner */}
      <div className="rounded-2xl border border-stone-200/90 dark:border-purple-500/25 bg-white dark:bg-[#120824]/90 px-4 py-3.5 sm:px-5 sm:py-4 shadow-sm shadow-stone-900/5 dark:shadow-purple-950/30 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#ea580c] dark:text-fuchsia-300" />
            <div>
              <h1 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                Paper Correction
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-stone-500 dark:text-purple-200/75">
                Auto-detects total marks from your Mark Scheme • Whole marks only • Enforces Cambridge Unit &amp; Keyword Principles
              </p>
            </div>
          </div>

          {userIsAdmin && (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-400/35 bg-emerald-50 dark:bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
              Unlimited access · Admin
            </span>
          )}
        </div>
      </div>

      {/* Equal-Height Dual Input Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 items-stretch">
        {/* Card 01: Student's Answer */}
        <section
          aria-label="Student's Answer"
          className="flex flex-col justify-between rounded-2xl border border-stone-200/90 dark:border-purple-500/25 bg-white dark:bg-[#120824]/90 p-4 sm:p-5 shadow-sm shadow-stone-900/5 dark:shadow-purple-950/30 transition-colors"
        >
          <div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-orange-200/90 dark:border-purple-400/30 bg-orange-50 dark:bg-purple-500/20 font-mono text-xs font-bold text-[#ea580c] dark:text-fuchsia-200">
                01
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                  Student&apos;s Answer
                </h2>
                <p className="text-xs text-stone-500 dark:text-purple-200/70">
                  Multi-page handwritten or typed exam answer
                </p>
              </div>
            </div>

            <input
              ref={studentCameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(e) => {
                void handleFilesSelected(e.target.files, 'student');
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
                void handleFilesSelected(e.target.files, 'student');
                e.target.value = '';
              }}
            />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleTriggerInput(studentCameraRef)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 dark:border-purple-400/30 bg-stone-50/80 dark:bg-purple-500/15 px-3 text-xs font-semibold text-stone-700 dark:text-purple-100 transition hover:bg-orange-50/70 hover:border-orange-200 dark:hover:bg-purple-500/25 active:scale-[0.98]"
              >
                <Camera className="h-3.5 w-3.5 text-stone-600 dark:text-fuchsia-300" />
                <span>Add Pic</span>
              </button>
              <button
                type="button"
                onClick={() => handleTriggerInput(studentUploadRef)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 dark:border-purple-400/30 bg-stone-50/80 dark:bg-purple-500/15 px-3 text-xs font-semibold text-stone-700 dark:text-purple-100 transition hover:bg-orange-50/70 hover:border-orange-200 dark:hover:bg-purple-500/25 active:scale-[0.98]"
              >
                <Upload className="h-3.5 w-3.5 text-stone-600 dark:text-fuchsia-300" />
                <span>Upload</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleTriggerInput(studentUploadRef)}
              className="mt-3.5 flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300/90 dark:border-purple-400/35 bg-stone-50/60 dark:bg-[#180c2f]/60 px-4 py-6 text-center transition hover:border-orange-400 dark:hover:border-fuchsia-400/60 hover:bg-orange-50/40 dark:hover:bg-[#1e0f3a]/70"
            >
              <span className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-orange-200/80 dark:border-purple-400/30 bg-orange-50 dark:bg-purple-500/20 text-[#ea580c] dark:text-fuchsia-300 shadow-sm">
                <Camera className="h-5 w-5" />
              </span>
              <span className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-white">
                Tap to take photo or upload pages
              </span>
              <span className="mt-1 text-[11px] sm:text-xs text-stone-500 dark:text-purple-200/70">
                Supports multi-page photos &amp; PDFs • Transcribed when marking starts
              </span>
            </button>

            {studentPages.length > 0 && (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {studentPages.map((page, idx) => (
                  <div
                    key={page.id}
                    className="group relative overflow-hidden rounded-xl border border-stone-200 dark:border-purple-400/30 bg-stone-50 dark:bg-[#1a0d30] p-1"
                  >
                    {page.isPdf ? (
                      <div className="flex h-16 flex-col items-center justify-center text-stone-700 dark:text-purple-200">
                        <FileText className="h-5 w-5 text-[#ea580c] dark:text-fuchsia-300" />
                        <span className="mt-1 truncate px-1 text-[10px] w-full text-center">
                          Page {idx + 1} PDF
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImage({
                            url: page.dataUrl,
                            title: `Student's Answer — Page ${idx + 1} (${page.name})`,
                          })
                        }
                        aria-label={`Preview student answer page ${idx + 1}`}
                        className="relative block w-full overflow-hidden rounded-lg"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={page.dataUrl}
                          alt={`Student answer page ${idx + 1}`}
                          className="h-16 w-full object-cover transition group-hover:scale-105 group-hover:opacity-85"
                        />
                        <span className="pointer-events-none absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-md bg-black/70 text-orange-200 dark:text-fuchsia-200">
                          <Eye className="h-3 w-3" />
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setStudentPages((prev) => prev.filter((item) => item.id !== page.id))
                      }
                      aria-label={`Remove student page ${idx + 1}`}
                      className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-rose-300 hover:bg-rose-600 hover:text-white"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3.5 pt-2 border-t border-stone-200/80 dark:border-purple-500/15">
            <button
              type="button"
              onClick={() => handleToggleText('student')}
              className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-purple-200/80 hover:text-[#ea580c] dark:hover:text-fuchsia-300 transition"
            >
              <Keyboard className="h-3.5 w-3.5" />
              <span>{showStudentText ? 'Hide text box' : 'Or type / paste text'}</span>
            </button>

            {showStudentText && (
              <textarea
                rows={4}
                value={studentText}
                onFocus={() => {
                  if (!user) requireSignedInGate();
                }}
                onChange={(e) => {
                  if (!requireSignedInGate()) return;
                  setStudentText(e.target.value);
                }}
                placeholder="Type or paste the student's Biology 0610 answer here..."
                aria-label="Student's answer text"
                className="mt-2.5 w-full rounded-xl border border-stone-200 dark:border-purple-500/30 bg-stone-50/70 dark:bg-[#1a0d30] p-3 text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-purple-300/40 outline-none focus:border-[#ea580c] dark:focus:border-fuchsia-400"
              />
            )}
          </div>
        </section>

        {/* Card 02: Official Mark Scheme */}
        <section
          aria-label="Official Mark Scheme"
          className="flex flex-col justify-between rounded-2xl border border-stone-200/90 dark:border-purple-500/25 bg-white dark:bg-[#120824]/90 p-4 sm:p-5 shadow-sm shadow-stone-900/5 dark:shadow-purple-950/30 transition-colors"
        >
          <div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-orange-200/90 dark:border-purple-400/30 bg-orange-50 dark:bg-purple-500/20 font-mono text-xs font-bold text-[#ea580c] dark:text-fuchsia-200">
                02
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                  Official Mark Scheme
                </h2>
                <p className="text-xs text-stone-500 dark:text-purple-200/70">
                  Cambridge 0610 rubric points &amp; auto mark detection
                </p>
              </div>
            </div>

            <input
              ref={schemeCameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(e) => {
                void handleFilesSelected(e.target.files, 'mark_scheme');
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
                void handleFilesSelected(e.target.files, 'mark_scheme');
                e.target.value = '';
              }}
            />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleTriggerInput(schemeCameraRef)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 dark:border-purple-400/30 bg-stone-50/80 dark:bg-purple-500/15 px-3 text-xs font-semibold text-stone-700 dark:text-purple-100 transition hover:bg-orange-50/70 hover:border-orange-200 dark:hover:bg-purple-500/25 active:scale-[0.98]"
              >
                <Camera className="h-3.5 w-3.5 text-stone-600 dark:text-fuchsia-300" />
                <span>Add Pic</span>
              </button>
              <button
                type="button"
                onClick={() => handleTriggerInput(schemeUploadRef)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 dark:border-purple-400/30 bg-stone-50/80 dark:bg-purple-500/15 px-3 text-xs font-semibold text-stone-700 dark:text-purple-100 transition hover:bg-orange-50/70 hover:border-orange-200 dark:hover:bg-purple-500/25 active:scale-[0.98]"
              >
                <Upload className="h-3.5 w-3.5 text-stone-600 dark:text-fuchsia-300" />
                <span>Upload</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleTriggerInput(schemeUploadRef)}
              className="mt-3.5 flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300/90 dark:border-purple-400/35 bg-stone-50/60 dark:bg-[#180c2f]/60 px-4 py-6 text-center transition hover:border-orange-400 dark:hover:border-fuchsia-400/60 hover:bg-orange-50/40 dark:hover:bg-[#1e0f3a]/70"
            >
              <span className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-orange-200/80 dark:border-purple-400/30 bg-orange-50 dark:bg-purple-500/20 text-[#ea580c] dark:text-fuchsia-300 shadow-sm">
                <Upload className="h-5 w-5" />
              </span>
              <span className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-white">
                Tap to take photo or upload pages
              </span>
              <span className="mt-1 text-[11px] sm:text-xs text-stone-500 dark:text-purple-200/70">
                Auto-detects total marks &amp; rubric points when marking starts
              </span>
            </button>

            {markSchemePages.length > 0 && (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {markSchemePages.map((page, idx) => (
                  <div
                    key={page.id}
                    className="group relative overflow-hidden rounded-xl border border-stone-200 dark:border-purple-400/30 bg-stone-50 dark:bg-[#1a0d30] p-1"
                  >
                    {page.isPdf ? (
                      <div className="flex h-16 flex-col items-center justify-center text-stone-700 dark:text-purple-200">
                        <FileText className="h-5 w-5 text-[#ea580c] dark:text-fuchsia-300" />
                        <span className="mt-1 truncate px-1 text-[10px] w-full text-center">
                          Scheme {idx + 1} PDF
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImage({
                            url: page.dataUrl,
                            title: `Official Mark Scheme — Page ${idx + 1} (${page.name})`,
                          })
                        }
                        aria-label={`Preview mark scheme page ${idx + 1}`}
                        className="relative block w-full overflow-hidden rounded-lg"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={page.dataUrl}
                          alt={`Official mark scheme page ${idx + 1}`}
                          className="h-16 w-full object-cover transition group-hover:scale-105 group-hover:opacity-85"
                        />
                        <span className="pointer-events-none absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-md bg-black/70 text-orange-200 dark:text-fuchsia-200">
                          <Eye className="h-3 w-3" />
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setMarkSchemePages((prev) => prev.filter((item) => item.id !== page.id))
                      }
                      aria-label={`Remove mark scheme page ${idx + 1}`}
                      className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-rose-300 hover:bg-rose-600 hover:text-white"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3.5 pt-2 border-t border-stone-200/80 dark:border-purple-500/15">
            <button
              type="button"
              onClick={() => handleToggleText('mark_scheme')}
              className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-purple-200/80 hover:text-[#ea580c] dark:hover:text-fuchsia-300 transition"
            >
              <Keyboard className="h-3.5 w-3.5" />
              <span>{showMarkSchemeText ? 'Hide text box' : 'Or type / paste text'}</span>
            </button>

            {showMarkSchemeText && (
              <textarea
                rows={4}
                value={markSchemeText}
                onFocus={() => {
                  if (!user) requireSignedInGate();
                }}
                onChange={(e) => {
                  if (!requireSignedInGate()) return;
                  setMarkSchemeText(e.target.value);
                }}
                placeholder="Paste Cambridge IGCSE Biology (0610) Official Mark Scheme here..."
                aria-label="Official mark scheme text"
                className="mt-2.5 w-full rounded-xl border border-stone-200 dark:border-purple-500/30 bg-stone-50/70 dark:bg-[#1a0d30] p-3 text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-purple-300/40 outline-none focus:border-[#ea580c] dark:focus:border-fuchsia-400"
              />
            )}
          </div>
        </section>
      </div>

      {/* Validation / Quota Error Banner */}
      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs sm:text-sm text-rose-800 dark:text-rose-200"
        >
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-300" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Primary Start Marking CTA */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          disabled={isMarking}
          onClick={() => void handleStartMarking()}
          className="inline-flex h-12 w-full sm:w-auto sm:min-w-[260px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ea580c] to-[#f97316] dark:from-fuchsia-500 dark:via-purple-600 dark:to-indigo-600 px-7 text-sm sm:text-base font-bold text-white shadow-lg shadow-orange-500/25 dark:shadow-fuchsia-500/25 transition hover:opacity-95 active:scale-[0.98] disabled:opacity-60"
        >
          {isMarking ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Transcribing &amp; Marking...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>Start Marking</span>
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <motion.div
          id="grading-results-section"
          ref={resultsSectionRef}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="scroll-mt-24 space-y-4 rounded-2xl border border-stone-200/90 dark:border-purple-500/30 bg-white dark:bg-[#120824]/95 p-4 sm:p-6 shadow-sm shadow-stone-900/5 dark:shadow-2xl dark:shadow-purple-950/50"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 dark:border-purple-500/20 pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-baseline gap-1.5 rounded-2xl border border-orange-200 dark:border-fuchsia-400/40 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-fuchsia-500/20 dark:to-purple-600/25 px-4 py-2.5">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
                  {result.awardedMarks}
                </span>
                <span className="font-mono text-sm sm:text-base font-semibold text-[#c2410c] dark:text-purple-200/80">
                  / {result.totalMarks} marks
                </span>
              </div>

              <div className="rounded-xl border border-orange-200 dark:border-purple-400/30 bg-orange-50 dark:bg-purple-500/15 px-3 py-1.5 font-mono text-sm font-bold text-[#c2410c] dark:text-fuchsia-200">
                {result.percentage}%
              </div>

              {postMarkRemaining !== null && (
                <div
                  id="remaining-questions-badge"
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                    userIsAdmin || postMarkRemaining === Infinity
                      ? 'border-emerald-300 dark:border-emerald-400/40 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                      : postMarkRemaining <= 2
                        ? 'border-amber-300 dark:border-amber-400/40 bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-200'
                        : 'border-orange-200 dark:border-purple-400/30 bg-orange-50 dark:bg-purple-500/15 text-orange-900 dark:text-purple-100'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {userIsAdmin || postMarkRemaining === Infinity
                      ? 'Unlimited access · Admin'
                      : `${postMarkRemaining} ${
                          postMarkRemaining === 1 ? 'question' : 'questions'
                        } left today`}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => void handleSaveCurrentPaper()}
              disabled={paperSaved}
              className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-xs sm:text-sm font-semibold transition ${
                paperSaved
                  ? 'border-emerald-300 dark:border-emerald-400/40 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                  : 'border-stone-200 dark:border-purple-400/35 bg-stone-50 dark:bg-purple-500/15 text-stone-900 dark:text-white hover:bg-orange-50 dark:hover:bg-purple-500/30'
              }`}
            >
              {paperSaved ? (
                <>
                  <BookmarkCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4 text-[#ea580c] dark:text-fuchsia-300" />
                  <span>Save Paper</span>
                </>
              )}
            </button>
          </div>

          {(result.criticalUnitDeducted || result.contradictionTriggered) && (
            <div className="flex flex-wrap gap-2">
              {result.criticalUnitDeducted && (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-400/40 bg-amber-50 dark:bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Critical Unit Rule Applied
                </span>
              )}
              {result.contradictionTriggered && (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-400/40 bg-rose-50 dark:bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-800 dark:text-rose-200">
                  <XCircle className="h-3.5 w-3.5" />
                  Contradiction Rule (CON) Triggered
                </span>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-stone-200 dark:border-purple-500/20 bg-stone-50/80 dark:bg-[#190c2e] p-4">
            <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-[#c2410c] dark:text-fuchsia-300">
              Examiner Summary
            </h3>
            <p className="text-sm leading-relaxed text-stone-800 dark:text-purple-50/90">
              {result.examinerSummary}
            </p>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-purple-200/80">
              Cambridge 0610 Marking Point Breakdown
            </h3>
            <div className="space-y-2">
              {result.rubricBreakdown.map((point) => (
                <div
                  key={point.code}
                  className={`rounded-xl border p-3.5 ${
                    point.status === 'awarded'
                      ? 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-500/10'
                      : point.status === 'contradicted'
                        ? 'border-rose-300 dark:border-rose-500/35 bg-rose-50/80 dark:bg-rose-500/10'
                        : 'border-stone-200 dark:border-purple-500/25 bg-stone-50/70 dark:bg-[#180c2d]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {point.status === 'awarded' ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            point.status === 'contradicted'
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        />
                      )}
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-white">
                          <span className="mr-1.5 font-mono text-[#ea580c] dark:text-fuchsia-300">
                            [{point.code}]
                          </span>
                          {point.criterion}
                        </p>
                        {point.studentEvidence && (
                          <p className="mt-1 text-xs text-stone-700 dark:text-purple-200/80">
                            {point.studentEvidence}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs text-stone-500 dark:text-purple-300/70">
                          {point.examinerNote}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-lg border border-stone-200 dark:border-white/10 bg-white dark:bg-black/30 px-2 py-0.5 font-mono text-xs font-bold text-stone-900 dark:text-white">
                      {point.awardedMarks}/{point.maxMarks}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-stone-200 dark:border-purple-500/20 bg-stone-50/80 dark:bg-[#190c2e] p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#c2410c] dark:text-fuchsia-300">
                Missing Syllabus Keywords &amp; Tip
              </h3>
              {result.missingKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-lg border border-amber-300 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-200"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  All expected Cambridge 0610 keywords were present.
                </p>
              )}
              <p className="border-t border-stone-200 dark:border-purple-500/20 pt-2.5 text-xs sm:text-sm text-stone-700 dark:text-purple-100/85">
                {result.examinerTip}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 dark:border-purple-500/20 bg-stone-50/80 dark:bg-[#190c2e] p-4">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#c2410c] dark:text-fuchsia-300">
                Full-Mark Corrected Answer
              </h3>
              <FormattedContent content={result.correctedVersion} />
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 dark:border-purple-500/25 bg-stone-50/80 dark:bg-[#160a2b] p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-purple-200">
              Ask the Examiner About This Score
            </h3>
            {examinerChat.length > 0 && (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {examinerChat.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-xl px-3.5 py-2.5 text-xs sm:text-sm ${
                      msg.role === 'user'
                        ? 'ml-auto max-w-[85%] bg-[#ea580c] dark:bg-fuchsia-600/25 border border-orange-500/30 dark:border-fuchsia-400/30 text-white'
                        : 'mr-auto max-w-[92%] bg-white dark:bg-[#20103a] border border-stone-200 dark:border-purple-500/25 text-stone-900 dark:text-purple-100'
                    }`}
                  >
                    {msg.role === 'user' ? msg.text : <FormattedContent content={msg.text} />}
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleExaminerFollowUp} className="flex items-center gap-2">
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="Ask why a mark was lost or how to get full marks..."
                aria-label="Ask examiner follow-up question"
                className="h-10 flex-1 min-w-0 rounded-xl border border-stone-200 dark:border-purple-500/30 bg-white dark:bg-[#1d0e36] px-3.5 text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-purple-300/45 outline-none focus:border-[#ea580c] dark:focus:border-fuchsia-400"
              />
              <button
                type="submit"
                disabled={!followUpInput.trim() || isChatting}
                aria-label="Send examiner question"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#ea580c] hover:bg-[#d94d09] dark:bg-purple-600 px-3.5 text-xs sm:text-sm font-semibold text-white dark:hover:bg-purple-500 disabled:opacity-50"
              >
                {isChatting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        </motion.div>
      )}
      <ImagePreviewModal preview={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}
