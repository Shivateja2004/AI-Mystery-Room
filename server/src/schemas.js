import { z } from 'zod';

export const difficulties = {
  easy: { suspects: 3, clues: 5, hints: 2, basePoints: 100 },
  medium: { suspects: 4, clues: 7, hints: 3, basePoints: 150 },
  hard: { suspects: 5, clues: 9, hints: 3, basePoints: 200 }
};

export const createCaseSchema = z.object({
  premise: z.string().trim().min(20, 'Premise must be at least 20 characters.').max(500, 'Premise must be 500 characters or fewer.'),
  difficulty: z.enum(['easy', 'medium', 'hard'])
});

export const accusationSchema = z.object({
  suspectId: z.string().trim().min(1, 'Choose a suspect before accusing.')
});

const id = z.string().regex(/^[a-z][a-z0-9_\-]*$/i, 'IDs may use letters, numbers, hyphens, and underscores.').max(60);
const limitedText = (min, max) => z.string().trim().min(min).max(max);

export const generatedCaseSchema = z.object({
  title: limitedText(3, 120),
  story: limitedText(80, 3000),
  suspects: z.array(z.object({
    id,
    name: limitedText(2, 100),
    description: limitedText(15, 500),
    motive: limitedText(10, 500)
  })),
  clues: z.array(z.object({
    id,
    title: limitedText(3, 120),
    location: limitedText(2, 120),
    text: limitedText(20, 1000),
    importance: z.enum(['minor', 'major']),
    supports: z.array(id).min(1).max(5)
  })),
  hints: z.array(limitedText(10, 500)),
  culpritId: id,
  solution: limitedText(60, 3000),
  solutionEvidence: z.array(id).min(2)
});

export function validateGeneratedCase(value, difficulty) {
  const parsed = generatedCaseSchema.parse(value);
  const counts = difficulties[difficulty];
  const suspectIds = new Set(parsed.suspects.map((suspect) => suspect.id));
  const clueIds = new Set(parsed.clues.map((clue) => clue.id));
  const unique = (items) => new Set(items).size === items.length;

  if (parsed.suspects.length !== counts.suspects || parsed.clues.length !== counts.clues || parsed.hints.length !== counts.hints) {
    throw new Error(`Expected exactly ${counts.suspects} suspects, ${counts.clues} clues, and ${counts.hints} hints.`);
  }
  if (!unique(parsed.suspects.map((suspect) => suspect.id)) || !unique(parsed.clues.map((clue) => clue.id))) {
    throw new Error('Suspect and clue IDs must be unique.');
  }
  if (!suspectIds.has(parsed.culpritId)) throw new Error('culpritId must reference a suspect.');
  if (parsed.clues.some((clue) => clue.supports.some((suspectId) => !suspectIds.has(suspectId)))) {
    throw new Error('Every clue support reference must reference a suspect.');
  }
  if (parsed.solutionEvidence.some((clueId) => !clueIds.has(clueId))) {
    throw new Error('Every solution evidence reference must reference a clue.');
  }
  if (!unique(parsed.solutionEvidence)) throw new Error('Solution evidence IDs must be unique.');
  return parsed;
}
