import { NextRequest, NextResponse } from 'next/server';
import { Type, Part } from '@google/genai';
import {
  GradingResult,
  gradeSubmissionDeterministic,
  stripMarkdown,
} from '@/lib/marking-engine';
import {
  GEMINI_MODEL,
  UploadedPageInput,
  buildMediaParts,
  getGeminiServerClient,
} from '@/lib/gemini-server';

interface GradeRequestBody {
  studentAnswer?: string;
  markScheme?: string;
  studentPages?: UploadedPageInput[];
  markSchemePages?: UploadedPageInput[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GradeRequestBody;
    const studentText = (body.studentAnswer || '').trim();
    const markSchemeText = (body.markScheme || '').trim();
    const studentPages = Array.isArray(body.studentPages) ? body.studentPages : [];
    const markSchemePages = Array.isArray(body.markSchemePages) ? body.markSchemePages : [];

    const hasStudentInput = studentText.length > 0 || studentPages.length > 0;
    const hasMarkSchemeInput = markSchemeText.length > 0 || markSchemePages.length > 0;

    if (!hasStudentInput || !hasMarkSchemeInput) {
      return NextResponse.json(
        { error: 'Please provide both a Student Answer and an Official Mark Scheme.' },
        { status: 400 }
      );
    }

    const ai = getGeminiServerClient();
    const usedOcr = studentPages.length > 0 || markSchemePages.length > 0;

    if (!ai) {
      if (usedOcr && (!studentText || !markSchemeText)) {
        const fallbackStudent =
          studentText || '[Uploaded student handwritten/PDF answer pages pending server OCR key]';
        const fallbackScheme =
          markSchemeText || '[Uploaded mark scheme pages pending server OCR key]';
        const deterministic = gradeSubmissionDeterministic(fallbackStudent, fallbackScheme, {
          usedOcr,
          studentFileCount: studentPages.length,
          markSchemeFileCount: markSchemePages.length,
        });
        return NextResponse.json({ result: deterministic, engine: 'deterministic' });
      }

      const deterministic = gradeSubmissionDeterministic(studentText, markSchemeText, {
        usedOcr,
        studentFileCount: studentPages.length,
        markSchemeFileCount: markSchemePages.length,
      });
      return NextResponse.json({ result: deterministic, engine: 'deterministic' });
    }

    const parts: Part[] = [];

    if (studentPages.length > 0) {
      parts.push({ text: '=== STUDENT ANSWER PAGES (TRANSCRIBE ACCURATELY FIRST) ===' });
      parts.push(...buildMediaParts(studentPages));
    }
    if (studentText) {
      parts.push({ text: `=== STUDENT ANSWER TYPED/PASTED TEXT ===\n${studentText}` });
    }

    if (markSchemePages.length > 0) {
      parts.push({ text: '=== OFFICIAL CAMBRIDGE 0610 MARK SCHEME PAGES ===' });
      parts.push(...buildMediaParts(markSchemePages));
    }
    if (markSchemeText) {
      parts.push({ text: `=== OFFICIAL CAMBRIDGE 0610 MARK SCHEME TEXT ===\n${markSchemeText}` });
    }

    parts.push({
      text: `You are an expert Cambridge IGCSE Biology (0610) Chief Examiner with enhanced handwriting & exam-paper OCR capability.

TASKS:
1. OCR & Transcription: Carefully transcribe any uploaded student handwriting, tables, labels, biological equations, and units (e.g. µm, mm, cm³, °C, %) without dropping decimals or subscripts. Also transcribe any uploaded Official Mark Scheme pages completely.
2. Auto-detect total marks: Read bracketed totals [Total: N], [max N], or individual [1] marking points from the mark scheme.
3. Strict Cambridge 0610 Marking Rules:
   - WHOLE MARKS ONLY (integers only, never 0.5).
   - Critical Unit Rule: If a calculation or quantitative point requires a unit and the student omits or writes the wrong unit, withhold that mark and set criticalUnitDeducted = true.
   - Contradiction Rule (CON): If the student gives a correct statement alongside a contradicting incorrect biological statement, award 0 for that point and set contradictionTriggered = true.
   - Error Carried Forward (ECF): Apply standard Cambridge ECF for multi-step calculations if method is shown clearly.
4. DO NOT include any letter grade (such as Grade A*, A, B, C, etc.) anywhere in examinerSummary or correctedVersion.
5. Return clean prose (no raw markdown hashes or asterisks).`,
    });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedStudentAnswer: { type: Type.STRING },
            extractedMarkScheme: { type: Type.STRING },
            awardedMarks: { type: Type.INTEGER },
            totalMarks: { type: Type.INTEGER },
            criticalUnitDeducted: { type: Type.BOOLEAN },
            contradictionTriggered: { type: Type.BOOLEAN },
            rubricBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  code: { type: Type.STRING },
                  criterion: { type: Type.STRING },
                  maxMarks: { type: Type.INTEGER },
                  awardedMarks: { type: Type.INTEGER },
                  status: { type: Type.STRING },
                  studentEvidence: { type: Type.STRING },
                  examinerNote: { type: Type.STRING },
                },
                required: [
                  'code',
                  'criterion',
                  'maxMarks',
                  'awardedMarks',
                  'status',
                  'studentEvidence',
                  'examinerNote',
                ],
              },
            },
            examinerSummary: { type: Type.STRING },
            correctedVersion: { type: Type.STRING },
            missingKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            examinerTip: { type: Type.STRING },
          },
          required: [
            'extractedStudentAnswer',
            'extractedMarkScheme',
            'awardedMarks',
            'totalMarks',
            'criticalUnitDeducted',
            'contradictionTriggered',
            'rubricBreakdown',
            'examinerSummary',
            'correctedVersion',
            'missingKeywords',
            'examinerTip',
          ],
        },
      },
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error('Empty model response');
    }

    const parsed = JSON.parse(rawJson) as Partial<GradingResult>;
    const breakdown = Array.isArray(parsed.rubricBreakdown)
      ? parsed.rubricBreakdown.map((pt, i) => ({
          code: pt.code || `M${i + 1}`,
          criterion: stripMarkdown(pt.criterion || 'Marking point'),
          maxMarks: Math.max(1, Math.round(Number(pt.maxMarks || 1))),
          awardedMarks: Math.max(0, Math.round(Number(pt.awardedMarks || 0))),
          status:
            pt.status === 'awarded' || pt.status === 'contradicted'
              ? pt.status
              : ('missed' as const),
          studentEvidence: stripMarkdown(pt.studentEvidence || ''),
          examinerNote: stripMarkdown(pt.examinerNote || ''),
        }))
      : [];

    const totalMarks = Math.max(1, Math.round(Number(parsed.totalMarks || breakdown.length || 1)));
    const awardedMarks = Math.max(
      0,
      Math.min(totalMarks, Math.round(Number(parsed.awardedMarks ?? 0)))
    );
    const percentage = Math.round((awardedMarks / totalMarks) * 100);

    const sanitizedSummary = stripMarkdown(parsed.examinerSummary || '')
      .replace(/\bGrade\s*[:=-]?\s*[A-G*U]\b\.?/gi, '')
      .trim();

    const result: GradingResult = {
      awardedMarks,
      totalMarks,
      percentage,
      criticalUnitDeducted: Boolean(parsed.criticalUnitDeducted),
      contradictionTriggered: Boolean(parsed.contradictionTriggered),
      extractedStudentAnswer: parsed.extractedStudentAnswer || studentText,
      extractedMarkScheme: parsed.extractedMarkScheme || markSchemeText,
      rubricBreakdown: breakdown,
      examinerSummary:
        sanitizedSummary ||
        `Scored ${awardedMarks} out of ${totalMarks} marks (${percentage}%) under Cambridge 0610 marking rules.`,
      correctedVersion: stripMarkdown(parsed.correctedVersion || ''),
      missingKeywords: Array.isArray(parsed.missingKeywords)
        ? parsed.missingKeywords.map((k) => stripMarkdown(String(k))).filter(Boolean)
        : [],
      examinerTip: stripMarkdown(
        parsed.examinerTip || 'Use exact Cambridge 0610 terminology and include biological units.'
      ),
    };

    return NextResponse.json({ result, engine: 'gemini' });
  } catch (error) {
    console.warn('Grade route fallback triggered:', error);
    try {
      const body = (await req.clone().json().catch(() => ({}))) as GradeRequestBody;
      const fallback = gradeSubmissionDeterministic(
        body.studentAnswer || '[Uploaded Student Answer]',
        body.markScheme || '[Uploaded Mark Scheme]',
        { usedOcr: Boolean(body.studentPages?.length || body.markSchemePages?.length) }
      );
      return NextResponse.json({ result: fallback, engine: 'deterministic' });
    } catch {
      return NextResponse.json(
        { error: 'Unable to grade submission right now. Please try again.' },
        { status: 500 }
      );
    }
  }
}
