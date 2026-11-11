'use client';

import React from 'react';
import { parseFormattedLines, FormattedSegment } from '@/lib/marking-engine';

interface FormattedContentProps {
  content: string;
  isDark: boolean;
  className?: string;
}

export function FormattedContent({
  content,
  isDark,
  className = '',
}: FormattedContentProps) {
  const lines = parseFormattedLines(content);

  const renderSegments = (segments: FormattedSegment[]) =>
    segments.map((seg, i) => {
      if (seg.type === 'bold') {
        return (
          <strong
            key={i}
            className={
              isDark
                ? 'font-semibold text-purple-300'
                : 'font-semibold text-[#9C3814]'
            }
          >
            {seg.value}
          </strong>
        );
      }
      if (seg.type === 'code') {
        return (
          <code
            key={i}
            className={`mx-0.5 rounded px-1.5 py-0.5 font-mono text-[0.85em] font-medium ${
              isDark
                ? 'border border-purple-500/30 bg-purple-950/60 text-fuchsia-200'
                : 'border border-[#E7E0D6] bg-[#F3EFE6] text-[#9C3814]'
            }`}
          >
            {seg.value}
          </code>
        );
      }
      return <React.Fragment key={i}>{seg.value}</React.Fragment>;
    });

  return (
    <div className={`space-y-2 leading-relaxed ${className}`}>
      {lines.map((line, idx) => {
        if (line.kind === 'spacer') {
          return <div key={idx} className="h-1.5" />;
        }

        if (line.kind === 'heading') {
          return (
            <h4
              key={idx}
              className={`pt-1.5 text-sm font-bold tracking-tight sm:text-base ${
                isDark ? 'text-purple-200' : 'text-[#9C3814]'
              }`}
            >
              {renderSegments(line.segments)}
            </h4>
          );
        }

        if (line.kind === 'bullet') {
          return (
            <div key={idx} className="flex items-start gap-2.5 text-sm">
              <span
                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                  isDark
                    ? 'bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.85)]'
                    : 'bg-[#C85A32]'
                }`}
              />
              <div
                className={`flex-1 ${
                  isDark ? 'text-slate-200' : 'text-[#1C1917]'
                }`}
              >
                {renderSegments(line.segments)}
              </div>
            </div>
          );
        }

        if (line.kind === 'numbered') {
          return (
            <div key={idx} className="flex items-start gap-2.5 text-sm">
              <span
                className={`mt-0.5 inline-flex shrink-0 items-center justify-center rounded px-1.5 py-0.5 font-mono text-[11px] font-bold ${
                  isDark
                    ? 'border border-purple-500/40 bg-purple-900/50 text-purple-200'
                    : 'border border-[#E7E0D6] bg-[#EAF2EC] text-[#2D6A4F]'
                }`}
              >
                {line.numberLabel}
              </span>
              <div
                className={`flex-1 ${
                  isDark ? 'text-slate-200' : 'text-[#1C1917]'
                }`}
              >
                {renderSegments(line.segments)}
              </div>
            </div>
          );
        }

        return (
          <p
            key={idx}
            className={`text-sm ${
              isDark ? 'text-slate-200' : 'text-[#1C1917]'
            }`}
          >
            {renderSegments(line.segments)}
          </p>
        );
      })}
    </div>
  );
}
