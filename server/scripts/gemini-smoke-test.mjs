import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ path: new URL('../.env', import.meta.url) });
const model = process.argv[2] || 'gemini-3.6-flash';

if (!process.env.GEMINI_API_KEY) {
  console.error('Gemini smoke test failed: GEMINI_API_KEY is not configured.');
  process.exit(1);
}

try {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model,
    contents: 'Reply with only the JSON object {"ok":true}.',
    config: { responseMimeType: 'application/json' }
  });
  JSON.parse(response.text);
  console.log(`Gemini smoke test passed using ${model}.`);
} catch (error) {
  console.error(`Gemini smoke test failed: ${error.name}: ${error.message}`);
  process.exit(1);
}
