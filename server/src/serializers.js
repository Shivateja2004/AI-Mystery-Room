export function publicCase(caseDocument) {
  const discovered = new Set(caseDocument.discoveredClueIds);
  return {
    id: caseDocument.id,
    title: caseDocument.title,
    story: caseDocument.story,
    difficulty: caseDocument.difficulty,
    suspects: caseDocument.suspects.map(({ id, name, description, motive }) => ({ id, name, description, motive })),
    clues: caseDocument.clues.map((clue) => ({
      id: clue.id,
      title: clue.title,
      location: clue.location,
      status: discovered.has(clue.id) ? 'discovered' : 'available',
      ...(discovered.has(clue.id) ? { text: clue.text } : {})
    })),
    progress: {
      discoveredClues: caseDocument.discoveredClueIds,
      hintsUsed: caseDocument.hintsUsed,
      completed: caseDocument.status === 'completed'
    }
  };
}

export function resultDto(caseDocument) {
  const culprit = caseDocument.suspects.find((suspect) => suspect.id === caseDocument.culpritId);
  const clueById = new Map(caseDocument.clues.map((clue) => [clue.id, clue]));
  return {
    correct: caseDocument.accusation.correct,
    accusedSuspectId: caseDocument.accusation.suspectId,
    culprit: { id: culprit.id, name: culprit.name },
    solution: caseDocument.solution,
    solutionEvidence: caseDocument.solutionEvidence.map((id) => ({
      id,
      title: clueById.get(id)?.title,
      text: clueById.get(id)?.text
    })),
    discoveredClues: caseDocument.discoveredClueIds.map((id) => {
      const clue = clueById.get(id);
      return { id, title: clue?.title, location: clue?.location, text: clue?.text };
    }),
    hintsUsed: caseDocument.hintsUsed,
    score: caseDocument.score,
    scoreBreakdown: caseDocument.scoreBreakdown
  };
}
