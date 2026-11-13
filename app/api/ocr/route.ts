import { NextRequest, NextResponse } from 'next/server';
import { Part } from '@google/genai';
import {
  GEMINI_MODEL,
  UploadedPageInput,
  buildMediaParts,
  getGeminiServerClient,
} from '@/lib/gemini-server';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      pages?: UploadedPageInput[];
      role?: 'student' | 'mark_scheme';
    };
    const pages = Array.isArray(body.pages) ? body.pages : [];
    const role = body.role === 'mark_scheme' ? 'mark_scheme' : 'student';

    if (pages.length === 0) {
      return NextResponse.json({ error: 'No pages provided for OCR.' }, { status: 400 });
    }

    const ai = getGeminiServerClient();
    if (!ai) {
      return NextResponse.json({
        transcribedText:
          role === 'mark_scheme'
            ? '[Official Mark Scheme pages ready for marking]'
            : '[Student answer pages ready for marking]',
        engine: 'offline',
      });
    }

    const parts: Part[] = [
      ...buildMediaParts(pages),
      {
        text:
          role === 'mark_scheme'
            ? 'Transcribe this Cambridge IGCSE Biology (0610) Official Mark Scheme verbatim. Preserve all bullet points, semicolons, slash alternatives, bracketed mark totals like [1] or [Total: 4], "max", "accept", "ignore", and "reject" instructions, and biological units accurately. Output clean plain text.'
            : 'Transcribe this student Biology exam answer accurately across all pages in order. Preserve handwriting faithfully including numbers, decimals, biological equations, subscripts/superscripts, labels, and units (e.g. µm, mm, cm³, %, °C). Fix only obvious character-level OCR noise without adding extra biological knowledge that the student did not write. Output clean plain text.',
      },
    ];

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: { parts },
      config: {
        temperature: 0.1,
      },
    });

    return NextResponse.json({
      transcribedText: (response.text || '').trim(),
      engine: 'gemini',
    });
  } catch (error) {
    console.warn('OCR route fallback:', error);
    return NextResponse.json(
      { error: 'Unable to transcribe image right now.' },
      { status: 500 }
    );
  }
}
