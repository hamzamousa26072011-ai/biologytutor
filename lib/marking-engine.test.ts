import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADMIN_EMAIL,
  MAX_DAILY_QUESTIONS,
  canUserGradeQuestion,
  computeTypewriterAdvance,
  detectTotalMarksFromMarkScheme,
  getCompactTutorSystemPrompt,
  getRemainingDailyQuestions,
  gradeSubmissionDeterministic,
  isAdminEmail,
  parseFormattedLines,
} from './marking-engine';
import { searchBiologyNotes } from './biology-notes-kb';
import { executeHedgedStream } from './tutor-hedge';

test('gradeSubmissionDeterministic returns whole marks without letter grade labels', () => {
  const markScheme = `
    1. Osmosis is the net movement of water molecules [1]
    2. from a region of higher water potential to lower water potential [1]
    3. across a partially permeable membrane [1]
    [Total: 3]
  `;
  const studentAnswer =
    'Osmosis is the net movement of water molecules from a region of higher water potential to lower water potential through a partially permeable membrane.';

  const result = gradeSubmissionDeterministic(studentAnswer, markScheme);
  assert.equal(result.totalMarks, 3);
  assert.equal(result.awardedMarks, 3);
  assert.equal(Number.isInteger(result.awardedMarks), true);
  assert.equal(result.percentage, 100);
  assert.equal(/\bGrade\s+[A-G*U]\b/i.test(result.examinerSummary), false);
});

test('detectTotalMarksFromMarkScheme respects max marks', () => {
  const ms = `
    - Thick muscular wall in left ventricle;
    - Pumps blood at higher pressure;
    - All around the body / systemic circulation;
    - Right ventricle only pumps to nearby lungs;
    [max 3]
  `;
  assert.equal(detectTotalMarksFromMarkScheme(ms), 3);
});

test('Critical Unit Rule withholds mark when numeric answer lacks biological unit', () => {
  const ms = `
    1. Magnification = 50 / 0.02 [1]
    2. Actual length = 250 µm [1]
  `;
  const student = 'Magnification is 50 / 0.02 and actual length = 250';
  const result = gradeSubmissionDeterministic(student, ms);
  assert.equal(result.criticalUnitDeducted, true);
  assert.ok(result.awardedMarks < result.totalMarks);
});

test('Contradiction Rule (CON) rejects enzyme killed wording', () => {
  const ms = 'Above optimum temperature the enzyme is denatured and active site changes shape [1]';
  const student = 'Above optimum temperature the enzyme is killed so it cannot work.';
  const result = gradeSubmissionDeterministic(student, ms);
  assert.equal(result.contradictionTriggered, true);
  assert.equal(result.awardedMarks, 0);
});

test('parseFormattedLines extracts headings, numbered items, and bullets cleanly', () => {
  const lines = parseFormattedLines('**Summary**\n1. First point\n- Second bullet');
  assert.equal(lines[0].type, 'heading');
  assert.equal(lines[1].type, 'numbered');
  assert.equal(lines[2].type, 'bullet');
});

test('searchBiologyNotes stays strictly scoped to Cambridge 0610 Biology', () => {
  const bio = searchBiologyNotes('Explain osmosis and water potential in plant cells');
  assert.equal(bio.isOutOfScope, false);
  assert.ok(bio.matches.length >= 1);

  const nonBio = searchBiologyNotes('Solve quadratic equations in algebra');
  assert.equal(nonBio.isOutOfScope, true);
  assert.equal(nonBio.matches.length, 0);
});

test('Standard user daily quota enforces 10 questions/day and requires sign-in', () => {
  const dateKey = '2026-11-12';
  const signedOut = canUserGradeQuestion({}, null, dateKey);
  assert.equal(signedOut.allowed, false);
  assert.equal(signedOut.isAdmin, false);

  const studentEmail = 'student@cambridge-igcse.edu';
  const usageMap = { [`${studentEmail}::${dateKey}`]: 7 };
  assert.equal(getRemainingDailyQuestions(usageMap, studentEmail, dateKey), 3);
  const underLimit = canUserGradeQuestion(usageMap, studentEmail, dateKey);
  assert.equal(underLimit.allowed, true);
  assert.equal(underLimit.remaining, 3);
  assert.equal(underLimit.max, MAX_DAILY_QUESTIONS);

  const atLimitMap = { [`${studentEmail}::${dateKey}`]: 10 };
  const blocked = canUserGradeQuestion(atLimitMap, studentEmail, dateKey);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
});

