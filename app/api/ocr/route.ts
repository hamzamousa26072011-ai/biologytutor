import { NextRequest, NextResponse } from 'next/server';
import { generateContentWithFallback } from '@/lib/gemini-server';

export const dynamic = 'force-dynamic';

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
        ? `You are a Senior Cambridge IGCSE Biology (0610) Official Mark Scheme OCR Engine.
Examine this Official Mark Scheme image/document line-by-line and column-by-column, and transcribe ALL text verbatim with 100% precision:
1. Extract every row of the 4-column Cambridge Mark Scheme table:
   - Column 1 (Question): Exact question and sub-question numbers (e.g. 1(a)(i), 1(a)(ii), 1(b)).
   - Column 2 (Answer): Every marking point separated by semicolons (;), preserving all underlined or bolded keywords (write underlined keywords in **bold**), chemical equations, numerical values, and alternative wording separated by "/" or "OR".
   - Column 3 (Marks): Exact integer mark allocation for each part and sub-part (e.g. [1], [2], [3], Total: [X]).
   - Column 4 (Guidance): Every examiner instruction including Accept (A), Allow, Ignore (I), Reject (R), ORA (or reverse argument), ECF (error carried forward), AVP (any valid point), and "max [X]".
2. Explicitly note if any unit is already printed on the answer line.
Return ONLY the complete, structured verbatim transcription without commentary.`
        : `You are a Senior Cambridge IGCSE Biology (0610) Handwriting & Exam Script OCR Engine.
Examine this Student's Answer exam page image/document line-by-line and transcribe ALL visible printed and handwritten text with 100% precision:
1. Printed Question Context: Transcribe every visible question number, sub-question label (e.g. 1(a)(i), (b)), printed question stem, diagram/graph axes and labels, table headers, and the exact printed answer line including any pre-printed unit (such as "........... %", "........... beats / min", "........... dm³", "........... arbitrary units") under "Question Prompt / Answer Line:".
2. Student's Handwritten / Typed Response: Carefully decipher cursive, slanted, faint pencil, or dark pen handwriting line-by-line. Transcribe every word, biological term, symbol, arrow, table entry, and mathematical working/calculation under "Student's Answer:".
3. Crossed-Out Text Rule: Ignore words or lines that the student has clearly struck through or crossed out, and transcribe only their intended final words verbatim (do NOT auto-correct their biological misconceptions so the examiner can grade their exact wording).
Return ONLY the complete verbatim transcription without commentary.`;

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
