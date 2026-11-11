import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCambridgeGrade,
  detectTotalMarksFromScheme,
  hasUnitInPromptOrAnswerLine,
  gradeSubmissionDeterministic,
  parseFormattedLines,
  answerBiologyTutorDeterministic,
} from './marking-engine.ts';

describe('Cambridge IGCSE 0610 Marking Engine & Pure Logic', () => {
  it('calculates whole-number percentages and Cambridge grades accurately', () => {
    assert.deepEqual(calculateCambridgeGrade(4, 4), { grade: 'A*', percentage: 100 });
    assert.deepEqual(calculateCambridgeGrade(3, 4), { grade: 'B', percentage: 75 });
    assert.deepEqual(calculateCambridgeGrade(2, 4), { grade: 'D', percentage: 50 });
    assert.deepEqual(calculateCambridgeGrade(0, 4), { grade: 'U', percentage: 0 });
  });

  it('auto-detects total available marks from mark scheme rubric codes', () => {
    const scheme = `[B1] net movement of water molecules;\n[B1] from higher water potential to lower water potential;\n[B1] through a partially permeable membrane;`;
    assert.equal(detectTotalMarksFromScheme(scheme), 3);

    const schemeWithTotal = `[M1] (114 - 30) / 30;\n[A1] 280;\nTotal: [2 marks]`;
    assert.equal(detectTotalMarksFromScheme(schemeWithTotal), 2);
  });

  it('enforces the Critical Unit Rule when unit is printed on the answer line or prompt', () => {
    const prompt = 'Calculate the percentage increase in lactic acid. Answer line: ........... %';
    const scheme = `[M1] (9.5 - 1.9) / 1.9 * 100;\n[A1] 400 (%);`;

    assert.equal(hasUnitInPromptOrAnswerLine(prompt, scheme), true);

    // Student writes only the numerical value "400" without "%" while showing working
    const result = gradeSubmissionDeterministic({
      questionPrompt: prompt,
      markScheme: scheme,
      studentAnswer: '(9.5 - 1.9) / 1.9 * 100 = 400',
    });

    assert.equal(result.totalMarks, 2);
    assert.equal(result.awardedMarks, 2);
    assert.equal(result.marksLost, 0);
    assert.equal(result.unitRuleApplied, true);
    assert.equal(result.grade, 'A*');
  });

  it('enforces whole marks only and identifies lost marks with breakdown', () => {
    const scheme = `[B1] net movement of water molecules;\n[B1] from higher water potential to lower water potential;\n[B1] across a partially permeable membrane;`;
    const studentAnswer = 'Water moves from higher water potential to lower water potential.';

    const result = gradeSubmissionDeterministic({
      markScheme: scheme,
      studentAnswer,
    });

    assert.equal(Number.isInteger(result.awardedMarks), true);
    assert.equal(result.totalMarks, 3);
    assert.equal(result.awardedMarks >= 1 && result.awardedMarks < 3, true);
    assert.equal(result.lostMarksBreakdown.length, result.marksLost);
  });

  it('strips raw markdown asterisks in FormattedContent parser while preserving bold and code segments', () => {
    const raw = `### **Osmosis Definition**\n- Net movement of **water molecules** across \`partially permeable membrane\`.\n1. High **water potential** to low.`;
    const parsed = parseFormattedLines(raw);

    assert.equal(parsed.length, 3);
    assert.equal(parsed[0].kind, 'heading');
    assert.equal(parsed[1].kind, 'bullet');
    assert.equal(parsed[2].kind, 'numbered');
    assert.equal(parsed[2].numberLabel, '01');

    // Verify no segment contains raw '**'
    for (const line of parsed) {
      for (const seg of line.segments) {
        assert.equal(seg.value.includes('**'), false);
      }
    }
  });

  it('grounds tutor answers strictly in the Biology 0610 computerized notes without mentioning filenames or authors', () => {
    const answer = answerBiologyTutorDeterministic('Explain osmosis and water potential in plant cells');
    assert.equal(answer.includes('water potential'), true);
    assert.equal(answer.toLowerCase().includes('nihal'), false);
    assert.equal(answer.toLowerCase().includes('.pdf'), false);
  });
});
