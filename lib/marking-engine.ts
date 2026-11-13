import { BIOLOGY_SYLLABUS_NOTES, searchBiologyNotes } from './biology-notes-kb';

export const ADMIN_EMAIL = 'hamzamousa26072011@gmail.com';
export const MAX_DAILY_QUESTIONS = 10;

export function isAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

export type MarkPointStatus = 'awarded' | 'missed' | 'contradicted';

export interface RubricPointEvaluation {
  code: string;
  criterion: string;
  maxMarks: number;
  awardedMarks: number;
  status: MarkPointStatus;
  studentEvidence: string;
  examinerNote: string;
}

export interface GradingResult {
  awardedMarks: number;
  totalMarks: number;
  percentage: number;
  criticalUnitDeducted: boolean;
  contradictionTriggered: boolean;
  extractedStudentAnswer?: string;
  extractedMarkScheme?: string;
  rubricBreakdown: RubricPointEvaluation[];
  examinerSummary: string;
  correctedVersion: string;
  missingKeywords: string[];
  examinerTip: string;
}

export interface SubmissionMetadata {
  studentFileCount?: number;
  markSchemeFileCount?: number;
  usedOcr?: boolean;
}

export interface FormattedLine {
  type: 'heading' | 'bullet' | 'numbered' | 'paragraph' | 'divider';
  text: string;
  numberLabel?: string;
}

export interface UserDailyQuotaStatus {
  allowed: boolean;
  used: number;
  remaining: number;
  max: number;
  isAdmin: boolean;
  reason?: string;
}

