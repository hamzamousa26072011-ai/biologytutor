'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Bot, Eye, ImagePlus, Send, Sparkles, Square, User, X } from 'lucide-react';
import FormattedContent from './FormattedContent';
import ImagePreviewModal, { PreviewImageData } from './ImagePreviewModal';
import { computeTypewriterAdvance, stripMarkdown } from '@/lib/marking-engine';

interface AttachedImage {
  id: string;
  name: string;
  mimeType: string;
  dataUrl: string;
  base64Data: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: AttachedImage[];
  topics?: string[];
  isStreaming?: boolean;
}

const STARTER_TOPICS = [
  'Explain osmosis using water potential',
  'Why do enzymes denature above optimum temperature?',
  'Why is the left ventricle wall thicker than the right?',
  'Explain eutrophication step by step for 4 marks',
];

async function compressChatImage(file: File, seq: number): Promise<AttachedImage> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });

  if (typeof document === 'undefined') {
    return {
      id: `chat-img-${seq}`,
      name: file.name || `Picture ${seq}`,
      mimeType: file.type || 'image/jpeg',
      dataUrl: rawDataUrl,
      base64Data: rawDataUrl.split(',')[1] || '',
    };
  }

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Image decode failed'));
      el.src = rawDataUrl;
    });

    const maxDim = 1280;
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;

    if (width > maxDim || height > maxDim) {
      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.max(1, Math.round(width * ratio));
      height = Math.max(1, Math.round(height * ratio));
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return {
        id: `chat-img-${seq}`,
        name: file.name || `Picture ${seq}`,
        mimeType: file.type || 'image/jpeg',
        dataUrl: rawDataUrl,
        base64Data: rawDataUrl.split(',')[1] || '',
      };
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const compressedUrl = canvas.toDataURL('image/jpeg', 0.82);

    return {
      id: `chat-img-${seq}`,
      name: file.name || `Picture ${seq}`,
      mimeType: 'image/jpeg',
      dataUrl: compressedUrl,
      base64Data: compressedUrl.split(',')[1] || '',
    };
  } catch {
    return {
      id: `chat-img-${seq}`,
      name: file.name || `Picture ${seq}`,
      mimeType: file.type || 'image/jpeg',
      dataUrl: rawDataUrl,
      base64Data: rawDataUrl.split(',')[1] || '',
    };
  }
}

