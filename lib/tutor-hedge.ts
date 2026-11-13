export interface HedgedStreamOptions<T> {
  hedgeDelayMs?: number;
  outerSignal?: AbortSignal;
  extractText: (chunk: T) => string;
  onHedgeTriggered?: () => void;
}

interface CandidateAttempt<T> {
  label: 'primary' | 'hedge';
  controller: AbortController;
  iterator: AsyncIterator<T> | null;
  firstChunk: T | null;
  firstText: string;
}

/**
 * Races a primary streaming generator against a speculative hedged stream.
 * If the primary yields its first non-empty text chunk before `hedgeDelayMs`,
 * the hedge is never launched. Otherwise the hedge launches concurrently and
 * whichever produces non-empty text first wins while the slower stream aborts.
 */
export async function* executeHedgedStream<T>(
  startPrimary: (signal: AbortSignal) => Promise<AsyncIterable<T>>,
  startHedge: (signal: AbortSignal) => Promise<AsyncIterable<T>>,
  options: HedgedStreamOptions<T>
): AsyncGenerator<T, void, unknown> {
  const hedgeDelayMs = options.hedgeDelayMs ?? 800;
  const outerSignal = options.outerSignal;

  if (outerSignal?.aborted) {
    return;
  }

  const primaryController = new AbortController();
  const hedgeController = new AbortController();

  const onOuterAbort = () => {
    primaryController.abort();
    hedgeController.abort();
  };
  outerSignal?.addEventListener('abort', onOuterAbort, { once: true });

  const runUntilFirstText = async (
    label: 'primary' | 'hedge',
    starter: (signal: AbortSignal) => Promise<AsyncIterable<T>>,
    controller: AbortController
  ): Promise<CandidateAttempt<T>> => {
    const iterable = await starter(controller.signal);
    const iterator = iterable[Symbol.asyncIterator]();

    while (true) {
      if (controller.signal.aborted) {
        throw new Error(`${label} aborted`);
      }
      const step = await iterator.next();
      if (step.done) {
        throw new Error(`${label} completed without text`);
      }
      const text = options.extractText(step.value);
      if (text.length > 0) {
        return {
          label,
          controller,
          iterator,
          firstChunk: step.value,
          firstText: text,
        };
      }
    }
  };

  let hedgeStarted = false;
  let hedgeTimer: ReturnType<typeof setTimeout> | null = null;
  let hedgePromise: Promise<CandidateAttempt<T>> | null = null;
  let primarySettled = false;

  const triggerHedge = (): Promise<CandidateAttempt<T>> => {
    if (!hedgePromise) {
      hedgeStarted = true;
      if (hedgeTimer) {
        clearTimeout(hedgeTimer);
        hedgeTimer = null;
      }
      options.onHedgeTriggered?.();
      hedgePromise = runUntilFirstText('hedge', startHedge, hedgeController);
      // Prevent unhandled rejection if primary wins while hedge rejects later
      hedgePromise.catch(() => {});
    }
    return hedgePromise;
  };

  let winner: CandidateAttempt<T> | null = null;
  let loserController: AbortController | null = null;
  let loserIteratorPromise: Promise<CandidateAttempt<T>> | null = null;

  try {
    const primaryPromise = runUntilFirstText('primary', startPrimary, primaryController);
    primaryPromise.catch(() => {});

    // Wait for primary up to hedgeDelayMs; if primary fails early, start hedge immediately
    const earlyOutcome = await new Promise<
      { kind: 'won'; attempt: CandidateAttempt<T> } | { kind: 'hedge'; primaryFailed: boolean }
    >((resolve) => {
      hedgeTimer = setTimeout(() => {
        if (!primarySettled) {
          resolve({ kind: 'hedge', primaryFailed: false });
        }
      }, hedgeDelayMs);

      primaryPromise.then(
        (attempt) => {
          primarySettled = true;
          if (hedgeTimer) {
            clearTimeout(hedgeTimer);
            hedgeTimer = null;
          }
          resolve({ kind: 'won', attempt });
        },
        () => {
          primarySettled = true;
          if (hedgeTimer) {
            clearTimeout(hedgeTimer);
            hedgeTimer = null;
          }
          resolve({ kind: 'hedge', primaryFailed: true });
        }
      );
    });

    if (earlyOutcome.kind === 'won') {
      winner = earlyOutcome.attempt;
    } else if (earlyOutcome.primaryFailed) {
      winner = await triggerHedge();
    } else {
      const hedgeAttemptPromise = triggerHedge();
      winner = await Promise.any([primaryPromise, hedgeAttemptPromise]);
    }

    if (winner.label === 'primary') {
      loserController = hedgeController;
      loserIteratorPromise = hedgeStarted ? hedgePromise : null;
    } else {
      loserController = primaryController;
      loserIteratorPromise = primaryPromise;
    }

    // Abort losing attempt promptly without blocking the winner stream
    loserController.abort();
    if (loserIteratorPromise) {
      loserIteratorPromise
        .then((loser) => loser.iterator?.return?.())
        .catch(() => {});
    }

    if (winner.firstChunk !== null) {
      yield winner.firstChunk;
    }

    if (winner.iterator) {
      while (true) {
        if (outerSignal?.aborted) break;
        const step = await winner.iterator.next();
        if (step.done) break;
        yield step.value;
      }
    }
  } finally {
    if (hedgeTimer) {
      clearTimeout(hedgeTimer);
      hedgeTimer = null;
    }
    outerSignal?.removeEventListener('abort', onOuterAbort);
    if (winner?.label !== 'primary') {
      primaryController.abort();
    }
    if (winner?.label !== 'hedge') {
      hedgeController.abort();
    }
    try {
      await winner?.iterator?.return?.();
    } catch {
      // Ignore iterator cleanup errors
    }
  }
}