export function getTodayDateKey(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRemainingDailyQuestions(
  usageByEmailDate: Record<string, number> | undefined | null,
  userEmail?: string | null,
  dateKey: string = getTodayDateKey()
): number {
  if (!userEmail) return 0;
  if (isAdminEmail(userEmail)) return Infinity;
  const normalizedKey = `${userEmail.trim().toLowerCase()}::${dateKey}`;
  const used = Math.max(0, Math.floor(usageByEmailDate?.[normalizedKey] ?? 0));
  return Math.max(0, MAX_DAILY_QUESTIONS - used);
}

export function canUserGradeQuestion(
  usageByEmailDate: Record<string, number> | undefined | null,
  userEmail?: string | null,
  dateKey: string = getTodayDateKey()
): UserDailyQuotaStatus {
  if (!userEmail || !userEmail.trim()) {
    return {
      allowed: false,
      used: 0,
      remaining: 0,
      max: MAX_DAILY_QUESTIONS,
      isAdmin: false,
      reason: 'Sign in with Google or your email to access Paper Correction.',
    };
  }

  const normalizedKey = `${userEmail.trim().toLowerCase()}::${dateKey}`;
  const used = Math.max(0, Math.floor(usageByEmailDate?.[normalizedKey] ?? 0));

  if (isAdminEmail(userEmail)) {
    return {
      allowed: true,
      used,
      remaining: Infinity,
      max: Infinity,
      isAdmin: true,
    };
  }

  const remaining = Math.max(0, MAX_DAILY_QUESTIONS - used);
  if (remaining <= 0) {
    return {
      allowed: false,
      used,
      remaining: 0,
      max: MAX_DAILY_QUESTIONS,
      isAdmin: false,
      reason: 'You have reached your daily limit of 10 questions for today. Come back tomorrow.',
    };
  }

  return {
    allowed: true,
    used,
    remaining,
    max: MAX_DAILY_QUESTIONS,
    isAdmin: false,
  };
}

export function stripMarkdown(input: string): string {
  if (!input) return '';
  return input
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .trim();
}

export function parseFormattedLines(rawText: string): FormattedLine[] {
  if (!rawText || typeof rawText !== 'string') return [];

  const cleaned = rawText.replace(/\r\n/g, '\n').trim();
  if (!cleaned) return [];

  const lines = cleaned.split('\n');
  const result: FormattedLine[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    if (/^[-_*]{3,}$/.test(trimmed)) {
      result.push({ type: 'divider', text: '' });
      continue;
    }

    const headingMatch = trimmed.match(/^#{1,4}\s+(.+)$/);
    if (headingMatch) {
      result.push({ type: 'heading', text: stripMarkdown(headingMatch[1]) });
      continue;
    }

    const boldTitleMatch = trimmed.match(/^\*\*([^*]{2,90})\*\*:?$/);
    if (boldTitleMatch) {
      result.push({ type: 'heading', text: boldTitleMatch[1].trim() });
      continue;
    }

    const numberedMatch = trimmed.match(/^(\d+[.)])\s+(.+)$/);
    if (numberedMatch) {
      result.push({
        type: 'numbered',
        numberLabel: numberedMatch[1],
        text: stripMarkdown(numberedMatch[2]),
      });
      continue;
    }

    const bulletMatch = trimmed.match(/^[-•*]\s+(.+)$/);
    if (bulletMatch) {
      result.push({
        type: 'bullet',
        text: stripMarkdown(bulletMatch[1]),
      });
      continue;
    }

    result.push({
      type: 'paragraph',
      text: stripMarkdown(trimmed),
    });
  }

  return result;
}

export function detectTotalMarksFromMarkScheme(markSchemeText: string): number {
  if (!markSchemeText || !markSchemeText.trim()) return 0;

  // Look for explicit "[Total: N]" or "[N marks]" or "(N marks)"
  const bracketTotals = Array.from(
    markSchemeText.matchAll(/(?:\[\s*(?:total\s*:?\s*)?(\d{1,2})\s*(?:marks?)?\s*\]|\(\s*(\d{1,2})\s*marks?\s*\))/gi)
  ).map((m) => Number(m[1] || m[2]));

  // Look for max markers like "max 4" or "[max 3]"
  const maxMatches = Array.from(markSchemeText.matchAll(/\bmax(?:imum)?\s*[:=]?\s*(\d{1,2})\b/gi)).map((m) =>
    Number(m[1])
  );

  // Count numbered or semicolon-separated marking points
  const lines = markSchemeText
    .split(/\r?\n|;/)
    .map((l) => l.trim())
    .filter((l) => l.length > 4 && !/^(total|max|accept|ignore|reject|allow|ora|avp)\b/i.test(l));

  // If explicit bracketed [N] sum makes sense: e.g. "[3]" or "[Total: 6]"
  if (bracketTotals.length === 1 && bracketTotals[0] >= 1 && bracketTotals[0] <= 25) {
    if (maxMatches.length > 0 && maxMatches[0] > 0 && maxMatches[0] <= bracketTotals[0]) {
      return maxMatches[0];
    }
    return bracketTotals[0];
  }

  if (maxMatches.length > 0 && maxMatches[0] >= 1 && maxMatches[0] <= 25) {
    return maxMatches[0];
  }

  const standaloneOneMarkers = bracketTotals.filter((n) => n === 1).length;
  if (standaloneOneMarkers >= 2) {
    return standaloneOneMarkers;
  }

  const totalMarkerMatch = markSchemeText.match(/\btotal\s*[:=]\s*(\d{1,2})\b/i);
  if (totalMarkerMatch) {
    const val = Number(totalMarkerMatch[1]);
    if (val >= 1 && val <= 30) return val;
  }

  if (lines.length >= 1) {
    return Math.min(20, lines.length);
  }

  return 1;
}

interface ParsedRubricPoint {
  code: string;
  criterion: string;
  keywords: string[];
  requiredUnits: string[];
  forbiddenContradictions: string[];
  maxMarks: number;
}

function extractKeywordsFromCriterion(criterion: string): string[] {
  const stopWords = new Set([
    'that',
    'this',
    'with',
    'from',
    'into',
    'onto',
    'over',
    'under',
    'between',
    'through',
    'against',
    'down',
    'more',
    'less',
    'high',
    'higher',
    'low',
    'lower',
    'than',
    'then',
    'when',
    'where',
    'which',
    'because',
    'causes',
    'allow',
    'accept',
    'ignore',
    'reject',
    'mark',
    'marks',
    'point',
    'only',
    'both',
    'idea',
    'reference',
    'mention',
    'statement',
    'described',
    'correct',
  ]);

  const words = criterion
    .toLowerCase()
    .replace(/[^a-z0-9\s%°/\-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));

  return Array.from(new Set(words));
}

function detectUnitsInText(text: string): string[] {
  const unitPatterns: Array<{ regex: RegExp; canonical: string }> = [
    { regex: /\b\d+(?:\.\d+)?\s*(?:um|µm|micrometre|micrometres|micrometer|micrometers)\b/gi, canonical: 'µm' },
    { regex: /\b\d+(?:\.\d+)?\s*(?:mm|millimetre|millimetres|millimeter|millimeters)\b/gi, canonical: 'mm' },
    { regex: /\b\d+(?:\.\d+)?\s*(?:cm3|cm³|dm3|dm³|ml|litre|litres|l)\b/gi, canonical: 'volume' },
    { regex: /\b\d+(?:\.\d+)?\s*(?:cm|centimetre|centimetres)\b/gi, canonical: 'cm' },
    { regex: /\b\d+(?:\.\d+)?\s*(?:°c|deg\s*c|degrees?\s*celsius)\b/gi, canonical: '°C' },
    { regex: /\b\d+(?:\.\d+)?\s*%/gi, canonical: '%' },
    { regex: /\b\d+(?:\.\d+)?\s*(?:s|sec|seconds|min|minutes|h|hr|hours)\b/gi, canonical: 'time' },
    { regex: /\b\d+(?:\.\d+)?\s*(?:g|kg|mg)\b/gi, canonical: 'mass' },
    { regex: /\b(?:um|µm|mm|cm3|cm³|dm3|dm³|°c|%|kpa|mg\/dm3)\b/gi, canonical: 'unit' },
  ];

  const found: string[] = [];
  for (const p of unitPatterns) {
    if (p.regex.test(text)) {
      found.push(p.canonical);
    }
  }
  return Array.from(new Set(found));
}

function buildRubricPoints(markSchemeText: string, totalMarks: number): ParsedRubricPoint[] {
  const rawLines = markSchemeText
    .split(/\r?\n|;/)
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 3 &&
        !/^\[?\s*(?:total|max)\s*:?\s*\d+\s*(?:marks?)?\s*\]?$/i.test(l)
    );

  const cleanedLines = rawLines.map((line) =>
    line
      .replace(/^M\d+\s*[:.)-]?\s*/i, '')
      .replace(/^\d+[.)]\s*/, '')
      .replace(/^\[\s*\d+\s*(?:marks?)?\s*\]\s*/i, '')
      .replace(/\s*\[\s*\d+\s*(?:marks?)?\s*\]\s*$/i, '')
      .replace(/\s*\(\s*\d+\s*marks?\s*\)\s*$/i, '')
      .trim()
  );

  const slice = cleanedLines.slice(0, Math.max(1, totalMarks));
  const points: ParsedRubricPoint[] = slice.map((criterion, idx) => {
    const requiredUnits = detectUnitsInText(criterion);
    const keywords = extractKeywordsFromCriterion(criterion);
    const forbiddenContradictions: string[] = [];

    const lower = criterion.toLowerCase();
    if (lower.includes('higher to lower') || lower.includes('down a concentration')) {
      forbiddenContradictions.push('lower to higher', 'against the gradient');
    }
    if (lower.includes('lower to higher') || lower.includes('against a concentration')) {
      forbiddenContradictions.push('higher to lower', 'down the gradient');
    }
    if (lower.includes('denatured') || lower.includes('active site changes shape')) {
      forbiddenContradictions.push('enzyme is killed', 'enzymes die');
    }
    if (lower.includes('turgid')) {
      forbiddenContradictions.push('plasmolysed', 'flaccid', 'burst');
    }
    if (lower.includes('partially permeable')) {
      forbiddenContradictions.push('freely permeable', 'impermeable');
    }

    return {
      code: `M${idx + 1}`,
      criterion,
      keywords,
      requiredUnits,
      forbiddenContradictions,
      maxMarks: 1,
    };
  });

  // Pad if totalMarks exceeds parsed lines
  while (points.length < totalMarks) {
    const idx = points.length;
    points.push({
      code: `M${idx + 1}`,
      criterion: cleanedLines[idx % cleanedLines.length] || 'Additional Cambridge 0610 biological marking point',
      keywords: extractKeywordsFromCriterion(cleanedLines[idx % cleanedLines.length] || ''),
      requiredUnits: [],
      forbiddenContradictions: [],
      maxMarks: 1,
    });
  }

  return points;
}

