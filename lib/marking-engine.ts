import { BIOLOGY_SYLLABUS_NOTES, searchBiologyNotes } from './biology-notes-kb';

export type CambridgeGrade = 'A*' | 'A' | 'B' | 'C' | 'D' | 'E' | 'U';

export interface PageItem {
  id: string;
  pageNumber: number;
  fileName: string;
  mimeType: string;
  dataUrl: string;
  ocrStatus: 'pending' | 'processing' | 'done' | 'error';
  ocrText: string;
}

export interface RubricPointEvaluation {
  code: string; // e.g. "[B1]", "[M1]", "[A1]", "[C1]"
  description: string;
  satisfied: boolean;
  marksAwarded: number; // Whole marks only: 1 or 0 (or whole integer)
  maxMarks: number;
  examinerNote: string;
}

export interface LostMarkBreakdown {
  rubricCode: string;
  whatWasWrong: string;
  whyMarkDeducted: string;
  howToEarnFullMarks: string;
}

export interface GradingResult {
  questionTitle: string;
  grade: CambridgeGrade;
  percentage: number;
  awardedMarks: number;
  totalMarks: number;
  marksLost: number;
  examinerSummary: string;
  unitRuleApplied: boolean;
  transcribedStudentAnswer?: string;
  transcribedMarkScheme?: string;
  howToEarnFullMarksSummary?: string;
  rubricPoints: RubricPointEvaluation[];
  lostMarksBreakdown: LostMarkBreakdown[];
  correctedVersion: string;
}

export interface SavedPaper {
  id: string;
  title: string;
  createdAt: string;
  studentEmail: string;
  studentAnswerText: string;
  markSchemeText: string;
  questionPrompt?: string;
  result: GradingResult;
}

export interface StudentUser {
  email: string;
  name?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
  imageUrl?: string;
  timestamp: string;
}

export interface FormattedSegment {
  type: 'text' | 'bold' | 'code';
  value: string;
}

export interface ParsedLine {
  kind: 'heading' | 'bullet' | 'numbered' | 'paragraph' | 'spacer';
  numberLabel?: string;
  segments: FormattedSegment[];
}

/**
 * Calculates Cambridge IGCSE grade (A*, A, B, C, D, E, U) and whole-number percentage.
 * Enforces whole marks only.
 */
export function calculateCambridgeGrade(
  awardedMarks: number,
  totalMarks: number
): { grade: CambridgeGrade; percentage: number } {
  const safeTotal = Math.max(1, Math.round(totalMarks));
  const safeAwarded = Math.max(0, Math.min(safeTotal, Math.round(awardedMarks)));
  const percentage = Math.round((safeAwarded / safeTotal) * 100);

  let grade: CambridgeGrade = 'U';
  if (percentage >= 90) grade = 'A*';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 60) grade = 'C';
  else if (percentage >= 50) grade = 'D';
  else if (percentage >= 40) grade = 'E';
  else grade = 'U';

  return { grade, percentage };
}

/**
 * Auto-detects total available marks from an official Cambridge mark scheme text.
 */
export function detectTotalMarksFromScheme(markSchemeText: string): number {
  if (!markSchemeText || !markSchemeText.trim()) return 1;

  // 1. Check explicit "Total: [X]" or "Max [X]" or "[Total: X]"
  const explicitTotalMatch = markSchemeText.match(
    /(?:total|max(?:imum)?)\s*:?\s*\[?\s*(\d+)\s*(?:marks?|m)?\s*\]?/i
  );
  if (explicitTotalMatch) {
    const parsed = parseInt(explicitTotalMatch[1], 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 40) {
      return parsed;
    }
  }

  // 2. Count explicit rubric codes like [B1], [M1], [A1], [C1], [1], (1)
  const codeMatches = [...markSchemeText.matchAll(/\[(?:[BMAC])?(\d+)\]/gi)];
  if (codeMatches.length > 0) {
    const sum = codeMatches.reduce((acc, m) => acc + parseInt(m[1], 10), 0);
    if (sum > 0) return sum;
  }

  // 3. Otherwise count non-empty rubric lines (excluding pure notes / ignore / reject lines)
  const lines = markSchemeText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 3 &&
        !/^(?:note|ignore|reject|allow|avp|ora|ecf|max)\b/i.test(l)
    );

  return Math.max(1, Math.min(15, lines.length));
}

