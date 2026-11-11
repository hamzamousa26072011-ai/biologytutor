'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Loader2,
  BrainCircuit,
  ImagePlus,
  X,
} from 'lucide-react';
import { ChatMessage } from '@/lib/marking-engine';
import { FormattedContent } from './FormattedContent';

interface TutorChatTabProps {
  messages: ChatMessage[];
  onSendMessage: (
    message: string,
    imageAttachment?: { dataUrl: string; mimeType: string }
  ) => void;
  onResetChat: () => void;
  isTyping: boolean;
  isDark: boolean;
}

const THINKING_STEPS = [
  'Analyzing question keywords and biological context...',
  'Searching Cambridge IGCSE Biology (0610) course notes...',
  'Formulating structured, mark-scheme-aligned answer...',
];

export function TutorChatTab({
  messages,
  onSendMessage,
  isTyping,
  isDark,
}: TutorChatTabProps) {
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<{
    dataUrl: string;
    mimeType: string;
    name: string;
  } | null>(null);
  const [thinkingStepIdx, setThinkingStepIdx] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isTyping) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (messages.length > 0) {
      lastMessageRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [messages.length, isTyping, thinkingStepIdx]);

  useEffect(() => {
    if (!isTyping) {
      queueMicrotask(() => setThinkingStepIdx(0));
      return;
    }
    const interval = setInterval(() => {
      setThinkingStepIdx((prev) =>
        prev < THINKING_STEPS.length - 1 ? prev + 1 : prev
      );
    }, 450);
    return () => clearInterval(interval);
  }, [isTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage({
        dataUrl: String(reader.result || ''),
        mimeType: file.type || 'image/jpeg',
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachedImage) || isTyping) return;
    onSendMessage(
      input.trim(),
      attachedImage
        ? { dataUrl: attachedImage.dataUrl, mimeType: attachedImage.mimeType }
        : undefined
    );
    setInput('');
    setAttachedImage(null);
  };

  const isEmptyState = messages.length === 0 && !isTyping;

  return (
    <div className="mx-auto flex h-[calc(100dvh-64px)] w-full max-w-6xl min-w-0 flex-col overflow-hidden px-3 py-3 sm:px-6 sm:py-5">
      {/* Main Chat Container filling the Chat Bot area */}
      <div
        className={`flex-1 min-w-0 overflow-y-auto overflow-x-hidden rounded-2xl border p-3.5 sm:p-6 ${
          isEmptyState
            ? 'flex flex-col items-center justify-center'
            : 'space-y-4'
        } ${
          isDark
            ? 'border-purple-500/25 bg-[#0e0b18]/70 backdrop-blur-md'
            : 'border-[#E7E0D6] bg-white shadow-xs'
        }`}
      >
        {isEmptyState ? (
          <div className="flex flex-col items-center justify-center space-y-2.5 px-4 text-center select-none">
            <h2
              className={`text-xl font-bold tracking-tight sm:text-2xl ${
                isDark ? 'text-white' : 'text-[#1C1917]'
              }`}
            >
              Ask anything
            </h2>
            <p
              className={`text-sm sm:text-base ${
                isDark ? 'text-slate-400' : 'text-[#57534E]'
              }`}
            >
              Questions, explanations, revision help. You can attach a picture too.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const isLastMessage = idx === messages.length - 1;

              return (
                <div
                  key={msg.id}
                  ref={isLastMessage ? lastMessageRef : undefined}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl border p-4 ${
                      msg.role === 'user'
                        ? isDark
                          ? 'border-purple-400/40 bg-gradient-to-r from-purple-900/70 to-fuchsia-900/60 text-white'
                          : 'border-[#C85A32]/30 bg-[#C85A32]/10 text-[#1C1917]'
                        : isDark
                        ? 'border-purple-500/30 bg-[#06050b]/90 text-slate-100'
                        : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#1C1917]'
                    }`}
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-4 font-mono text-[10px] font-semibold uppercase opacity-75">
                      <span className="flex items-center gap-1">
                        {msg.role === 'assistant' && (
                          <Sparkles className="h-3 w-3 text-purple-400" />
                        )}
                        {msg.role === 'user' ? 'Student Question' : 'Chat Bot'}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {msg.imageUrl && (
                      <div className="mb-2.5 overflow-hidden rounded-xl border border-current/15">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={msg.imageUrl}
                          alt="Attached biology diagram"
                          className="max-h-56 w-auto object-contain"
                        />
                      </div>
                    )}

                    <FormattedContent content={msg.content} isDark={isDark} />
                  </div>
                </div>
              );
            })}

            {/* Live Thinking / Thought Process Display while getting the answer */}
            {isTyping && (
              <div className="flex flex-col items-start">
                <div
                  className={`w-full max-w-xl rounded-2xl border p-4 ${
                    isDark
                      ? 'border-purple-500/35 bg-[#06050b]/95 text-purple-100 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                      : 'border-[#E7E0D6] bg-[#F8F6F1] text-[#1C1917]'
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                    <Loader2
                      className={`h-4 w-4 animate-spin ${
                        isDark ? 'text-fuchsia-400' : 'text-[#C85A32]'
                      }`}
                    />
                    <BrainCircuit
                      className={`h-4 w-4 ${
                        isDark ? 'text-purple-400' : 'text-[#9C3814]'
                      }`}
                    />
                    <span
                      className={isDark ? 'text-purple-200' : 'text-[#9C3814]'}
                    >
                      Thinking...
                    </span>
                  </div>

                  <div className="space-y-1.5 pl-1">
                    {THINKING_STEPS.slice(0, thinkingStepIdx + 1).map(
                      (stepText, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 text-xs ${
                            idx === thinkingStepIdx
                              ? isDark
                                ? 'font-semibold text-purple-200'
                                : 'font-semibold text-[#1C1917]'
                              : isDark
                              ? 'text-slate-400'
                              : 'text-[#57534E]'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              idx === thinkingStepIdx
                                ? isDark
                                  ? 'animate-ping bg-fuchsia-400'
                                  : 'animate-ping bg-[#C85A32]'
                                : isDark
                                ? 'bg-purple-400/60'
                                : 'bg-[#2D6A4F]'
                            }`}
                          />
                          <span>{stepText}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Attached Picture Preview Pill */}
      {attachedImage && (
        <div
          className={`mt-2 flex items-center justify-between gap-2 self-start rounded-xl border px-3 py-1.5 text-xs ${
            isDark
              ? 'border-purple-500/35 bg-[#0e0b18] text-purple-200'
              : 'border-[#E7E0D6] bg-white text-[#1C1917]'
          }`}
        >
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachedImage.dataUrl}
              alt="Preview"
              className="h-7 w-7 rounded object-cover"
            />
            <span className="max-w-[200px] truncate font-medium">
              {attachedImage.name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            aria-label="Remove attached picture"
            className="rounded p-0.5 hover:bg-rose-500/20 hover:text-rose-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Bottom Message Input Form with Picture Attachment */}
      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach a picture"
          aria-label="Attach a picture"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${
            isDark
              ? 'border-purple-500/35 bg-[#0e0b18] text-purple-300 hover:border-purple-400 hover:bg-purple-950/60'
              : 'border-[#E7E0D6] bg-white text-[#9C3814] hover:border-[#C85A32] hover:bg-[#F8F6F1]'
          }`}
        >
          <ImagePlus className="h-5 w-5" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask any Cambridge IGCSE Biology (0610) question..."
          className={`flex-1 rounded-xl border px-4 py-3 text-base sm:text-sm focus:outline-none ${
            isDark
              ? 'border-purple-500/35 bg-[#0e0b18] text-white placeholder-slate-500 focus:border-purple-400'
              : 'border-[#E7E0D6] bg-white text-[#1C1917] placeholder-stone-400 focus:border-[#C85A32]'
          }`}
        />
        <button
          type="submit"
          disabled={(!input.trim() && !attachedImage) || isTyping}
          className={`flex items-center gap-1.5 rounded-xl px-5 py-3 text-xs font-bold text-white transition-all disabled:opacity-50 ${
            isDark
              ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-[0_0_18px_rgba(168,85,247,0.4)] hover:brightness-110'
              : 'bg-[#C85A32] hover:bg-[#9C3814]'
          }`}
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}
