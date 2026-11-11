import { NextRequest, NextResponse } from 'next/server';
import { generateContentWithFallback } from '@/lib/gemini-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dataUrl, mimeType, targetType } = body as {
      dataUrl: string;
      mimeType: string;
      targetType: 'student' | 'markscheme';
      fileName?: string;
    };

    if (!dataUrl) {
      return NextResponse.json({ error: 'Missing image/file data' }, { status: 400 });
    }

    const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
    const resolvedMime = mimeType || 'image/jpeg';

    const prompt =
      targetType === 'markscheme'
        ? `You are a Cambridge IGCSE Biology (0610) OCR transcriber.
Analyze this Official Mark Scheme image/document and transcribe ALL text verbatim and completely.
- Include every question number/sub-part, every rubric point, mark allocation ([B1], [M1], [A1], [C1], [1], etc.), underlined keywords, "Accept", "Allow", "Reject", "Ignore", "ORA", "ECF", and total marks (e.g. Total: [3] or max [X]).
- Also note if any unit is printed on the answer line.
Return ONLY the exact transcribed mark scheme text without commentary.`
        : `You are a Cambridge IGCSE Biology (0610) OCR transcriber.
Analyze this Student's Answer exam page image/document and transcribe ALL text verbatim and completely.
- If the printed question prompt, diagram labels, or printed answer line (including any pre-printed unit such as "........... beats / min" or "........... %") is visible on the page, transcribe it clearly as "Question Prompt / Answer Line: ...".
- Transcribe all of the student's handwritten or typed answers, calculations, and annotations word-for-word as "Student's Answer: ...".
Return ONLY the exact transcribed text without commentary.`;

    const response = await generateContentWithFallback({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: resolvedMime,
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        },
      ],
    });

    const extractedText = response?.text?.trim() || '';
    return NextResponse.json({ text: extractedText });
  } catch (error) {
    console.error('OCR route error:', error);
    return NextResponse.json({ text: '' });
  }
}
