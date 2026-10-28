import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';
import { difficulties, validateGeneratedCase } from '../schemas.js';
import { AppError } from '../errors.js';

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
// Flash-Lite is a good fit for this bounded JSON task; use Flash as a richer fallback.
const generationModels = ['gemini-3.5-flash-lite', 'gemini-3.6-flash'];

function generationPrompt(premise, difficulty, correction = '') {
  const counts = difficulties[difficulty];
  return `Create a fictional, general-audience mystery case. Premise: ${premise}\nDifficulty: ${difficulty}.\nReturn ONLY valid JSON, with no Markdown or commentary, matching this exact shape:\n{\"title\":string,\"story\":string,\"suspects\":[{\"id\":string,\"name\":string,\"description\":string,\"motive\":string}],\"clues\":[{\"id\":string,\"title\":string,\"location\":string,\"text\":string,\"importance\":\"minor\"|\"major\",\"supports\":[suspectId]}],\"hints\":[string],\"culpritId\":suspectId,\"solution\":string,\"solutionEvidence\":[clueId,clueId]}.\nUse exactly ${counts.suspects} suspects, ${counts.clues} clues, and ${counts.hints} hints. IDs must be unique simple identifiers. The solution must be supported by at least two clues. Clues must be evidence, not an explicit declaration of the culprit. Hints must guide reasoning without naming the culprit. Ensure the timeline is coherent. ${correction}`;
}

function parseJson(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}

export async function generateCase(premise, difficulty) {
  let lastError;
  for (const model of generationModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: generationPrompt(premise, difficulty),
        config: { responseMimeType: 'application/json', temperature: 0.8 }
      });
      return validateGeneratedCase(parseJson(response.text), difficulty);
    } catch (error) {
      lastError = error;
      // Capacity/quota/provider errors should use the fallback model immediately.
      if ([429, 500, 502, 503, 504].includes(Number(error.status))) continue;
    }
    try {
      const response = await ai.models.generateContent({
        model,
        contents: generationPrompt(premise, difficulty, 'Your previous response was invalid. Correct every structural and consistency issue.'),
        config: { responseMimeType: 'application/json', temperature: 0.8 }
      });
      return validateGeneratedCase(parseJson(response.text), difficulty);
    } catch (error) {
      lastError = error;
    }
  }
  console.error('Mystery generation failed:', lastError?.message);
  throw new AppError(503, 'AI_GENERATION_FAILED', 'Unable to generate a valid mystery right now. Please try again.');
}