export default function TutorChatTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pendingImages, setPendingImages] = useState<AttachedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<PreviewImageData | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const typingRafRef = useRef<number | null>(null);
  const seqRef = useRef(0);

  const scrollToBottom = (smooth = true) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  useEffect(() => {
    if (messages.length > 0) {
      const rafId = window.requestAnimationFrame(() => scrollToBottom(true));
      return () => window.cancelAnimationFrame(rafId);
    }
  }, [messages.length]);

  useEffect(() => {
    fetch('/api/tutor', { method: 'GET' }).catch(() => {});
    return () => {
      abortControllerRef.current?.abort();
      if (typingRafRef.current !== null) {
        window.cancelAnimationFrame(typingRafRef.current);
      }
    };
  }, []);

  const handleStopGeneration = () => {
    abortControllerRef.current?.abort();
    if (typingRafRef.current !== null) {
      window.cancelAnimationFrame(typingRafRef.current);
      typingRafRef.current = null;
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.isStreaming
          ? {
              ...m,
              content: m.content || 'Generation stopped.',
              isStreaming: false,
            }
          : m
      )
    );
    setIsLoading(false);
  };

  const handleAttachImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, 6);
    if (imageFiles.length === 0) return;

    const loaded = await Promise.all(
      imageFiles.map((file) => compressChatImage(file, ++seqRef.current))
    );

    if (loaded.length > 0) {
      setPendingImages((prev) => [...prev, ...loaded].slice(0, 6));
    }
  };

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if ((!trimmed && pendingImages.length === 0) || isLoading) return;

    abortControllerRef.current?.abort();
    if (typingRafRef.current !== null) {
      window.cancelAnimationFrame(typingRafRef.current);
      typingRafRef.current = null;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const imagesToSend = [...pendingImages];
    const userMsg: ChatMessage = {
      id: `u-${++seqRef.current}`,
      role: 'user',
      content: trimmed || 'Attached Biology picture',
      images: imagesToSend,
    };

    const assistantId = `a-${++seqRef.current}`;
    const placeholderAssistant: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      topics: [],
      isStreaming: true,
    };

    const historyPayload = [...messages, userMsg].slice(-4).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMsg, placeholderAssistant]);
    setInput('');
    setPendingImages([]);
    setIsLoading(true);

    let targetClean = '';
    let displayedLen = 0;
    let streamComplete = false;
    let latestTopics: string[] = [];

    const applyDisplayedText = (text: string, finished: boolean) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: text,
                topics: latestTopics.length > 0 ? latestTopics : m.topics,
                isStreaming: !finished,
              }
            : m
        )
      );
      if (scrollContainerRef.current) {
        const el = scrollContainerRef.current;
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 180;
        if (nearBottom) {
          el.scrollTop = el.scrollHeight;
        }
      }
    };

    const stepTypewriter = () => {
      if (controller.signal.aborted) {
        typingRafRef.current = null;
        return;
      }

      if (displayedLen < targetClean.length) {
        displayedLen = computeTypewriterAdvance(displayedLen, targetClean.length, streamComplete);
        const visibleText = targetClean.slice(0, displayedLen);
        const finished = streamComplete && displayedLen >= targetClean.length;
        applyDisplayedText(visibleText, finished);

        if (!finished) {
          typingRafRef.current = window.requestAnimationFrame(stepTypewriter);
          return;
        }
        typingRafRef.current = null;
        return;
      }

      if (streamComplete) {
        applyDisplayedText(targetClean, true);
        typingRafRef.current = null;
        return;
      }

      typingRafRef.current = null;
    };

    const ensureTypingLoop = () => {
      if (controller.signal.aborted) return;
      if (displayedLen === 0 && targetClean.length > 0) {
        displayedLen = computeTypewriterAdvance(0, targetClean.length, streamComplete);
        const finished = streamComplete && displayedLen >= targetClean.length;
        applyDisplayedText(targetClean.slice(0, displayedLen), finished);
        if (finished) {
          typingRafRef.current = null;
          return;
        }
      }
      if (typingRafRef.current === null && (displayedLen < targetClean.length || streamComplete)) {
        typingRafRef.current = window.requestAnimationFrame(stepTypewriter);
      }
    };

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question: trimmed,
          stream: true,
          images: imagesToSend.map((img) => ({
            mimeType: img.mimeType,
            base64Data: img.base64Data,
            label: img.name,
          })),
          history: historyPayload,
        }),
      });

      const contentType = res.headers.get('content-type') || '';

      if (!res.body || !contentType.includes('application/x-ndjson')) {
        const data = await res.json();
        targetClean = stripMarkdown(
          data.answer ||
            'I could not generate an answer right now. Please try asking another Cambridge 0610 question.'
        );
        latestTopics = Array.isArray(data.matchedTopics) ? data.matchedTopics : [];
        streamComplete = true;
        ensureTypingLoop();
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let rawStreamBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;
          try {
            const event = JSON.parse(cleanLine) as {
              type?: string;
              matchedTopics?: string[];
              text?: string;
              answer?: string;
            };
            if (event.type === 'meta' && Array.isArray(event.matchedTopics)) {
              latestTopics = event.matchedTopics;
            } else if (event.type === 'delta' && event.text) {
              rawStreamBuffer += event.text;
              targetClean = stripMarkdown(rawStreamBuffer);
              ensureTypingLoop();
            } else if (event.type === 'done' && typeof event.answer === 'string') {
              targetClean = stripMarkdown(event.answer);
              if (displayedLen > targetClean.length) {
                displayedLen = targetClean.length;
              }
              ensureTypingLoop();
            }
          } catch {
            // Ignore malformed partial line
          }
        }
      }

      if (!targetClean.trim()) {
        targetClean =
          'I could not generate an answer right now. Please try asking another Cambridge 0610 question.';
      }
      streamComplete = true;
      ensureTypingLoop();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      targetClean = 'Connection issue while contacting Biology DA7EE7. Please try again.';
      streamComplete = true;
      ensureTypingLoop();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendQuestion(input);
  };

  return (
    <>
      <section
        aria-label="Biology DA7EE7 Chat Bot"
        className="flex h-[calc(100dvh-148px)] sm:h-[calc(100dvh-116px)] min-h-[440px] max-h-[760px] flex-col rounded-2xl border border-stone-200/90 dark:border-purple-500/25 bg-white dark:bg-[#120824]/90 shadow-sm shadow-stone-900/5 dark:shadow-xl dark:shadow-purple-950/40 overflow-hidden transition-colors"
      >
        {/* Tutor Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 dark:border-purple-500/20 bg-stone-50/75 dark:bg-[#170b2d]/90 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-orange-200 dark:border-fuchsia-400/35 bg-orange-50 dark:bg-fuchsia-500/20 text-[#ea580c] dark:text-fuchsia-300">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                Biology DA7EE7
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-purple-200/75">
                Cambridge IGCSE Biology (0610) • Strictly Syllabus Grounded
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg border border-stone-200 dark:border-purple-400/25 bg-white dark:bg-purple-500/15 px-2.5 py-1 text-[11px] font-medium text-stone-700 dark:text-purple-200">
            <Sparkles className="h-3.5 w-3.5 text-[#ea580c] dark:text-fuchsia-300" />
            0610 Notes Engine
          </span>
        </div>

        {/* Scrollable Messages or Clean Empty State */}
        <div
          ref={scrollContainerRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5 flex flex-col"
        >
          {messages.length === 0 ? (
            <div className="my-auto flex flex-col items-center justify-center px-4 py-8 text-center">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
                Ask anything
              </h3>
              <p className="mt-2 max-w-md text-xs sm:text-sm text-stone-500 dark:text-purple-200/70">
                Questions, explanations, revision help. You can attach a picture too.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 460, damping: 32 }}
                    className={`flex items-start gap-2.5 sm:gap-3 ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                        isUser
                          ? 'border-orange-200 dark:border-purple-400/30 bg-orange-50 dark:bg-purple-600/30 text-[#c2410c] dark:text-purple-100'
                          : 'border-orange-200 dark:border-fuchsia-400/35 bg-orange-50 dark:bg-fuchsia-500/20 text-[#ea580c] dark:text-fuchsia-300'
                      }`}
                    >
                      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>

                    <div
                      className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 ${
                        isUser
                          ? 'bg-gradient-to-br from-[#ea580c] to-[#f97316] dark:from-fuchsia-600/35 dark:to-purple-700/40 border border-orange-400/40 dark:border-fuchsia-400/30 text-white shadow-sm'
                          : 'bg-stone-50/90 dark:bg-[#1b0e33] border border-stone-200 dark:border-purple-500/25 text-stone-900 dark:text-purple-50'
                      }`}
                    >
                      {isUser ? (
                        <div className="space-y-2.5">
                          {msg.images && msg.images.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {msg.images.map((img) => (
                                <button
                                  key={img.id}
                                  type="button"
                                  onClick={() =>
                                    setPreviewImage({ url: img.dataUrl, title: img.name })
                                  }
                                  aria-label={`Preview ${img.name}`}
                                  className="group relative overflow-hidden rounded-xl border border-white/40 dark:border-fuchsia-300/40 bg-black/25"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={img.dataUrl}
                                    alt={img.name}
                                    className="h-20 w-24 object-cover transition group-hover:scale-105"
                                  />
                                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                                    <Eye className="h-4 w-4 text-white" />
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                          <p className="text-sm sm:text-[15px] leading-relaxed">{msg.content}</p>
                        </div>
                      ) : (
                        <>
                          {msg.isStreaming && !msg.content ? (
                            <div
                              role="status"
                              aria-label="Biology DA7EE7 is generating an answer"
                              className="inline-flex items-center gap-1.5 py-1.5 px-1"
                            >
                              {[0, 1, 2].map((dotIdx) => (
                                <motion.span
                                  key={dotIdx}
                                  className="h-2 w-2 rounded-full bg-[#ea580c] dark:bg-white/90"
                                  animate={{
                                    y: [0, -4, 0],
                                    scale: [0.85, 1.15, 0.85],
                                    opacity: [0.45, 1, 0.45],
                                  }}
                                  transition={{
                                    duration: 0.75,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: dotIdx * 0.14,
                                  }}
                                />
                              ))}
                            </div>
                          ) : (
                            <FormattedContent content={msg.content} isTyping={msg.isStreaming} />
                          )}
                          {!msg.isStreaming && msg.topics && msg.topics.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-stone-200 dark:border-purple-500/20 pt-2.5">
                              {msg.topics.map((topic) => (
                                <span
                                  key={topic}
                                  className="rounded-md border border-stone-200 dark:border-purple-400/25 bg-white dark:bg-purple-500/15 px-2 py-0.5 text-[11px] font-medium text-stone-700 dark:text-purple-200"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Starter Chips, Staged Picture Previews & Input Bar */}
        <div className="border-t border-stone-200 dark:border-purple-500/20 bg-stone-50/75 dark:bg-[#150929]/95 p-3 sm:p-4 space-y-2.5">
          {pendingImages.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {pendingImages.map((img) => (
                <div
                  key={img.id}
                  className="group relative shrink-0 overflow-hidden rounded-xl border border-orange-300 dark:border-fuchsia-400/40 bg-white dark:bg-[#1d0f38]"
                >
                  <button
                    type="button"
                    onClick={() => setPreviewImage({ url: img.dataUrl, title: img.name })}
                    aria-label={`Preview attached image ${img.name}`}
                    className="block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="h-14 w-16 object-cover transition group-hover:opacity-80"
                    />
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                      <Eye className="h-4 w-4 text-white drop-shadow" />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPendingImages((prev) => prev.filter((item) => item.id !== img.id))
                    }
                    aria-label={`Remove attached image ${img.name}`}
                    className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/80 text-rose-300 hover:bg-rose-600 hover:text-white"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {STARTER_TOPICS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={isLoading}
                onClick={() => void sendQuestion(prompt)}
                className="shrink-0 rounded-xl border border-stone-200 dark:border-purple-500/25 bg-white dark:bg-[#1d0f38] px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-purple-200 transition hover:border-orange-300 hover:bg-orange-50/70 dark:hover:border-fuchsia-400 dark:hover:bg-purple-500/20 whitespace-nowrap active:scale-[0.98]"
              >
                {prompt}
              </button>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              void handleAttachImages(e.target.files);
              e.target.value = '';
            }}
          />

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach picture to chat"
              title="Attach a Biology diagram or question picture"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-stone-200 dark:border-purple-500/35 bg-white dark:bg-[#1a0d30] text-stone-700 dark:text-purple-200 transition hover:border-orange-300 hover:bg-orange-50/70 dark:hover:border-fuchsia-500 dark:hover:bg-purple-500/20 active:scale-[0.97] disabled:opacity-50"
            >
              <ImagePlus className="h-5 w-5" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask any Cambridge IGCSE Biology (0610) question..."
              aria-label="Ask Biology DA7EE7 a question"
              className="h-11 flex-1 min-w-0 rounded-xl border border-stone-200 dark:border-purple-500/30 bg-white dark:bg-[#1a0d30] px-3.5 text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-purple-300/45 outline-none focus:border-[#ea580c] dark:focus:border-fuchsia-400"
            />

            {isLoading || messages.some((m) => m.isStreaming) ? (
              <button
                type="button"
                onClick={handleStopGeneration}
                aria-label="Stop generating answer"
                title="Stop generating"
                className="inline-flex h-11 w-11 sm:w-auto sm:px-4 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-stone-900 dark:bg-white text-sm font-semibold text-white dark:text-slate-950 shadow-md transition hover:opacity-90 active:scale-[0.97]"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() && pendingImages.length === 0}
                aria-label="Send question to Biology DA7EE7"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#f97316] dark:from-fuchsia-500 dark:to-purple-600 px-4 text-sm font-semibold text-white shadow-md shadow-orange-500/20 dark:shadow-lg dark:shadow-fuchsia-500/25 transition hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Ask</span>
              </button>
            )}
          </form>
        </div>
      </section>

      <ImagePreviewModal preview={previewImage} onClose={() => setPreviewImage(null)} />
    </>
  );
}
