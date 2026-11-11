import { NextRequest, NextResponse } from 'next/server';
import {
  answerExaminerChatDeterministic,
  GradingResult,
} from '@/lib/marking-engine';
import { searchBiologyNotes } from '@/lib/biology-notes-kb';
import { generateContentWithFallback } from '@/lib/gemini-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let question = '';
  let fallbackResult: GradingResult | null = null;
  let studentAnswer = '';
  let markScheme = '';

  try {
    const body = await req.json();
    question = body.question || '';
    fallbackResult = body.result;
    studentAnswer =
      body.studentAnswer || fallbackResult?.transcribedStudentAnswer || '';
    markScheme =
      body.markScheme || fallbackResult?.transcribedMarkScheme || '';
    const history: Array<{ role: 'user' | 'assistant'; content: string }> =
      body.history || [];

    if (!question.trim() || !fallbackResult) {
      return NextResponse.json(
        { error: 'Missing question or grading result' },
        { status: 400 }
      );
    }

    const { matches } = searchBiologyNotes(`${markScheme} ${question}`);
    const syllabusContext = matches
      .slice(0, 2)
      .map((m) => `=== ${m.title} ===\n${m.content}`)
      .join('\n\n');

    const systemInstruction = `You are the Cambridge IGCSE Biology (0610) Question Examiner.
You are discussing a specific graded exam question with the student.
RULES:
1. Base your explanation strictly on the Official Mark Scheme for this question, the Student's Answer, the Graded Rubric Breakdown, and the Cambridge IGCSE Biology (0610) Course Notes.
2. Do NOT answer questions outside the Cambridge IGCSE Biology (0610) course notes.
3. NEVER mention internal file names or author names.
4. Emphasize Cambridge Marking Principles: Whole marks only, Positive marking, exact Keyword Context, Contradictions (CON), Error Carried Forward (ECF), and the Critical Unit Rule (never penalize missing units if the unit is already printed on the answer line or prompt).
5. Format clearly with ### headings, bullet points (- ), **bold syllabus terms**, and \`inline codes\`.

GRADED QUESTION CONTEXT:
- Question Title: ${fallbackResult.questionTitle}
- Score: ${fallbackResult.awardedMarks} / ${fallbackResult.totalMarks} (${fallbackResult.percentage}%, Grade ${fallbackResult.grade})
- Transcribed Student's Answer: ${studentAnswer}
- Transcribed Official Mark Scheme: ${markScheme}
- Rubric Evaluation: ${JSON.stringify(fallbackResult.rubricPoints)}
- Mistakes Breakdown: ${JSON.stringify(fallbackResult.lostMarksBreakdown)}
- Full-Mark Model Answer: ${fallbackResult.correctedVersion}

RELEVANT SYLLABUS NOTES:
${syllabusContext}`;

    const contents = [
      ...history.slice(-6).map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [{ text: question }],
      },
    ];

    const response = await generateContentWithFallback({
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply =
      response?.text?.trim() ||
      answerExaminerChatDeterministic(
        question,
        fallbackResult,
        studentAnswer,
        markScheme
      );

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Examiner chat API fallback:', error);
    if (fallbackResult) {
      return NextResponse.json({
        reply: answerExaminerChatDeterministic(
          question,
          fallbackResult,
          studentAnswer,
          markScheme
        ),
      });
    }
    return NextResponse.json({
      reply:
        '### Cambridge Examiner Note\n- Focus on including every underlined keyword from the **Official Mark Scheme** in proper biological context.',
    });
  }
}