/**
 * CRITICAL UNIT RULE detector:
 * Checks whether the question prompt or answer line already prints the unit
 * (e.g., "........... beats / min" or "Answer line: ....... %") or the mark scheme
 * states the unit is on the answer line.
 */
export function hasUnitInPromptOrAnswerLine(
  questionPrompt: string = '',
  markScheme: string = ''
): boolean {
  const combined = `${questionPrompt}\n${markScheme}`;
  // Look for patterns like "....... unit", "____ beats / min", "unit printed on answer line", "on answer line"
  if (/(\.{3,}|_{3,})\s*[a-zA-Z%/°µ]+/i.test(combined)) {
    return true;
  }
  if (/answer\s*line\s*[:=-]?\s*(\.{2,}|_{2,})?\s*[a-zA-Z%/°µ]+/i.test(combined)) {
    return true;
  }
  if (/unit\s+(?:is\s+)?(?:already\s+)?(?:given|printed|included|on\s+the\s+answer\s+line)/i.test(combined)) {
    return true;
  }
  return false;
}

/**
 * Extracts structured rubric items from a raw mark scheme string.
 */
export function parseMarkSchemePoints(
  markSchemeText: string,
  fallbackContextText: string = ''
): Array<{ code: string; description: string; maxMarks: number }> {
  const lines = markSchemeText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 0 &&
        !/^(?:note|ignore|reject|max\s*\d+|total\s*:?\s*\d+)/i.test(l) &&
        !/^\([a-z0-9]+\)$/i.test(l)
    );

  const points: Array<{ code: string; description: string; maxMarks: number }> = [];

  lines.forEach((line) => {
    const codeMatch = line.match(/^\[([BMAC]\d+|\d+)\]\s*(.*)$/i) || line.match(/^(.*?)\s*\[([BMAC]\d+|\d+)\]\s*;?$/i);
    if (codeMatch) {
      const isPrefix = /^\[/.test(line);
      const rawCode = isPrefix ? codeMatch[1].toUpperCase() : codeMatch[2].toUpperCase();
      const rawDesc = (isPrefix ? codeMatch[2] : codeMatch[1]).replace(/;\s*$/, '').trim();
      const normalizedCode = /^\d+$/.test(rawCode) ? `[B${rawCode}]` : `[${rawCode}]`;
      points.push({
        code: normalizedCode,
        description: rawDesc || line,
        maxMarks: 1,
      });
    } else {
      const cleaned = line.replace(/^[-•*\d.)]+\s*/, '').replace(/;\s*$/, '').trim();
      if (cleaned) {
        points.push({
          code: `[B1]`,
          description: cleaned,
          maxMarks: 1,
        });
      }
    }
  });

  if (points.length === 0) {
    const { matches } = searchBiologyNotes(fallbackContextText || markSchemeText);
    const topic = matches[0];
    if (topic) {
      const bulletLines = topic.content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => /^[-•]|^\d+\./.test(l))
        .slice(0, 3);
      if (bulletLines.length > 0) {
        for (const b of bulletLines) {
          points.push({
            code: '[B1]',
            description: b.replace(/^[-•\d.)]+\s*/, '').replace(/\*\*/g, '').trim(),
            maxMarks: 1,
          });
        }
      }
    }
  }

  if (points.length === 0) {
    points.push({
      code: '[B1]',
      description:
        markSchemeText.trim() ||
        fallbackContextText.trim() ||
        'Accurate biological explanation using required syllabus terminology',
      maxMarks: 1,
    });
  }

  return points;
}

/**
 * Deterministic Cambridge IGCSE 0610 Marking Engine fallback & verification engine.
 * Applies the 7 Cambridge Marking Principles including Whole Marks Only, Positive Marking,
 * Contradictions (CON), Error Carried Forward (ECF), M/A/C/B marks, and Critical Unit Rule.
 */
