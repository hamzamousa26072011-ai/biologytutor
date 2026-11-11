import { Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  calculateCambridgeGrade,
  detectTotalMarksFromScheme,
  gradeSubmissionDeterministic,
  hasUnitInPromptOrAnswerLine,
  GradingResult,
} from '@/lib/marking-engine';
import { searchBiologyNotes } from '@/lib/biology-notes-kb';
import { generateContentWithFallback } from '@/lib/gemini-server';

export const dynamic = 'force-dynamic';

async function transcribeStudentPagesDeep(
  studentPages: Array<{ dataUrl: string; mimeType: string }>
): Promise<string> {
  const validPages = studentPages.filter((p) => p.dataUrl && p.dataUrl.includes(','));
  if (validPages.length === 0) return '';

  const parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  > = [];

  validPages.forEach((p, idx) => {
    parts.push({
      text: `=== STUDENT ANSWER PAGE ${idx + 1} OF ${validPages.length} ===`,
    });
    parts.push({
      inlineData: {
        mimeType: p.mimeType || 'image/jpeg',
        data: p.dataUrl.split(',')[1],
      },
    });
  });

  parts.push({
    text: `You are an expert Cambridge IGCSE Biology (0610) handwriting and exam paper OCR specialist.
Carefully examine every page of the Student's Answer above and transcribe ALL text with maximum precision:
1. Transcribe every visible question number, sub-question label (e.g. 1(a)(i), (b)), printed question prompt, diagram label, table header, and pre-printed answer line unit (such as "........... %", "........... beats / min", "........... arbitrary units").
2. Decipher and transcribe every single word, sentence, biological term, calculation, and equation written by the student (whether handwritten in pen/pencil or typed).
3. Ignore crossed-out text that the student clearly struck through, and transcribe the student's intended words accurately without auto-correcting their biological mistakes (preserve their exact wording so it can be graded fairly).
4. Organize the transcription clearly page-by-page and question-by-question.
Return ONLY the complete verbatim transcription.`,
  });

  const res = await generateContentWithFallback({
    contents: [{ role: 'user', parts }],
  });

  return res?.text?.trim() || '';
}

async function transcribeMarkSchemePagesDeep(
  markSchemePages: Array<{ dataUrl: string; mimeType: string }>
): Promise<string> {
  const validPages = markSchemePages.filter((p) => p.dataUrl && p.dataUrl.includes(','));
  if (validPages.length === 0) return '';

  const parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  > = [];

  validPages.forEach((p, idx) => {
    parts.push({
      text: `=== OFFICIAL MARK SCHEME PAGE ${idx + 1} OF ${validPages.length} ===`,
    });
    parts.push({
      inlineData: {
        mimeType: p.mimeType || 'image/jpeg',
        data: p.dataUrl.split(',')[1],
      },
    });
  });

  parts.push({
    text: `You are an expert Cambridge IGCSE Biology (0610) Official Mark Scheme OCR specialist.
Carefully examine every page of the Official Mark Scheme above and transcribe ALL text and table rows with maximum precision:
1. Read every column of the Cambridge Mark Scheme table: Question number (e.g. 1(a)(i)), Answer / Marking points, Marks column, and Guidance / Additional Notes column.
2. Preserve every single semicolon (;) separating marking points, every rubric code ([B1], [M1], [A1], [C1], [1]), and the exact total/maximum marks for each part.
3. Preserve all underlined or bolded keywords and all examiner instructions including "Accept", "Allow", "Reject" (R), "Ignore" (I), "ORA" (or reverse argument), "ECF" (error carried forward), and "AVP" (any valid point).
Return ONLY the complete verbatim transcription of the mark scheme.`,
  });

  const res = await generateContentWithFallback({
    contents: [{ role: 'user', parts }],
  });

  return res?.text?.trim() || '';
}