export function gradeSubmissionDeterministic(
  studentAnswerRaw: string,
  markSchemeRaw: string,
  metadata?: SubmissionMetadata
): GradingResult {
  const studentAnswer = (studentAnswerRaw || '').trim();
  const markScheme = (markSchemeRaw || '').trim();
  const totalMarks = Math.max(1, detectTotalMarksFromMarkScheme(markScheme));
  const rubricPoints = buildRubricPoints(markScheme, totalMarks);

  const studentLower = studentAnswer.toLowerCase();
  const studentHasNumber = /\d+(?:\.\d+)?/.test(studentAnswer);
  const studentUnits = detectUnitsInText(studentAnswer);

  let criticalUnitDeducted = false;
  let contradictionTriggered = false;
  const missingKeywords: string[] = [];

  const rubricBreakdown: RubricPointEvaluation[] = rubricPoints.map((pt) => {
    // Check Critical Unit Rule if the point requires a specific calculation/measurement unit
    const criterionNumbers = pt.criterion.match(/\b\d+(?:\.\d+)?\b/g) || [];
    const needsUnit =
      pt.requiredUnits.length > 0 &&
      (criterionNumbers.length > 0 || /\b(?:calculate|value|rate|magnification|length|volume|temperature|percentage)\b/i.test(pt.criterion));

    if (needsUnit && studentHasNumber && studentUnits.length === 0) {
      criticalUnitDeducted = true;
      return {
        code: pt.code,
        criterion: pt.criterion,
        maxMarks: pt.maxMarks,
        awardedMarks: 0,
        status: 'missed',
        studentEvidence: 'Numeric value provided without a biological unit.',
        examinerNote: `Critical Unit Rule applied: expected unit (${pt.requiredUnits.join(' / ')}) was omitted.`,
      };
    }

    // Check Contradiction Rule (CON)
    const contradictedBy = pt.forbiddenContradictions.find((phrase) => studentLower.includes(phrase));
    if (contradictedBy) {
      contradictionTriggered = true;
      return {
        code: pt.code,
        criterion: pt.criterion,
        maxMarks: pt.maxMarks,
        awardedMarks: 0,
        status: 'contradicted',
        studentEvidence: `Contains contradicting statement: "${contradictedBy}".`,
        examinerNote: 'Contradiction Rule (CON): incorrect biological statement negates this mark point.',
      };
    }

    // Synonym/keyword matching
    const matchedKeywords = pt.keywords.filter((kw) => {
      if (studentLower.includes(kw)) return true;
      // Basic stem check
      if (kw.length >= 6 && studentLower.includes(kw.slice(0, -1))) return true;
      return false;
    });

    const requiredMatchThreshold = pt.keywords.length <= 2 ? 1 : Math.max(2, Math.ceil(pt.keywords.length * 0.4));
    const isNumberMatched =
      criterionNumbers.length === 0 || criterionNumbers.some((num) => studentAnswer.includes(num));

    const awarded = matchedKeywords.length >= requiredMatchThreshold && isNumberMatched;

    if (awarded) {
      return {
        code: pt.code,
        criterion: pt.criterion,
        maxMarks: pt.maxMarks,
        awardedMarks: 1,
        status: 'awarded',
        studentEvidence: `Matched key terminology: ${matchedKeywords.slice(0, 4).join(', ')}.`,
        examinerNote: 'Mark awarded (whole mark) for meeting the Cambridge 0610 criterion.',
      };
    }

    const missed = pt.keywords.filter((kw) => !matchedKeywords.includes(kw)).slice(0, 3);
    missingKeywords.push(...missed);

    return {
      code: pt.code,
      criterion: pt.criterion,
      maxMarks: pt.maxMarks,
      awardedMarks: 0,
      status: 'missed',
      studentEvidence: matchedKeywords.length > 0 ? `Partial mention (${matchedKeywords.join(', ')}), insufficient precision.` : 'Key marking point omitted.',
      examinerNote: missed.length > 0 ? `Missing key term(s): ${missed.join(', ')}.` : 'Criterion not clearly addressed.',
    };
  });

  // Whole marks only
  const awardedMarks = Math.min(
    totalMarks,
    rubricBreakdown.reduce((sum, item) => sum + Math.round(item.awardedMarks), 0)
  );
  const percentage = Math.round((awardedMarks / totalMarks) * 100);

  const uniqueMissingKeywords = Array.from(new Set(missingKeywords)).slice(0, 8);
  const ocrContext = metadata?.usedOcr ? ' (including OCR-transcribed work)' : '';

  const examinerSummary = [
    `The student scored ${awardedMarks} out of ${totalMarks} marks (${percentage}%)${ocrContext} under strict Cambridge IGCSE Biology (0610) whole-mark rules.`,
    criticalUnitDeducted
      ? 'A mark was withheld under the Critical Unit Rule because a numeric answer lacked its required unit.'
      : '',
    contradictionTriggered
      ? 'One or more marking points were negated under the Contradiction Rule (CON) due to conflicting biological statements.'
      : '',
    uniqueMissingKeywords.length > 0
      ? `To achieve full marks, include exact syllabus keywords such as: ${uniqueMissingKeywords.join(', ')}.`
      : 'All required biological terminology and marking points were accurately addressed.',
  ]
    .filter(Boolean)
    .join(' ');

  const correctedVersion = rubricBreakdown
    .map((pt, idx) => `${idx + 1}. ${pt.criterion}`)
    .join('\n');

  const examinerTip = criticalUnitDeducted
    ? 'Always check every calculated number and include the correct unit (e.g. µm, mm, cm³, %, °C) to avoid losing the final mark.'
    : contradictionTriggered
      ? 'Avoid adding extra guessed statements that contradict your correct point — Cambridge CON rules cancel the mark if right and wrong answers appear together.'
      : 'Use precise Cambridge 0610 command words and syllabus keywords (e.g. water potential, partially permeable membrane, complementary active site, kinetic energy).';

  return {
    awardedMarks,
    totalMarks,
    percentage,
    criticalUnitDeducted,
    contradictionTriggered,
    extractedStudentAnswer: studentAnswer,
    extractedMarkScheme: markScheme,
    rubricBreakdown,
    examinerSummary,
    correctedVersion,
    missingKeywords: uniqueMissingKeywords,
    examinerTip,
  };
}