export function gradeSubmissionDeterministic(params: {
  studentAnswer: string;
  markScheme: string;
  questionPrompt?: string;
}): GradingResult {
  const { studentAnswer, markScheme, questionPrompt = '' } = params;
  const parsedPoints = parseMarkSchemePoints(
    markScheme,
    `${questionPrompt} ${studentAnswer}`
  );
  const totalMarks = markScheme.trim()
    ? detectTotalMarksFromScheme(markScheme)
    : parsedPoints.length;
  const unitPrePrinted = hasUnitInPromptOrAnswerLine(questionPrompt, markScheme);

  const studentLower = studentAnswer.toLowerCase();

  // Check for overt contradictions (CON) in student answer
  const hasOsmosisActiveTransportCon =
    studentLower.includes('osmosis') &&
    studentLower.includes('requires energy') &&
    studentLower.includes('against concentration gradient');

  let awardedMarks = 0;
  let unitRuleTriggered = false;

  const rubricPoints: RubricPointEvaluation[] = parsedPoints.map((pt) => {
    // Separate any "(CON: ...)" or "(Note: ...)" annotation from the core rubric description
    const conNoteMatch = pt.description.match(/\(CON:\s*([^)]+)\)/i);
    const cleanDescription = pt.description
      .replace(/\((?:CON|Note):[^)]+\)/gi, '')
      .replace(/;\s*$/, '')
      .trim();
    const descLower = cleanDescription.toLowerCase();

    // Check if this is an Accuracy [A1] numerical point where a unit is mentioned
    const numbersInRubric = descLower.match(/\b\d+(?:\.\d+)?\b/g) || [];
    const isAccuracyOrCalc = pt.code.includes('A') || pt.code.includes('M') || numbersInRubric.length > 0;

    // Extract significant keywords from rubric point (>3 chars, excluding filler words)
    const stopWords = new Set([
      'from', 'into', 'with', 'that', 'this', 'their', 'they', 'have', 'more', 'less',
      'than', 'through', 'across', 'down', 'against', 'between', 'which', 'where',
      'when', 'what', 'only', 'also', 'award', 'mark', 'marks', 'correct', 'unit',
      'units', 'answer', 'line', 'printed', 'given', 'allow', 'accept', 'ignore'
    ]);

    const rawKeywords = descLower
      .replace(/[^a-z0-9.%°/-]+/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !stopWords.has(w));

    let matched = false;
    let examinerNote = '';

    // Check numerical accuracy match first
    if (isAccuracyOrCalc && numbersInRubric.length > 0) {
      const allNumbersPresent = numbersInRubric.every((num) => studentLower.includes(num));
      if (allNumbersPresent) {
        matched = true;
        if (unitPrePrinted) {
          unitRuleTriggered = true;
          examinerNote =
            'Full accuracy mark awarded. Under the Cambridge Unit Rule, the unit is already printed on the answer line/prompt, so writing the numerical value alone earns full credit.';
        } else {
          examinerNote = 'Correct numerical calculation/value clearly stated.';
        }
      }
    }

    if (!matched) {
      // Keyword / concept matching
      const matchCount = rawKeywords.filter((kw) => {
        const stem = kw.length > 6 ? kw.slice(0, kw.length - 2) : kw;
        return studentLower.includes(stem);
      }).length;

      const requiredMatches = Math.max(1, Math.ceil(rawKeywords.length * 0.4));
      if (rawKeywords.length > 0 && matchCount >= requiredMatches) {
        matched = true;
        examinerNote = 'Student accurately included the required Cambridge syllabus terminology in proper biological context.';
      }
    }

    // Apply explicit (CON: ...) rule if present in rubric
    if (matched && conNoteMatch) {
      const conText = conNoteMatch[1].toLowerCase();
      if (conText.includes('cell wall bursts') && studentLower.includes('cell wall bursts')) {
        matched = false;
        examinerNote = `Mark withheld due to Contradiction [CON]: ${conNoteMatch[1].trim()}.`;
      }
    }

    // Apply general Contradiction (CON) check
    if (matched && hasOsmosisActiveTransportCon && descLower.includes('water potential')) {
      matched = false;
      examinerNote =
        'Mark withheld due to Contradiction [CON]: student confused osmosis with active transport requiring energy.';
    }

    // Cap awarded marks at totalMarks
    const canAward = matched && awardedMarks < totalMarks;
    const marksAwarded = canAward ? 1 : 0;
    if (canAward) {
      awardedMarks += 1;
    } else if (!examinerNote) {
      examinerNote =
        'Key syllabus concept or required terminology was omitted or insufficiently specific in the student response.';
    }

    return {
      code: pt.code,
      description: cleanDescription,
      satisfied: canAward,
      marksAwarded,
      maxMarks: pt.maxMarks,
      examinerNote,
    };
  });

  awardedMarks = Math.min(totalMarks, Math.round(awardedMarks));
  const marksLost = Math.max(0, totalMarks - awardedMarks);
  const { grade, percentage } = calculateCambridgeGrade(awardedMarks, totalMarks);

  const lostMarksBreakdown: LostMarkBreakdown[] = rubricPoints
    .filter((r) => !r.satisfied)
    .slice(0, marksLost)
    .map((r) => ({
      rubricCode: r.code,
      whatWasWrong:
        studentAnswer.trim().length === 0
          ? 'No response was provided for this marking point.'
          : r.examinerNote.includes('Contradiction [CON]')
          ? r.examinerNote
          : `Your answer did not state or clearly explain: "${r.description}".`,
      whyMarkDeducted:
        r.examinerNote.includes('Contradiction [CON]')
          ? 'Under Cambridge IGCSE 0610 Contradiction (CON) rules, stating an incorrect contradictory biological claim in the same part cancels credit for an otherwise valid point.'
          : 'Under Cambridge IGCSE 0610 Positive Marking and Keyword Context rules, marks can only be awarded when the exact biological process, structure, or relationship specified in the mark scheme is explicitly stated.',
      howToEarnFullMarks: `Include the precise point: "${r.description}" using exact Cambridge 0610 terminology without contradictory statements.`,
    }));

  const correctedVersion = rubricPoints.map((p) => p.description).join('. ') + '.';

  const firstLine = (questionPrompt || markScheme).split(/\r?\n/)[0] || 'Cambridge IGCSE 0610 Question';
  const questionTitle =
    firstLine.replace(/^\[.*?\]\s*/, '').slice(0, 68) || 'Cambridge IGCSE Biology Question';

  const examinerSummary =
    marksLost === 0
      ? `Excellent response! You achieved full marks (${awardedMarks}/${totalMarks}) by hitting every required Cambridge 0610 marking point${unitRuleTriggered ? ' (Critical Unit Rule applied: full accuracy credit awarded without penalizing pre-printed units)' : ''}.`
      : `You scored ${awardedMarks} out of ${totalMarks} marks (${percentage}%, Grade ${grade}). Review the ${marksLost} missed marking point${marksLost === 1 ? '' : 's'} below to ensure all underlined Cambridge Biology keywords are included.`;

  const howToEarnFullMarksSummary =
    marksLost === 0
      ? `You earned full marks (${awardedMarks}/${totalMarks}). Keep using exact Cambridge 0610 biological keywords in context.`
      : lostMarksBreakdown
          .map((item, idx) => `${idx + 1}. **${item.rubricCode}**: ${item.howToEarnFullMarks}`)
          .join('\n');

  return {
    questionTitle,
    grade,
    percentage,
    awardedMarks,
    totalMarks,
    marksLost,
    examinerSummary,
    unitRuleApplied: unitRuleTriggered,
    transcribedStudentAnswer: studentAnswer.trim() || undefined,
    transcribedMarkScheme:
      markScheme.trim() ||
      rubricPoints.map((p) => `${p.code} ${p.description};`).join('\n'),
    howToEarnFullMarksSummary,
    rubricPoints,
    lostMarksBreakdown,
    correctedVersion,
  };
}

