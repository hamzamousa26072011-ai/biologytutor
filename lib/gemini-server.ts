import { GoogleGenAI, Part } from '@google/genai';

export const GEMINI_MODEL = 'gemini-4-hydrogen';
export const TUTOR_FAST_MODEL = 'gemini-3.1-flash-lite';

let cachedClient: GoogleGenAI | null = null;
let cachedFastClient: GoogleGenAI | null = null;

export function getGeminiServerClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedClient;
}

export function getTutorFastClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  if (!cachedFastClient) {
    cachedFastClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
        retryOptions: {
          attempts: 1,
        },
      },
    });
  }
  return cachedFastClient;
}

export interface UploadedPageInput {
  mimeType: string;
  base64Data: string;
  label?: string;
}

export function buildMediaParts(pages?: UploadedPageInput[]): Part[] {
  if (!Array.isArray(pages) || pages.length === 0) return [];
  const parts: Part[] = [];
  for (const page of pages) {
    if (!page?.base64Data || !page?.mimeType) continue;
    const cleanBase64 = page.base64Data.includes(',')
      ? page.base64Data.split(',')[1]
      : page.base64Data;
    if (!cleanBase64) continue;
    parts.push({
      inlineData: {
        mimeType: page.mimeType,
        data: cleanBase64,
      },
    });
  }
  return parts;
}