export function getFullSyllabusSystemPrompt(): string {
  const topicList = BIOLOGY_SYLLABUS_NOTES.map(
    (t) => `${t.topicNumber} — ${t.title}: ${t.summary}`
  ).join('\n');

  return `You are Biology DA7EE7, a dedicated Cambridge IGCSE Biology (0610) Subject Tutor.
CRITICAL GROUNDING RULES:
1. You must answer ONLY Cambridge IGCSE Biology (0610) syllabus questions using accurate 0610 marking terminology.
2. If the user asks about a non-biology subject (e.g., physics, chemistry, mathematics, history, coding, politics), politely refuse and redirect them to Cambridge IGCSE Biology (0610) topics.
3. Never use raw markdown symbols like #, **, or backticks inside prose when clean numbered/bulleted structure works cleanly; keep headings concise, highlight key 0610 keywords, and give clear exam tips.
4. Never mention grades (A*, A, B, etc.) as a student score label.

Covered Cambridge 0610 Syllabus Topics:
${topicList}`;
}

export function getCompactTutorSystemPrompt(): string {
  return `You are Biology DA7EE7, a Cambridge IGCSE Biology (0610) Tutor.
RULES:
1. Answer ONLY 0610 Biology using exact mark-scheme keywords and scientific accuracy; politely decline off-syllabus subjects.
2. Be crisp and fast: ~45-85 words for definitions/short queries, ~85-135 words for processes/diagrams unless full detail is requested.
3. Use short headings and numbered/bulleted points; never use #, **, backticks, or letter grades (A*-U).`;
}

