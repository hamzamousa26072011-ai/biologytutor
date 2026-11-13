'use client';

import React from 'react';
import { parseFormattedLines } from '@/lib/marking-engine';

interface FormattedContentProps {
  content: string;
  className?: string;
  isTyping?: boolean;
}

const FormattedContent = React.memo(function FormattedContent({
  content,
  className = '',
  isTyping = false,
}: FormattedContentProps) {
  const lines = parseFormattedLines(content);

  if (lines.length === 0) {
    return null;
  }

  const renderTypedText = (text: string, idx: number) => {
    if (!isTyping || idx !== lines.length - 1 || text.length < 4) {
      return text;
    }

    const tailLen = Math.min(16, Math.max(4, Math.floor(text.length * 0.28)));
    const settled = text.slice(0, text.length - tailLen);
    const leadingEdge = text.slice(text.length - tailLen);

    return (
      <>
        {settled}
        <span className="bg-gradient-to-r from-stone-800 via-stone-800/75 to-stone-800/15 dark:from-purple-50 dark:via-purple-50/75 dark:to-purple-50/15 bg-clip-text text-transparent">
          {leadingEdge}
        </span>
      </>
    );
  };

  return (
    <div
      className={`space-y-2.5 text-sm sm:text-[15px] leading-relaxed text-stone-800 dark:text-purple-50/90 ${className}`}
    >
      {lines.map((line, idx) => {
        if (line.type === 'divider') {
          return <hr key={idx} className="my-3 border-stone-200 dark:border-purple-500/20" />;
        }

        if (line.type === 'heading') {
          return (
            <h4
              key={idx}
              className="pt-1.5 text-sm sm:text-base font-semibold tracking-tight text-stone-900 dark:text-fuchsia-200"
            >
              {renderTypedText(line.text, idx)}
            </h4>
          );
        }

        if (line.type === 'numbered') {
          return (
            <div key={idx} className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-flex min-w-[1.5rem] shrink-0 items-center justify-center rounded-md bg-orange-50 dark:bg-fuchsia-500/15 px-1.5 py-0.5 font-mono text-xs font-semibold text-[#c2410c] dark:text-fuchsia-300 border border-orange-200 dark:border-fuchsia-500/25">
                {line.numberLabel}
              </span>
              <p className="flex-1 text-stone-800 dark:text-purple-50/90">
                {renderTypedText(line.text, idx)}
              </p>
            </div>
          );
        }

        if (line.type === 'bullet') {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ea580c] dark:bg-fuchsia-400" />
              <p className="flex-1 text-stone-800 dark:text-purple-50/90">
                {renderTypedText(line.text, idx)}
              </p>
            </div>
          );
        }

        return (
          <p key={idx} className="text-stone-800 dark:text-purple-50/90">
            {renderTypedText(line.text, idx)}
          </p>
        );
      })}
    </div>
  );
});

export default FormattedContent;
