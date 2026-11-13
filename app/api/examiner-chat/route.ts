import { NextRequest, NextResponse } from 'next/server';
import { ThinkingLevel } from '@google/genai';
import {
  GradingResult,
  answerExaminerChatDeterministic,
  stripMarkdown,
} from '@/lib/marking-engine';
import { GEMINI_MODEL, getGeminiServerClient } from '@/lib/gemini-server';

interface ExaminerChatRequest {
  question?: string;
  gradingResult?: GradingResult;
  studentAnswer?: string;
  markScheme?: string;
}

export async function POST(req: NextRequest) {
  let body: ExaminerChatRequest = {};
  try {
    body = (await req.json()) as ExaminerChatRequest;
    const question = (body.question || '').trim();
    const gradingResult = body.gradingResult;
    const studentAnswer = body.studentAnswer || '';
    const markScheme = body.markScheme || '';

    if (!question || !gradingResult) {
      return NextResponse.json(
        { error: 'Please ask a question after a submission has been marked.' },
        { status: 400 }
      );
    }

    const ai = getGeminiServerClient();
    if (!ai) {
      const reply = answerExaminerChatDeterministic(
        question,
        gradingResult,
        studentAnswer,
        markScheme
      );
      return NextResponse.json({ reply, engine: 'deterministic' });
    }

    const prompt = `You are Biology DA7EE7 acting as the Cambridge IGCSE Biology (0610) Examiner reviewing a student's marked question.
Score: ${gradingResult.awardedMarks}/${gradingResult.totalMarks} (${gradingResult.percentage}%)
Student Answer: ${studentAnswer}
Official Mark Scheme: ${markScheme}
Rubric Breakdown: ${JSON.stringify(gradingResult.rubricBreakdown)}
Missing Keywords: ${gradingResult.missingKeywords.join(', ')}

Student's follow-up question:
"${question}"

Explain concisely why specific marks were awarded or withheld using Cambridge 0610 rules (Critical Unit Rule, CON, ECF, whole marks). Do NOT output letter grades (A*-U) and do NOT use raw # or ** markdown characters.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const reply = stripMarkdown(response.text || '');
    return NextResponse.json({
      reply:
        reply ||
        answerExaminerChatDeterministic(question, gradingResult, studentAnswer, markScheme),
      engine: 'gemini',
    });
  } catch (error) {
    console.warn('Examiner chat fallback:', error);
    if (body.gradingResult && body.question) {
      return NextResponse.json({
        reply: answerExaminerChatDeterministic(
          body.question,
          body.gradingResult,
          body.studentAnswer || '',
          body.markScheme || ''
        ),
        engine: 'deterministic',
      });
    }
    return NextResponse.json({ error: 'Unable to answer examiner question.' }, { status: 500 });
  }
}