export function computeTypewriterAdvance(
  currentLength: number,
  targetLength: number,
  streamComplete: boolean
): number {
  const remaining = targetLength - currentLength;
  if (remaining <= 0) return targetLength;
  if (remaining <= 12 && streamComplete) return targetLength;

  // High-speed 60fps wipe: sweeps rapidly with the live stream without lagging on 30fps mobile devices
  const step = streamComplete
    ? Math.max(20, Math.ceil(remaining / 3))
    : Math.max(14, Math.ceil(remaining / 4));

  return Math.min(targetLength, currentLength + step);
}

export function generateTutorThoughtAndAnswer(question: string): {
  thought: string;
  answer: string;
  outOfScope: boolean;
  matchedTopics: string[];
} {
  const { matches, isOutOfScope } = searchBiologyNotes(question);

  if (isOutOfScope || matches.length === 0) {
    return {
      thought: 'Checked Cambridge IGCSE Biology (0610) curriculum scope: query falls outside Biology 0610.',
      answer: [
        'Out of Syllabus Scope (Cambridge IGCSE Biology 0610)',
        '',
        'I am Biology DA7EE7, trained exclusively for Cambridge IGCSE Biology (0610). Your question appears to be outside the 0610 Biology syllabus.',
        '',
        'Topics I can help you master:',
        '- Cell structure, specialisation, and magnification calculations',
        '- Diffusion, osmosis (water potential), and active transport',
        '- Enzymes, biological molecules, and food tests',
        '- Photosynthesis, human nutrition, transport in plants & animals',
        '- Immunity, gas exchange, respiration, homeostasis, genetics, and ecology',
      ].join('\n'),
      outOfScope: true,
      matchedTopics: [],
    };
  }

  const primary = matches[0];
  const secondary = matches[1];
  const matchedTopics = matches.map((m) => `${m.topicNumber}: ${m.title}`);

  const lines: string[] = [
    `${primary.topicNumber}: ${primary.title}`,
    primary.summary,
    '',
    'Key Syllabus Points (0610 Mark Scheme Phrasing):',
    ...primary.coreConcepts.map((c, i) => `${i + 1}. ${c}`),
    '',
    'Examiner Tips:',
    ...primary.examTips.map((tip) => `- ${tip}`),
  ];

  if (secondary) {
    lines.push(
      '',
      `Related Syllabus Link (${secondary.topicNumber}: ${secondary.title}):`,
      ...secondary.coreConcepts.slice(0, 2).map((c) => `- ${c}`)
    );
  }

  return {
    thought: `Matched Cambridge 0610 syllabus references: ${matchedTopics.join(' | ')}.`,
    answer: lines.join('\n'),
    outOfScope: false,
    matchedTopics,
  };
}