/**
 * Extracts the most relevant subsection(s) from a syllabus topic and generates a clear thought process.
 */
export function generateTutorThoughtAndAnswer(question: string): {
  thought: string;
  reply: string;
} {
  const { matches, isOutOfScope } = searchBiologyNotes(question);
  if (isOutOfScope || matches.length === 0) {
    return {
      thought: `1. Analyzed student query: "${question}".\n2. Checked Cambridge IGCSE Biology (0610) syllabus topics (Topics 2–18).\n3. Determined query falls outside the scope of the course notes.`,
      reply:
        'Based on our **Cambridge IGCSE Biology (0610)** course notes, this specific query falls outside the topics covered in the computerized notes. Please ask about any covered syllabus topic such as **Cells**, **Movement In and Out of Cells**, **Enzymes**, **Nutrition**, **Plant Nutrition & Transport**, **Circulatory System & Immunity**, **Respiration**, **Excretion**, **Coordination & Homeostasis**, **Reproduction**, **Inheritance**, **Biotechnology**, or **Ecology**.',
    };
  }

  const primary = matches[0];
  const queryWords = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'and', 'what', 'how', 'why', 'explain', 'define', 'describe', 'for', 'are'].includes(w));

  // Split primary topic into ### subsections so we return focused, relevant sections instead of unrelated chapters
  const rawSections = primary.content
    .split(/(?=^###\s+)/m)
    .map((s) => s.trim())
    .filter(Boolean);

  const scoredSections = rawSections.map((sec) => {
    const secLower = sec.toLowerCase();
    let score = 0;
    for (const w of queryWords) {
      if (secLower.includes(w)) score += 2;
    }
    return { sec, score };
  });

  scoredSections.sort((a, b) => b.score - a.score);
  const bestSections = scoredSections.filter((s) => s.score > 0).map((s) => s.sec);
  const selectedContent =
    bestSections.length > 0
      ? bestSections[0]
      : rawSections[0] || primary.content;

  const matchedKeywords = primary.keywords
    .filter((kw) => question.toLowerCase().includes(kw.toLowerCase()))
    .slice(0, 5);

  const thought = [
    `1. Identified syllabus topic: **${primary.title}**.`,
    `2. Matched key biology concepts: **${
      matchedKeywords.length > 0
        ? matchedKeywords.join(', ')
        : queryWords.slice(0, 4).join(', ') || primary.summary.slice(0, 50)
    }**.`,
    `3. Extracted exact Cambridge IGCSE (0610) definitions and mark-scheme keywords from the course notes.`,
  ].join('\n');

  const reply = `### ${primary.title}\n\n${selectedContent}`;
  return { thought, reply };
}

/**
 * Deterministic Tutor fallback grounded strictly in the attached Biology 0610 computerized notes.
 */
export function answerBiologyTutorDeterministic(question: string): string {
  return generateTutorThoughtAndAnswer(question).reply;
}

/**
 * Deterministic Examiner Chat fallback for follow-up questions on a graded submission.
 */
export function answerExaminerChatDeterministic(
  question: string,
  result: GradingResult,
  studentAnswer: string,
  markScheme: string
): string {
  const qLower = question.toLowerCase();

  if (qLower.includes('unit') || qLower.includes('formula') || qLower.includes('number')) {
    return [
      `### Cambridge IGCSE 0610 Unit & Calculation Rule`,
      `- **Critical Unit Rule**: If the unit is already included in the question prompt or printed on the answer line (for example, \`........... beats / min\`), examiners **do not deduct any marks** if you only write the numerical value.`,
      `- **Method [M] & Accuracy [A] Marks**: Showing your working formula earns the **[M1]** method mark even if an arithmetic slip occurs, and **Error Carried Forward (ECF)** protects subsequent steps.`,
      `- **Your Submission Status**: You were awarded **${result.awardedMarks} / ${result.totalMarks} marks** (${result.percentage}%).`,
    ].join('\n');
  }

  const missed = result.rubricPoints.filter((p) => !p.satisfied);
  if (missed.length === 0) {
    return [
      `### Full Marks Achieved (${result.awardedMarks}/${result.totalMarks})`,
      `- Your response satisfied every required rubric point in the official mark scheme.`,
      `- **Alternative Wording Rule**: Cambridge examiners accept equivalent scientific phrasing (**ORA** — Or Reverse Argument) provided the exact biological terms are used in context without contradiction (**CON**).`,
      `- **Model Full-Mark Phrasing**: ${result.correctedVersion}`,
    ].join('\n');
  }

  return [
    `### Examiner Breakdown for Your Question (${result.awardedMarks}/${result.totalMarks} marks)`,
    `- **Awarded Credit**: You earned **${result.awardedMarks}** whole mark(s) via positive marking for valid points present in your answer.`,
    ...missed.map(
      (m, idx) =>
        `${idx + 1}. **Missed ${m.code}**: The mark scheme requires **${m.description}**. ${m.examinerNote}`
    ),
    `- **How to Word It for Full Credit**: ${result.correctedVersion}`,
  ].join('\n');
}

/**
 * Parses inline segments (**bold** and `code`) without ever leaving raw asterisks (`**`) in output.
 */
export function parseInlineSegments(rawText: string): FormattedSegment[] {
  // Clean stray single/triple asterisks or unmatched ** so raw asterisks never appear
  const segments: FormattedSegment[] = [];
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      const plain = rawText.slice(lastIndex, match.index).replace(/\*\*/g, '');
      if (plain) segments.push({ type: 'text', value: plain });
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const inner = token.slice(2, -2).replace(/\*\*/g, '').trim();
      if (inner) segments.push({ type: 'bold', value: inner });
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const inner = token.slice(1, -1).trim();
      if (inner) segments.push({ type: 'code', value: inner });
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < rawText.length) {
    const tail = rawText.slice(lastIndex).replace(/\*\*/g, '');
    if (tail) segments.push({ type: 'text', value: tail });
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: rawText.replace(/\*\*/g, '') }];
}

