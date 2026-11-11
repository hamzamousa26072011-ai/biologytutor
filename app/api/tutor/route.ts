import { NextRequest, NextResponse } from 'next/server';
import {
  generateTutorThoughtAndAnswer,
  getFullSyllabusSystemPrompt,
} from '@/lib/marking-engine';
import { searchBiologyNotes } from '@/lib/biology-notes-kb';
import { generateContentWithFallback } from '@/lib/gemini-server';

export async function POST(req: NextRequest) {
  let userQuestion = '';
  try {
    const body = await req.json();
    const {
      message,
      imageDataUrl,
      imageMimeType,
      history = [],
    } = body as {
      message: string;
      imageDataUrl?: string;
      imageMimeType?: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    };
    userQuestion =
      message ||
      (imageDataUrl
        ? 'Analyze and explain this biology diagram/question from the attached image.'
        : '');

    if (!userQuestion.trim() && !imageDataUrl) {
      return NextResponse.json(
        { error: 'Message or image is required' },
        { status: 400 }
      );
    }

    const fallbackData = generateTutorThoughtAndAnswer(userQuestion);

    // Strict scope boundary check against the computerized notes (when text is provided without image)
    const { isOutOfScope } = searchBiologyNotes(userQuestion);
    if (isOutOfScope && !imageDataUrl) {
      return NextResponse.json({
        thought: fallbackData.thought,
        reply:
          '### Scope Notice — Cambridge IGCSE Biology (0610)\n- I am strictly grounded in the **Cambridge IGCSE Biology (0610)** course notes and cannot answer questions outside of these syllabus notes.\n- Please ask about any covered Biology (0610) topic such as **Cells & Organelles**, **Osmosis & Active Transport**, **Enzymes**, **Human & Plant Nutrition**, **Transport in Plants & Humans**, **Immunity & Disease**, **Respiration & Gas Exchange**, **Excretion & The Kidney**, **Homeostasis & Nervous Coordination**, **Reproduction & Inheritance**, **Biotechnology**, or **Ecology**.',
      });
    }

    const systemInstruction = getFullSyllabusSystemPrompt(userQuestion);

    const userParts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    > = [];

    if (imageDataUrl && imageDataUrl.includes(',')) {
      userParts.push({
        inlineData: {
          mimeType: imageMimeType || 'image/jpeg',
          data: imageDataUrl.split(',')[1],
        },
      });
    }
    userParts.push({ text: userQuestion });

    const contents = [
      ...history.slice(-6).map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: userParts,
      },
    ];

    const response = await generateContentWithFallback({
      contents,
      config: {
        systemInstruction,
        thinkingConfig: {
          includeThoughts: true,
        },
      },
    });

    if (!response) {
      return NextResponse.json(fallbackData);
    }

    const candidateParts = response.candidates?.[0]?.content?.parts || [];
    const modelThoughts = candidateParts
      .filter((p: any) => p.thought && typeof p.text === 'string')
      .map((p: any) => p.text.trim())
      .filter(Boolean)
      .join('\n');

    const replyText = response.text?.trim() || fallbackData.reply;
    const thoughtText = modelThoughts || fallbackData.thought;

    return NextResponse.json({
      thought: thoughtText,
      reply: replyText,
    });
  } catch (error) {
    console.error('Tutor API fallback:', error);
    const fallbackData = generateTutorThoughtAndAnswer(userQuestion);
    return NextResponse.json(fallbackData);
  }
}
