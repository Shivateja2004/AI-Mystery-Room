import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env', import.meta.url) });

try {
  const { generateCase } = await import('../src/services/gemini.js');
  const mystery = await generateCase(
    'A rare painting disappears during a museum gala while every guest claims to have been in the ballroom.',
    'easy'
  );
  const passed = mystery.suspects.length === 3
    && mystery.clues.length === 5
    && mystery.hints.length === 2
    && mystery.suspects.some((suspect) => suspect.id === mystery.culpritId)
    && mystery.solutionEvidence.length >= 2;
  if (!passed) throw new Error('Generated case did not meet the Easy difficulty contract.');
  console.log(`Case-generation test passed: ${mystery.suspects.length} suspects, ${mystery.clues.length} clues, ${mystery.hints.length} hints.`);
} catch (error) {
  console.error(`Case-generation test failed: ${error.name}: ${error.message}`);
  process.exit(1);
}
