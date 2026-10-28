import mongoose from 'mongoose';

const suspectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  motive: { type: String, required: true }
}, { _id: false });

const clueSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  text: { type: String, required: true },
  importance: { type: String, enum: ['minor', 'major'], required: true },
  supports: { type: [String], required: true }
}, { _id: false });

const caseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  story: { type: String, required: true },
  premise: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  suspects: { type: [suspectSchema], required: true },
  clues: { type: [clueSchema], required: true },
  hints: { type: [String], required: true },
  culpritId: { type: String, required: true, select: false },
  solution: { type: String, required: true, select: false },
  solutionEvidence: { type: [String], required: true, select: false },
  discoveredClueIds: { type: [String], default: [] },
  hintsUsed: { type: Number, default: 0, min: 0 },
  accusation: {
    suspectId: String,
    correct: Boolean,
    submittedAt: Date
  },
  score: Number,
  scoreBreakdown: {
    base: Number,
    cluePoints: Number,
    hintPenalty: Number,
    total: Number
  },
  status: { type: String, enum: ['active', 'completed'], default: 'active', index: true },
  completedAt: Date
}, { timestamps: true });

caseSchema.index({ createdAt: -1 });

export const Case = mongoose.model('Case', caseSchema);
