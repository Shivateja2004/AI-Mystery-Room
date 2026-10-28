import { Router } from 'express';
import mongoose from 'mongoose';
import { Case } from '../models/Case.js';
import { AppError, asyncHandler } from '../errors.js';
import { accusationSchema, createCaseSchema, difficulties } from '../schemas.js';
import { generateCase } from '../services/gemini.js';
import { publicCase, resultDto } from '../serializers.js';

export const caseRouter = Router();

function validObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

async function loadCase(id, includeSecrets = false) {
  if (!validObjectId(id)) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found.');
  const query = Case.findById(id);
  if (includeSecrets) query.select('+culpritId +solution +solutionEvidence');
  const mystery = await query;
  if (!mystery) throw new AppError(404, 'CASE_NOT_FOUND', 'Case not found.');
  return mystery;
}

caseRouter.post('/', asyncHandler(async (req, res) => {
  const input = createCaseSchema.parse(req.body);
  const generated = await generateCase(input.premise, input.difficulty);
  const mystery = await Case.create({ ...generated, premise: input.premise, difficulty: input.difficulty });
  return res.status(201).json({ case: publicCase(mystery) });
}));

caseRouter.get('/:id', asyncHandler(async (req, res) => {
  const mystery = await loadCase(req.params.id);
  return res.json({ case: publicCase(mystery) });
}));

caseRouter.post('/:id/clues/:clueId/discover', asyncHandler(async (req, res) => {
  const mystery = await loadCase(req.params.id);
  if (mystery.status === 'completed') throw new AppError(409, 'CASE_COMPLETED', 'This case has already been completed.');
  const clue = mystery.clues.find((item) => item.id === req.params.clueId);
  if (!clue) throw new AppError(404, 'CLUE_NOT_FOUND', 'That clue does not belong to this case.');
  if (!mystery.discoveredClueIds.includes(clue.id)) {
    mystery.discoveredClueIds.push(clue.id);
    await mystery.save();
  }
  return res.json({
    clue: { id: clue.id, title: clue.title, location: clue.location, text: clue.text },
    progress: { discoveredClues: mystery.discoveredClueIds, hintsUsed: mystery.hintsUsed }
  });
}));

caseRouter.post('/:id/hints', asyncHandler(async (req, res) => {
  const mystery = await loadCase(req.params.id);
  if (mystery.status === 'completed') throw new AppError(409, 'CASE_COMPLETED', 'This case has already been completed.');
  if (mystery.hintsUsed >= mystery.hints.length) throw new AppError(409, 'HINTS_EXHAUSTED', 'No hints remain for this case.');
  const hint = mystery.hints[mystery.hintsUsed];
  mystery.hintsUsed += 1;
  await mystery.save();
  return res.json({ hint, hintsUsed: mystery.hintsUsed, hintsRemaining: mystery.hints.length - mystery.hintsUsed });
}));

caseRouter.post('/:id/accuse', asyncHandler(async (req, res) => {
  const { suspectId } = accusationSchema.parse(req.body);
  const mystery = await loadCase(req.params.id, true);
  if (mystery.status === 'completed') throw new AppError(409, 'CASE_COMPLETED', 'A final accusation has already been submitted.');
  if (!mystery.suspects.some((suspect) => suspect.id === suspectId)) throw new AppError(400, 'VALIDATION_ERROR', 'Choose a suspect in this case.');
  const correct = suspectId === mystery.culpritId;
  const cluePoints = mystery.discoveredClueIds.length * 5;
  const hintPenalty = mystery.hintsUsed * 10;
  const base = correct ? difficulties[mystery.difficulty].basePoints : 0;
  const total = Math.max(0, base + cluePoints - hintPenalty);
  mystery.accusation = { suspectId, correct, submittedAt: new Date() };
  mystery.score = total;
  mystery.scoreBreakdown = { base, cluePoints, hintPenalty, total };
  mystery.status = 'completed';
  mystery.completedAt = new Date();
  await mystery.save();
  return res.json({ result: resultDto(mystery) });
}));

caseRouter.get('/:id/result', asyncHandler(async (req, res) => {
  const mystery = await loadCase(req.params.id, true);
  if (mystery.status !== 'completed') throw new AppError(409, 'CASE_NOT_COMPLETED', 'Submit an accusation before viewing results.');
  return res.json({ result: resultDto(mystery) });
}));