test('Admin account hamzamousa26072011@gmail.com has unlimited access only when signed in', () => {
  const dateKey = '2026-11-12';
  assert.equal(isAdminEmail(ADMIN_EMAIL), true);
  assert.equal(isAdminEmail('  HAMZAMOUSA26072011@GMAIL.COM '), true);
  assert.equal(isAdminEmail('other@gmail.com'), false);

  const usageMap = { [`${ADMIN_EMAIL}::${dateKey}`]: 250 };
  const adminStatus = canUserGradeQuestion(usageMap, 'HamzaMousa26072011@gmail.com', dateKey);
  assert.equal(adminStatus.allowed, true);
  assert.equal(adminStatus.isAdmin, true);
  assert.equal(adminStatus.remaining, Infinity);
  assert.equal(getRemainingDailyQuestions(usageMap, ADMIN_EMAIL, dateKey), Infinity);

  const signedOutStatus = canUserGradeQuestion(usageMap, null, dateKey);
  assert.equal(signedOutStatus.allowed, false);
  assert.equal(signedOutStatus.isAdmin, false);
});

test('Compact tutor system prompt stays concise and Cambridge 0610 grounded', () => {
  const prompt = getCompactTutorSystemPrompt();
  assert.ok(prompt.includes('0610'));
  assert.ok(prompt.length < 600);
});

test('computeTypewriterAdvance paces smooth fast character steps and completes cleanly', () => {
  const step1 = computeTypewriterAdvance(0, 100, false);
  assert.ok(step1 >= 5 && step1 < 100);

  const tail = computeTypewriterAdvance(97, 100, true);
  assert.equal(tail, 100);

  assert.equal(computeTypewriterAdvance(100, 100, true), 100);
});

test('executeHedgedStream uses fast primary without launching hedge', async () => {
  let hedgeLaunched = false;
  async function* makeStream(items: string[]) {
    for (const text of items) {
      yield { text };
    }
  }

  const chunks: string[] = [];
  const stream = executeHedgedStream(
    async () => makeStream(['Osmosis ', 'is net movement']),
    async () => {
      hedgeLaunched = true;
      return makeStream(['Backup']);
    },
    {
      hedgeDelayMs: 60,
      extractText: (c) => c.text,
    }
  );

  for await (const c of stream) {
    chunks.push(c.text);
  }

  assert.equal(hedgeLaunched, false);
  assert.deepEqual(chunks, ['Osmosis ', 'is net movement']);
});

test('executeHedgedStream launches hedge on slow primary, returns faster hedge, and aborts primary', async () => {
  let primaryAborted = false;
  let hedgeAborted = false;

  const stream = executeHedgedStream(
    async (signal) => ({
      async *[Symbol.asyncIterator]() {
        signal.addEventListener('abort', () => {
          primaryAborted = true;
        });
        await new Promise((r) => setTimeout(r, 250));
        if (!signal.aborted) yield { text: 'Slow primary' };
      },
    }),
    async (signal) => ({
      async *[Symbol.asyncIterator]() {
        signal.addEventListener('abort', () => {
          hedgeAborted = true;
        });
        await new Promise((r) => setTimeout(r, 15));
        yield { text: 'Fast hedge 1' };
        yield { text: 'Fast hedge 2' };
      },
    }),
    {
      hedgeDelayMs: 30,
      extractText: (c) => c.text,
    }
  );

  const out: string[] = [];
  for await (const c of stream) {
    out.push(c.text);
  }

  assert.deepEqual(out, ['Fast hedge 1', 'Fast hedge 2']);
  assert.equal(primaryAborted, true);
  assert.equal(hedgeAborted, false);
});

test('executeHedgedStream falls back immediately when primary fails early', async () => {
  const t0 = Date.now();
  const stream = executeHedgedStream(
    async () => {
      throw new Error('Upstream 503');
    },
    async () => ({
      async *[Symbol.asyncIterator]() {
        yield { text: 'Immediate hedge recovery' };
      },
    }),
    {
      hedgeDelayMs: 500,
      extractText: (c) => c.text,
    }
  );

  const out: string[] = [];
  for await (const c of stream) {
    out.push(c.text);
  }

  assert.deepEqual(out, ['Immediate hedge recovery']);
  assert.ok(Date.now() - t0 < 250);
});
