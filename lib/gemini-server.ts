import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from '@google/genai';

const ACTIVE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
] as const;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Calls Gemini generateContent with automatic failover and retry across active models
 * so multi-page OCR and grading never fail due to temporary demand spikes.
 */
export async function generateContentWithFallback(
  params: Omit<GenerateContentParameters, 'model'>
): Promise<GenerateContentResponse | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  let lastError: unknown = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    for (const modelName of ACTIVE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model: modelName,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err) {
        lastError = err;
      }
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  if (lastError) {
    console.error('All Gemini models failed after retries:', lastError);
  }
  return null;
}