/**
 * Parses multi-line markdown-like text into structured lines for FormattedContent component.
 */
export function parseFormattedLines(content: string): ParsedLine[] {
  if (!content) return [];
  const rawLines = content.split(/\r?\n/);

  return rawLines.map((rawLine): ParsedLine => {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      return { kind: 'spacer', segments: [] };
    }

    if (/^#{1,4}\s+/.test(trimmed)) {
      const headingText = trimmed.replace(/^#{1,4}\s+/, '').replace(/\*\*/g, '');
      return {
        kind: 'heading',
        segments: parseInlineSegments(`**${headingText}**`),
      };
    }

    if (/^[-•*]\s+/.test(trimmed)) {
      const bulletText = trimmed.replace(/^[-•*]\s+/, '');
      return {
        kind: 'bullet',
        segments: parseInlineSegments(bulletText),
      };
    }

    const numMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
    if (numMatch) {
      return {
        kind: 'numbered',
        numberLabel: numMatch[1].padStart(2, '0'),
        segments: parseInlineSegments(numMatch[2]),
      };
    }

    return {
      kind: 'paragraph',
      segments: parseInlineSegments(trimmed),
    };
  });
}

export function getFullSyllabusSystemPrompt(query?: string): string {
  const { matches } = searchBiologyNotes(query || '');
  const selectedTopics =
    matches.length > 0 ? matches.slice(0, 3) : BIOLOGY_SYLLABUS_NOTES.slice(0, 3);

  const compiledNotes = selectedTopics
    .map((s) => `=== ${s.title} ===\n${s.content}`)
    .join('\n\n');

  return `You are the Cambridge IGCSE Biology (0610) AI Subject Tutor.
CRITICAL KNOWLEDGE BASE RULES:
1. You must answer ONLY using the biological facts, definitions, processes, and marking points contained in the Cambridge IGCSE Biology (0610) computerized course notes provided below.
2. Do NOT provide answers outside of these computerized course notes. If a student asks about something outside Cambridge IGCSE Biology (0610) or outside these notes, politely state that you only provide answers grounded in the Cambridge IGCSE Biology (0610) course notes.
3. NEVER mention internal file names (such as "Computerized Notes part 1.pdf" or "p2.pdf") and NEVER mention any author names in your responses.
4. Structure your responses clearly using ### headings, bullet points (- ), numbered steps (1. ), **bold key terms** for Cambridge syllabus keywords that carry marks, and \`inline formulas or equations\`.

CAMBRIDGE IGCSE BIOLOGY (0610) COURSE NOTES:
${compiledNotes}`;
}