export function answerExaminerChatDeterministic(
  question: string,
  gradingResult: GradingResult,
  studentAnswer: string,
  markScheme: string
): string {
  const qLower = question.toLowerCase();
  const missedPoints = gradingResult.rubricBreakdown.filter((r) => r.status !== 'awarded');
  const awardedPoints = gradingResult.rubricBreakdown.filter((r) => r.status === 'awarded');

  if (qLower.includes('why') || qLower.includes('lost') || qLower.includes('miss') || qLower.includes('deduct')) {
    if (missedPoints.length === 0) {
      return `You achieved full marks (${gradingResult.awardedMarks}/${gradingResult.totalMarks}) on this question! Every Cambridge 0610 marking point was satisfied.`;
    }
    const list = missedPoints
      .map((pt, i) => `${i + 1}. [${pt.code}] ${pt.criterion}\n   Reason: ${pt.examinerNote}`)
      .join('\n');
    return `Marks lost breakdown (${gradingResult.awardedMarks}/${gradingResult.totalMarks} awarded):\n\n${list}\n\nTip: ${gradingResult.examinerTip}`;
  }

  if (qLower.includes('full mark') || qLower.includes('model') || qLower.includes('improve') || qLower.includes('correct')) {
    return `To secure all ${gradingResult.totalMarks} marks, include every mark-scheme point clearly:\n\n${gradingResult.correctedVersion}\n\nMissing keywords to add: ${
      gradingResult.missingKeywords.length > 0 ? gradingResult.missingKeywords.join(', ') : 'None'
    }.`;
  }

  const search = searchBiologyNotes(`${question} ${markScheme} ${studentAnswer}`);
  const topicNote =
    !search.isOutOfScope && search.matches[0]
      ? `\n\nSyllabus Reference (${search.matches[0].topicNumber}: ${search.matches[0].title}):\n- ${search.matches[0].coreConcepts[0]}`
      : '';

  return [
    `Examiner Review (${gradingResult.awardedMarks}/${gradingResult.totalMarks} marks):`,
    `- Awarded points: ${awardedPoints.length}`,
    `- Missed/contradicted points: ${missedPoints.length}`,
    missedPoints[0] ? `- Focus next on [${missedPoints[0].code}]: ${missedPoints[0].criterion}` : '',
    topicNote,
  ]
    .filter(Boolean)
    .join('\n');
}