export async function POST(req: NextRequest) {
  let studentAnswer = '';
  let markScheme = '';
  let questionPrompt = '';

  try {
    const body = await req.json();
    const {
      studentAnswer: rawStudentAnswer = '',
      markScheme: rawMarkScheme = '',
      questionPrompt: rawQuestionPrompt = '',
      studentPages = [],
      markSchemePages = [],
    } = body as {
      studentAnswer: string;
      markScheme: string;
      questionPrompt?: string;
      studentPages?: Array<{ dataUrl: string; mimeType: string }>;
      markSchemePages?: Array<{ dataUrl: string; mimeType: string }>;
    };

    const typedStudentText = rawStudentAnswer
      .replace(/Page ready for multimodal grading\.?/gi, '')
      .replace(/Transcribed page content ready for Cambridge 0610 evaluation\.?/gi, '')
      .trim();
    const typedSchemeText = rawMarkScheme
      .replace(/Page ready for multimodal grading\.?/gi, '')
      .replace(/Transcribed page content ready for Cambridge 0610 evaluation\.?/gi, '')
      .trim();
    questionPrompt = rawQuestionPrompt.trim();

    // STAGE 1: When the student clicks "Start Marking", perform dedicated deep OCR on all uploaded pictures
    const [ocrStudentText, ocrSchemeText] = await Promise.all([
      transcribeStudentPagesDeep(studentPages),
      transcribeMarkSchemePagesDeep(markSchemePages),
    ]);

    studentAnswer = [ocrStudentText, typedStudentText].filter(Boolean).join('\n\n').trim();
    markScheme = [ocrSchemeText, typedSchemeText].filter(Boolean).join('\n\n').trim();

    const unitAlreadyPrinted = hasUnitInPromptOrAnswerLine(questionPrompt, `${studentAnswer}\n${markScheme}`);
    const { matches } = searchBiologyNotes(`${questionPrompt} ${markScheme} ${studentAnswer}`);
    const syllabusContext = matches
      .slice(0, 3)
      .map((m) => `Topic: ${m.title}\n${m.content}`)
      .join('\n\n');

    const parts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    > = [];

    // Also include all original Student Answer and Mark Scheme images for direct visual verification during grading
    studentPages.forEach((p, idx) => {
      if (p.dataUrl && p.dataUrl.includes(',')) {
        parts.push({
          text: `=== STUDENT'S ANSWER PICTURE (PAGE ${idx + 1} OF ${studentPages.length}) ===`,
        });
        parts.push({
          inlineData: {
            mimeType: p.mimeType || 'image/jpeg',
            data: p.dataUrl.split(',')[1],
          },
        });
      }
    });

    markSchemePages.forEach((p, idx) => {
      if (p.dataUrl && p.dataUrl.includes(',')) {
        parts.push({
          text: `=== OFFICIAL MARK SCHEME PICTURE (PAGE ${idx + 1} OF ${markSchemePages.length}) ===`,
        });
        parts.push({
          inlineData: {
            mimeType: p.mimeType || 'image/jpeg',
            data: p.dataUrl.split(',')[1],
          },
        });
      }
    });

    const promptText = `You are a Senior Cambridge IGCSE Biology (0610) Examiner.
Follow this exact Paper Correction workflow using both the extracted OCR transcriptions below and the attached page images:

STEP 1 — VERIFY FULL TRANSCRIPTIONS:
- Review the extracted OCR transcription of the Student's Answer and the Official Mark Scheme below against the attached images to ensure not a single handwritten word, number, or mark scheme point was missed.
- Store the finalized full transcriptions in "transcribedStudentAnswer" and "transcribedMarkScheme" for system records.
- If no mark scheme picture or text was provided, derive the official Cambridge IGCSE Biology (0610) mark scheme points for the question from the Student's Answer page and the Cambridge 0610 Syllabus Notes below.

STEP 2 — COMPARE THE STUDENT'S ANSWER AGAINST THE MARK SCHEME:
- Compare the student's transcribed answer against each point of the transcribed mark scheme.
- Strictly enforce Cambridge IGCSE 0610 Marking Principles:
  1. WHOLE MARKS ONLY: Never award half marks (0.5) or fractions. Every rubric point is an integer mark (e.g. 1 or 0).
  2. POSITIVE MARKING: Award marks for valid biological points present that match the mark scheme; do not deduct for omissions.
  3. CONTEXT & KEYWORDS: Underlined or required Cambridge Biology keywords must be used in accurate scientific context.
  4. CONTRADICTIONS (CON): Contradictory statements in the same part cancel credit for that point.
  5. ERROR CARRIED FORWARD (ECF): Award subsequent marks if an earlier incorrect numerical value is used correctly in a subsequent step.
  6. RUBRIC CODES: Label each point with its Cambridge rubric code ([B1], [M1], [A1], [C1]).
  7. CRITICAL UNIT RULE: If the unit is already included in the question prompt or printed on the question paper answer line (e.g., "........... %", "........... beats / min", or unitPrePrinted=${unitAlreadyPrinted}), DO NOT subtract any marks if the student only writes the numerical value. Award the full [A1] accuracy mark!

STEP 3 — GIVE THE FINAL GRADE & COMPARISON SUMMARY:
- Auto-detect the exact integer "totalMarks" available from the mark scheme and calculate the exact integer "awardedMarks" earned by the student.
- In "examinerSummary", write a clear comparison of what the student got right and where marks were lost.

STEP 4 — SHOW ALL MISTAKES BELOW ("lostMarksBreakdown"):
- For every mark lost or missed rubric point, include an entry in "lostMarksBreakdown" detailing:
  - "rubricCode": The missed rubric point code (e.g. "[B1]")
  - "whatWasWrong": Exactly what was wrong, inaccurate, or missing in the student's actual answer
  - "whyMarkDeducted": Why the mark could not be awarded according to the Official Mark Scheme and Cambridge 0610 rules
  - "howToEarnFullMarks": Specific instruction on what the student must write or change to earn this mark

STEP 5 — EXPLAIN HOW TO EARN FULL MARKS & PROVIDE FULL-MARK MODEL ANSWER:
- In "howToEarnFullMarksSummary", clearly explain step-by-step how the student can improve their answer to earn 100% full marks on this question.
- In "correctedVersion", provide the complete 100% full-mark model answer written in crisp Cambridge IGCSE 0610 prose.
- NEVER use generic preset messages like "Valid Cambridge 0610 biological point" and NEVER mention internal file names or author names.

QUESTION PROMPT CONTEXT (if provided):
${questionPrompt || '(Extracted from student answer / mark scheme pages)'}

EXTRACTED OCR TRANSCRIPTION OF STUDENT'S ANSWER:
${studentAnswer || '(Inspect attached STUDENT\'S ANSWER PICTURE pages)'}

EXTRACTED OCR TRANSCRIPTION OF OFFICIAL MARK SCHEME:
${markScheme || '(Inspect attached OFFICIAL MARK SCHEME PICTURE pages)'}

RELEVANT CAMBRIDGE 0610 SYLLABUS NOTES:
${syllabusContext}`;

    parts.push({ text: promptText });

    const response = await generateContentWithFallback({
      contents: [{ role: 'user', parts }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questionTitle: {
              type: Type.STRING,
              description: 'Specific Cambridge 0610 question topic and number analyzed from the pictures/text',
            },
            transcribedStudentAnswer: {
              type: Type.STRING,
              description: 'Complete transcription of all text from the Student Answer pictures/text (kept in system)',
            },
            transcribedMarkScheme: {
              type: Type.STRING,
              description: 'Complete transcription of all text and rubric points from the Official Mark Scheme pictures/text (kept in system)',
            },
            totalMarks: {
              type: Type.INTEGER,
              description: 'Total available whole marks auto-detected from the mark scheme',
            },
            awardedMarks: {
              type: Type.INTEGER,
              description: 'Total whole marks awarded to the student after comparing against the mark scheme',
            },
            examinerSummary: {
              type: Type.STRING,
              description: 'Detailed comparison summary of the student answer against the mark scheme',
            },
            unitRuleApplied: {
              type: Type.BOOLEAN,
              description: 'True if the Critical Unit Rule was applied (unit already on prompt/answer line)',
            },
            howToEarnFullMarksSummary: {
              type: Type.STRING,
              description: 'Clear step-by-step explanation of how the student can earn full marks on this question',
            },
            rubricPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  code: {
                    type: Type.STRING,
                    description: 'Rubric code such as [B1], [M1], [A1], [C1]',
                  },
                  description: {
                    type: Type.STRING,
                    description: 'Exact requirement from the transcribed mark scheme point',
                  },
                  satisfied: {
                    type: Type.BOOLEAN,
                    description: 'True if student earned this mark',
                  },
                  marksAwarded: {
                    type: Type.INTEGER,
                    description: 'Whole marks awarded for this point (1 or 0)',
                  },
                  maxMarks: {
                    type: Type.INTEGER,
                    description: 'Maximum marks for this point (usually 1)',
                  },
                  examinerNote: {
                    type: Type.STRING,
                    description: 'Comparison of what the student wrote versus what this mark scheme point required',
                  },
                },
                required: [
                  'code',
                  'description',
                  'satisfied',
                  'marksAwarded',
                  'maxMarks',
                  'examinerNote',
                ],
              },
            },
            lostMarksBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rubricCode: { type: Type.STRING },
                  whatWasWrong: { type: Type.STRING },
                  whyMarkDeducted: { type: Type.STRING },
                  howToEarnFullMarks: { type: Type.STRING },
                },
                required: [
                  'rubricCode',
                  'whatWasWrong',
                  'whyMarkDeducted',
                  'howToEarnFullMarks',
                ],
              },
            },
            correctedVersion: {
              type: Type.STRING,
              description: 'Complete 100% full-mark model answer based on the mark scheme',
            },
          },
          required: [
            'questionTitle',
            'transcribedStudentAnswer',
            'transcribedMarkScheme',
            'totalMarks',
            'awardedMarks',
            'examinerSummary',
            'unitRuleApplied',
            'howToEarnFullMarksSummary',
            'rubricPoints',
            'lostMarksBreakdown',
            'correctedVersion',
          ],
        },
      },
    });

    if (!response || !response.text) {
      const deterministicResult = gradeSubmissionDeterministic({
        studentAnswer,
        markScheme,
        questionPrompt,
      });
      return NextResponse.json(deterministicResult);
    }

    const parsed = JSON.parse(response.text);
    const effectiveStudentText =
      parsed.transcribedStudentAnswer?.trim() || studentAnswer;
    const effectiveSchemeText =
      parsed.transcribedMarkScheme?.trim() || markScheme;

    const detectedTotal = detectTotalMarksFromScheme(effectiveSchemeText);
    const totalMarks = Math.max(1, Math.round(parsed.totalMarks || detectedTotal));
    const awardedMarks = Math.max(
      0,
      Math.min(totalMarks, Math.round(parsed.awardedMarks ?? 0))
    );
    const marksLost = Math.max(0, totalMarks - awardedMarks);
    const { grade, percentage } = calculateCambridgeGrade(awardedMarks, totalMarks);

    const rubricPoints =
      Array.isArray(parsed.rubricPoints) && parsed.rubricPoints.length > 0
        ? parsed.rubricPoints.map((rp: any) => ({
            code: rp.code?.startsWith('[') ? rp.code : `[${rp.code || 'B1'}]`,
            description: rp.description || '',
            satisfied: Boolean(rp.satisfied),
            marksAwarded: rp.satisfied ? Math.max(1, Math.round(rp.marksAwarded || 1)) : 0,
            maxMarks: Math.max(1, Math.round(rp.maxMarks || 1)),
            examinerNote: rp.examinerNote || '',
          }))
        : [];

    const lostMarksBreakdown =
      marksLost === 0
        ? []
        : Array.isArray(parsed.lostMarksBreakdown) && parsed.lostMarksBreakdown.length > 0
        ? parsed.lostMarksBreakdown
        : rubricPoints
            .filter((rp: any) => !rp.satisfied)
            .map((rp: any) => ({
              rubricCode: rp.code,
              whatWasWrong: rp.examinerNote || `Your answer missed or did not accurately state: "${rp.description}".`,
              whyMarkDeducted: `The Official Mark Scheme requires this specific point (${rp.code}: ${rp.description}) for credit.`,
              howToEarnFullMarks: `Explicitly include "${rp.description}" using accurate Cambridge IGCSE 0610 biological terminology.`,
            }));

    const finalResult: GradingResult = {
      questionTitle: parsed.questionTitle || 'Cambridge IGCSE 0610 Paper Correction',
      grade,
      percentage,
      awardedMarks,
      totalMarks,
      marksLost,
      examinerSummary:
        parsed.examinerSummary ||
        `You scored ${awardedMarks} out of ${totalMarks} marks (${percentage}%, Grade ${grade}).`,
      unitRuleApplied: Boolean(
        parsed.unitRuleApplied ||
          hasUnitInPromptOrAnswerLine(effectiveStudentText, effectiveSchemeText)
      ),
      transcribedStudentAnswer: effectiveStudentText,
      transcribedMarkScheme: effectiveSchemeText,
      howToEarnFullMarksSummary:
        parsed.howToEarnFullMarksSummary ||
        (marksLost === 0
          ? 'Your answer satisfied all mark scheme requirements for full marks.'
          : lostMarksBreakdown
              .map((item: any, idx: number) => `${idx + 1}. **${item.rubricCode}**: ${item.howToEarnFullMarks}`)
              .join('\n')),
      rubricPoints,
      lostMarksBreakdown,
      correctedVersion:
        parsed.correctedVersion ||
        rubricPoints.map((rp: any) => rp.description).join('. ') + '.',
    };

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error('Grade API error:', error);
    return NextResponse.json(
      gradeSubmissionDeterministic({
        studentAnswer,
        markScheme,
        questionPrompt,
      })
    );
  }
}
