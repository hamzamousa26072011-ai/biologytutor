'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn } from 'lucide-react';

export interface PreviewImageData {
  url: string;
  title: string;
}

interface ImagePreviewModalProps {
  preview: PreviewImageData | null;
  onClose: () => void;
}

export default function ImagePreviewModal({ preview, onClose }: ImagePreviewModalProps) {
  useEffect(() => {
    if (!preview) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [preview, onClose]);

  return (
    <AnimatePresence>
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo preview: ${preview.title}`}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-stone-200 dark:border-purple-500/35 bg-white dark:bg-[#120824] shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-stone-200 dark:border-purple-500/20 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <ZoomIn className="h-4 w-4 shrink-0 text-[#ea580c] dark:text-fuchsia-300" />
                <p className="truncate text-xs sm:text-sm font-semibold text-stone-900 dark:text-white">
                  {preview.title}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close photo preview"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 dark:border-purple-500/25 bg-stone-50 dark:bg-purple-500/15 text-stone-700 dark:text-purple-100 hover:bg-orange-50 dark:hover:bg-purple-500/30"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-1 items-center justify-center overflow-auto bg-[#f9f7f4] dark:bg-[#07020f] p-3 sm:p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.url}
                alt={preview.title}
                className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
