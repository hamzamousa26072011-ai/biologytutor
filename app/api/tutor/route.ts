import { NextRequest, NextResponse } from 'next/server';
import { Part, ThinkingLevel } from '@google/genai';
import {
  generateTutorThoughtAndAnswer,
  getCompactTutorSystemPrompt,
  stripMarkdown,
} from '@/lib/marking-engine';
import {
  GEMINI_MODEL,
  TUTOR_FAST_MODEL,
  UploadedPageInput,
  buildMediaParts,
  getGeminiServerClient,
  getTutorFastClient,
} from '@/lib/gemini-server';
import { searchBiologyNotes } from '@/lib/biology-notes-kb';
import { executeHedgedStream } from '@/lib/tutor-hedge';

interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface StreamEvent {
  type: 'meta' | 'delta' | 'done';
  matchedTopics?: string[];
  outOfScope?: boolean;
  engine?: string;
  text?: string;
  answer?: string;
}

function encodeEvent(event: StreamEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

let warmedUpstream = false;

interface CachedTutorEntry {
  answer: string;
  matchedTopics: string[];
  expiresAt: number;
}

const TUTOR_CACHE = new Map<string, CachedTutorEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_CACHE_ENTRIES = 80;

function getCacheKey(question: string): string {
  return question.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getCachedTutorReply(question: string): CachedTutorEntry | null {
  const key = getCacheKey(question);
  const entry = TUTOR_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    TUTOR_CACHE.delete(key);
    return null;
  }
  return entry;
}

function setCachedTutorReply(question: string, answer: string, matchedTopics: string[]): void {
  const key = getCacheKey(question);
  if (TUTOR_CACHE.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = TUTOR_CACHE.keys().next().value;
    if (oldestKey) TUTOR_CACHE.delete(oldestKey);
  }
  TUTOR_CACHE.set(key, {
    answer,
    matchedTopics,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export async function GET() {
  const ai = getTutorFastClient();
  getGeminiServerClient();
  if (ai && !warmedUpstream) {
    warmedUpstream = true;
    fetch('https://generativelanguage.googleapis.com/', { method: 'HEAD' }).catch(() => {});
  }
  return NextResponse.json({ ready: true });
}

export async function POST(req: NextRequest) {
  let question = '';
  try {
    const body = (await req.json()) as {
      question?: string;
      history?: TutorMessage[];
      images?: UploadedPageInput[];
      stream?: boolean;
    };
    question = (body.question || '').trim();
    const history = Array.isArray(body.history) ? body.history.slice(-4) : [];
    const images = Array.isArray(body.images) ? body.images.slice(0, 6) : [];
    const wantsStream = body.stream !== false;

    if (!question && images.length === 0) {
      return NextResponse.json(
        { error: 'Please enter a Biology question or attach a picture.' },
        { status: 400 }
      );
    }

    const effectiveQuestion =
      question || 'Analyse the attached Cambridge IGCSE Biology (0610) picture and explain it clearly.';

    const kbSearch = searchBiologyNotes(effectiveQuestion);

    // Fast syllabus-guard response when clearly off-subject (and no image attached)
    if (kbSearch.isOutOfScope && images.length === 0) {
      const scoped = generateTutorThoughtAndAnswer(effectiveQuestion);
      if (!wantsStream) {
        return NextResponse.json({
          answer: scoped.answer,
          outOfScope: true,
          matchedTopics: scoped.matchedTopics,
          engine: 'syllabus-guard',
        });
      }

      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(
            encodeEvent({
              type: 'meta',
              matchedTopics: scoped.matchedTopics,
              outOfScope: true,
              engine: 'syllabus-guard',
            })
          );
          controller.enqueue(encodeEvent({ type: 'done', answer: scoped.answer }));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          'Content-Type': 'application/x-ndjson; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
        },
      });
    }

    // Fast cache hit for repeated single-turn text questions (streams smoothly in < 50ms)
    const canUseCache = images.length === 0 && history.length <= 1;
    const cached = canUseCache ? getCachedTutorReply(effectiveQuestion) : null;
    if (cached) {
      if (!wantsStream) {
        return NextResponse.json({
          answer: cached.answer,
          outOfScope: false,
          matchedTopics: cached.matchedTopics,
          engine: 'gemini-cache',
        });
      }

      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(
            encodeEvent({
              type: 'meta',
              matchedTopics: cached.matchedTopics,
              outOfScope: false,
              engine: 'gemini-cache',
            })
          );
          controller.enqueue(encodeEvent({ type: 'delta', text: cached.answer }));
          controller.enqueue(encodeEvent({ type: 'done', answer: cached.answer }));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          'Content-Type': 'application/x-ndjson; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    const fastAi = getTutorFastClient();
    const fallbackAi = getGeminiServerClient();
    if (!fastAi || !fallbackAi) {
      const deterministic =
        images.length > 0 && !question
          ? {
              answer:
                'Image attached! Add a brief biology topic or question (e.g. "Explain this osmosis diagram") or enable the Gemini API key on the server for direct visual diagram analysis.',
              outOfScope: false,
              matchedTopics: [] as string[],
            }
          : generateTutorThoughtAndAnswer(effectiveQuestion);

      if (!wantsStream) {
        return NextResponse.json({
          answer: deterministic.answer,
          outOfScope: deterministic.outOfScope,
          matchedTopics: deterministic.matchedTopics,
          engine: 'deterministic',
        });
      }

      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(
            encodeEvent({
              type: 'meta',
              matchedTopics: deterministic.matchedTopics,
              outOfScope: deterministic.outOfScope,
              engine: 'deterministic',
            })
          );
          controller.enqueue(encodeEvent({ type: 'done', answer: deterministic.answer }));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          'Content-Type': 'application/x-ndjson; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
        },
      });
    }

    // Keep prompt prefill ultra-lean for minimal TTFT without losing 0610 mark-scheme precision
    const matchedTopics = kbSearch.matches.slice(0, 2).map((m) => `${m.topicNumber}: ${m.title}`);
    const primaryTopic = kbSearch.matches[0];
    const kbContext = primaryTopic
      ? `${primaryTopic.topicNumber} (${primaryTopic.title}):\n${primaryTopic.coreConcepts
          .slice(0, 2)
          .join('\n')}${primaryTopic.examTips[0] ? `\nTip: ${primaryTopic.examTips[0]}` : ''}`
      : '';

    const priorTurns = history.length > 1 ? history.slice(0, -1) : [];
    const historyText =
      priorTurns.length > 0
        ? `History:\n${priorTurns
            .map(
              (m) =>
                `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content.slice(0, 200)}`
            )
            .join('\n')}\n\n`
        : '';

    const isShortPrompt =
      effectiveQuestion.length <= 65 &&
      images.length === 0 &&
      !/full|detail|long|everything|essay|all/i.test(effectiveQuestion);

    const lengthRule = isShortPrompt
      ? 'Keep it crisp and high-yield (~45-85 words) with exact 0610 mark-scheme keywords.'
      : 'Keep it concise (~85-135 words unless full notes are asked) with exact 0610 mark-scheme points.';

    const parts: Part[] = [
      ...buildMediaParts(images),
      {
        text: `${historyText}${
          kbContext ? `0610 Reference:\n${kbContext}\n\n` : ''
        }Question:\n${effectiveQuestion}\n\n${
          images.length > 0
            ? 'Inspect labels, diagrams, graphs, or handwriting carefully. '
            : ''
        }${lengthRule} Use short headings and numbered/bulleted points; no raw # or ** characters.`,
      },
    ];

    if (!wantsStream) {
      const response = await fastAi.models.generateContent({
        model: TUTOR_FAST_MODEL,
        contents: { parts },
        config: {
          systemInstruction: getCompactTutorSystemPrompt(),
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        },
      });
      const answerText = stripMarkdown(response.text || '');
      if (!answerText) {
        const fallback = generateTutorThoughtAndAnswer(effectiveQuestion);
        return NextResponse.json({
          answer: fallback.answer,
          outOfScope: fallback.outOfScope,
          matchedTopics: fallback.matchedTopics,
          engine: 'deterministic',
        });
      }
      if (canUseCache) {
        setCachedTutorReply(effectiveQuestion, answerText, matchedTopics);
      }
      return NextResponse.json({
        answer: answerText,
        outOfScope: false,
        matchedTopics,
        engine: 'gemini',
      });
    }

    // Stream tokens live as NDJSON with speculative hedging to crush tail latency
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(
          encodeEvent({
            type: 'meta',
            matchedTopics,
            outOfScope: false,
            engine: 'gemini',
          })
        );

        let accumulated = '';
        const systemInstruction = getCompactTutorSystemPrompt();

        const startFastAttempt = (signal: AbortSignal) =>
          fastAi.models.generateContentStream({
            model: TUTOR_FAST_MODEL,
            contents: { parts },
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
              abortSignal: signal,
            },
          });

        const startHydrogenAttempt = (signal: AbortSignal) =>
          fastAi.models.generateContentStream({
            model: GEMINI_MODEL,
            contents: { parts },
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              abortSignal: signal,
            },
          });

        try {
          let emittedAny = false;
          try {
            const hedged = executeHedgedStream(startFastAttempt, startFastAttempt, {
              hedgeDelayMs: 800,
              outerSignal: req.signal,
              extractText: (chunk) => chunk.text || '',
            });

            for await (const chunk of hedged) {
              const chunkText = chunk.text || '';
              if (chunkText) {
                emittedAny = true;
                accumulated += chunkText;
                controller.enqueue(encodeEvent({ type: 'delta', text: chunkText }));
              }
            }
          } catch (primaryError) {
            if (req.signal.aborted) throw primaryError;
            if (!emittedAny) {
              console.warn('Tutor hedged fast stream fallback to GEMINI_MODEL:', primaryError);
              const fallbackStream = await startHydrogenAttempt(req.signal);
              for await (const chunk of fallbackStream) {
                const chunkText = chunk.text || '';
                if (chunkText) {
                  accumulated += chunkText;
                  controller.enqueue(encodeEvent({ type: 'delta', text: chunkText }));
                }
              }
            }
          }

          if (req.signal.aborted) {
            return;
          }

          const cleanFinal = stripMarkdown(accumulated);
          if (!cleanFinal) {
            const fallback = generateTutorThoughtAndAnswer(effectiveQuestion);
            controller.enqueue(encodeEvent({ type: 'done', answer: fallback.answer }));
          } else {
            if (canUseCache) {
              setCachedTutorReply(effectiveQuestion, cleanFinal, matchedTopics);
            }
            controller.enqueue(encodeEvent({ type: 'done', answer: cleanFinal }));
          }
        } catch (streamError) {
          if (req.signal.aborted) {
            return;
          }
          console.warn('Tutor stream fallback:', streamError);
          const cleanPartial = stripMarkdown(accumulated);
          if (cleanPartial) {
            controller.enqueue(encodeEvent({ type: 'done', answer: cleanPartial }));
          } else {
            const fallback = generateTutorThoughtAndAnswer(effectiveQuestion);
            controller.enqueue(
              encodeEvent({
                type: 'meta',
                matchedTopics: fallback.matchedTopics,
                outOfScope: fallback.outOfScope,
                engine: 'deterministic',
              })
            );
            controller.enqueue(encodeEvent({ type: 'done', answer: fallback.answer }));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.warn('Tutor route fallback:', error);
    const fallback = generateTutorThoughtAndAnswer(question || 'Cambridge 0610 Biology');
    return NextResponse.json({
      answer: fallback.answer,
      outOfScope: fallback.outOfScope,
      matchedTopics: fallback.matchedTopics,
      engine: 'deterministic',
    });
  }
}
