# AI Mystery Room --- Project Specification

**Version:** 1.0\
**Status:** Implementation-ready\
**Deployment:** Vercel (React frontend) + Render (Express backend) +
MongoDB Atlas

## 1. Project Overview

AI Mystery Room is a web-based mystery investigation game. Players
provide a premise, choose a difficulty, investigate a Gemini-generated
case by discovering clues and requesting hints, then accuse a suspect.
The backend evaluates the accusation, calculates the score, and reveals
the solution only after submission.

### Problem statement

Mystery games often provide fixed stories and limited replayability. AI
Mystery Room creates replayable mysteries while maintaining structured,
testable game rules and a fair evidence-based solution.

### Target users

-   Casual players who enjoy detective stories and puzzle-solving.
-   Students and developers demonstrating a full-stack AI application.
-   Users on desktop, tablet, and mobile browsers.

### Experience principles

-   Investigative, readable, and immersive.
-   Evidence is discoverable; the answer is never leaked in client
    payloads.
-   AI-generated content is validated before gameplay.
-   Every game action gives clear feedback.
-   The interface is responsive and accessible.

## 2. Goals, Scope, and Limitations

### MVP goals

1.  Create a case from a user premise and difficulty.
2.  Generate a coherent story, suspects, clues, and hints with Gemini.
3.  Let players discover clues and request hints.
4.  Accept one final accusation.
5.  Calculate score on the backend.
6.  Reveal the culprit, explanation, and final score after accusation.
7.  Persist cases and progress in MongoDB.
8.  Deploy and verify the complete experience.

### Out of scope for MVP

-   User accounts, multiplayer, leaderboards, payments, chat, and social
    sharing.
-   Real-time collaborative investigations.
-   Image/audio generation.
-   Guaranteed factual accuracy in fictional content.
-   Unlimited regeneration or unrestricted AI calls.

### Constraints

-   Gemini API key is server-only.
-   The frontend must never receive the culprit, solution rationale,
    hidden clue text, or answer-bearing metadata before the accusation.
-   All game state changes and scoring are server-authoritative.
-   AI output is untrusted and must be schema-validated.
-   Rate limits, request size limits, and graceful provider failure
    handling are required.

## 3. Technology Stack

### Frontend

-   React
-   Vite
-   Tailwind CSS
-   React Router
-   Axios

### Backend

-   Node.js
-   Express
-   Mongoose
-   Google Gemini via `@google/genai`
-   Zod for request and AI response validation

### Data and deployment

-   MongoDB Atlas
-   Render for backend API
-   Vercel for frontend
-   GitHub for source control

## 4. User Flow

1.  User opens the Home page.
2.  User selects **Create Mystery**.
3.  User enters a premise (or uses a suggested premise) and selects
    Easy, Medium, or Hard.
4.  Frontend sends the request to `POST /api/cases`.
5.  Backend validates input, asks Gemini for structured mystery data,
    validates the response, and stores the case.
6.  Backend returns only public case data and a case ID.
7.  User enters the Investigation Room and reads the story.
8.  User opens suspects and investigates available clue locations/cards.
9.  User discovers clues; backend records progress and returns the clue
    text.
10. User may request hints; backend returns the next eligible hint and
    records hint usage.
11. User chooses a suspect and submits an accusation.
12. Backend checks the accusation, computes score, marks the case
    completed, and returns the result.
13. Results page displays correct/incorrect verdict, culprit,
    explanation, score, discovered evidence, and hints used.
14. User can start a new mystery.

## 5. Pages and UI Requirements

### 5.1 Home

-   Product name and concise description.
-   Primary **Start a Mystery** button.
-   Explain the core loop: investigate → collect evidence → accuse.
-   Responsive navigation and footer.

### 5.2 Create Mystery

-   Premise textarea, required, 20--500 characters.
-   Difficulty selector: Easy, Medium, Hard.
-   Optional suggested premise button.
-   Submit button with loading state.
-   Inline validation and API error message.
-   Prevent duplicate submissions while generating.

### 5.3 Investigation Room

-   Case title, story, difficulty, and progress.
-   Suspect cards with name, public description, and motive
    (non-answer-revealing).
-   Clue cards/locations with locked, available, or discovered states.
-   Discover action for each clue.
-   Hint panel with **Request Hint** action and remaining hint count.
-   Progress indicators: clues discovered / total and hints used.
-   Navigation to accusation only after the case is loaded; accusation
    can be submitted even if not all clues are found.
-   Never render hidden clue text, culprit ID, solution, or internal AI
    response.

### 5.4 Accusation

-   Suspect selection.
-   Confirmation prompt before submission.
-   Submit action disabled until a suspect is selected.
-   Show loading state and prevent repeated requests.
-   On success, navigate to Results.

### 5.5 Results

-   Correct or incorrect verdict.
-   Culprit name.
-   Solution explanation and evidence chain.
-   Final score and score breakdown.
-   Discovered clues and hints used.
-   **Play Again** action.

### Shared UI states

-   Loading skeleton/spinner for case generation and API actions.
-   Empty state when no case exists.
-   Not-found state for invalid case ID.
-   Clear error messages with retry where safe.
-   Mobile-first layout; no horizontal overflow.
-   Keyboard-accessible controls, visible focus, semantic headings,
    sufficient contrast, and labels for form controls.

## 6. Difficulty and Game Rules

  Difficulty     Suspects   Clues   Hints   Correct accusation base
  ------------ ---------- ------- ------- -------------------------
  Easy                  3       5       2                       100
  Medium                4       7       3                       150
  Hard                  5       9       3                       200

### Scoring

-   Correct accusation: difficulty base points.
-   Each discovered clue: +5 points.
-   Each hint used: −10 points.
-   Incorrect accusation: 0 base points.
-   Final score cannot be below 0.
-   Formula:

`score = max(0, (correct ? basePoints : 0) + discoveredClueCount * 5 - hintsUsed * 10)`

The backend computes all counts from persisted state. The client must
not submit score, clue count, hint count, or correctness.

### Gameplay rules

-   One final accusation per case.
-   Discovering a clue is idempotent: discovering the same clue twice
    does not award duplicate points.
-   Hints are served in order and cannot exceed the configured count.
-   A completed case cannot be modified or accused again.
-   Clue discovery requires a valid case, valid clue ID, and active case
    status.
-   Results are available only after completion.

## 7. AI Generation and Validation

### Gemini output contract

Gemini must return a JSON object matching this conceptual shape:

``` json
{
  "title": "string",
  "story": "string",
  "suspects": [
    {
      "id": "suspect_1",
      "name": "string",
      "description": "string",
      "motive": "string"
    }
  ],
  "clues": [
    {
      "id": "clue_1",
      "title": "string",
      "location": "string",
      "text": "string",
      "importance": "minor | major",
      "supports": ["suspect_1"]
    }
  ],
  "hints": ["string"],
  "culpritId": "suspect_1",
  "solution": "string",
  "solutionEvidence": ["clue_1", "clue_2"]
}
```

### Generation requirements

-   Generate exact counts based on difficulty.
-   IDs must be unique and stable within the case.
-   Every clue must have a title, location, and discoverable text.
-   The culprit must be one of the generated suspects.
-   The solution must be logically supported by multiple clues.
-   Clues should contain meaningful evidence, not merely state the
    answer.
-   Suspects should have plausible motives and differentiated
    descriptions.
-   Avoid contradictions in timeline, alibis, objects, and locations.
-   Hints should guide reasoning without directly naming the culprit.
-   The mystery should be fictional and safe for a general audience.

### Validation

Use Zod to validate: - Required fields and string length limits. - Exact
suspect, clue, and hint counts for selected difficulty. - Unique IDs. -
`culpritId` exists in suspects. - Every `supports` ID exists in
suspects. - Every `solutionEvidence` ID exists in clues. - Solution
evidence references at least two clues where possible. - No empty or
excessively long strings.

If generation or validation fails: 1. Retry generation once with a
correction prompt. 2. Validate again. 3. If still invalid, return a safe
`AI_GENERATION_FAILED` response and do not save a playable case.

Do not trust Gemini to enforce gameplay or scoring.

## 8. Backend Architecture and API

Base path: `/api`

### 8.1 `POST /api/cases`

Create a mystery.

**Request**

``` json
{
  "premise": "A rare painting disappears during a museum gala.",
  "difficulty": "medium"
}
```

**Success `201`**

``` json
{
  "case": {
    "id": "case_id",
    "title": "The Vanishing Canvas",
    "story": "Public story text",
    "difficulty": "medium",
    "suspects": [],
    "clues": [
      {
        "id": "clue_1",
        "title": "The Gallery Clock",
        "location": "West Gallery",
        "status": "available"
      }
    ],
    "progress": {
      "discoveredClues": [],
      "hintsUsed": 0,
      "completed": false
    }
  }
}
```

Only public fields are returned. Do not include hidden clue text,
`culpritId`, `solution`, `solutionEvidence`, or raw Gemini output.

Validation: - `premise`: string, trimmed, 20--500 characters. -
`difficulty`: enum `easy | medium | hard`. - Apply rate limiting.

### 8.2 `GET /api/cases/:id`

Retrieve active case public data and progress. - Return `200` with
public case DTO. - Return `404 CASE_NOT_FOUND` for invalid/nonexistent
ID. - For completed cases, use the result endpoint or return a completed
public state without exposing the solution.

### 8.3 `POST /api/cases/:id/clues/:clueId/discover`

Discover a clue. - Validate case ID and clue ID. - Reject completed
cases. - Record clue discovery once. - Return discovered clue text and
updated progress. - Return `404 CLUE_NOT_FOUND` if clue does not belong
to case.

**Success**

``` json
{
  "clue": {
    "id": "clue_1",
    "title": "The Gallery Clock",
    "location": "West Gallery",
    "text": "Private clue text"
  },
  "progress": {
    "discoveredClues": ["clue_1"],
    "hintsUsed": 0
  }
}
```

### 8.4 `POST /api/cases/:id/hints`

Request the next hint. - Reject completed cases. - Return next hint
according to persisted hint index. - Increment hint usage only when a
hint is successfully returned. - Return `409 HINTS_EXHAUSTED` when all
hints have been used.

**Success**

``` json
{
  "hint": "Look closely at the timing of the deliveries.",
  "hintsUsed": 1,
  "hintsRemaining": 2
}
```

### 8.5 `POST /api/cases/:id/accuse`

Submit the final accusation.

**Request**

``` json
{ "suspectId": "suspect_2" }
```

-   Validate suspect belongs to the case.
-   Reject if case already completed.
-   Compare with backend-only culprit ID.
-   Calculate score from persisted clue and hint counts.
-   Save accusation, completion time, correctness, score, and result.
-   Return solution only after successful completion.

**Success**

``` json
{
  "result": {
    "correct": false,
    "accusedSuspectId": "suspect_2",
    "culprit": {
      "id": "suspect_1",
      "name": "Alex Morgan"
    },
    "solution": "Explanation of what happened.",
    "solutionEvidence": ["clue_1", "clue_4"],
    "score": 25,
    "scoreBreakdown": {
      "base": 0,
      "cluePoints": 35,
      "hintPenalty": 10,
      "total": 25
    }
  }
}
```

### 8.6 `GET /api/cases/:id/result`

-   Return `409 CASE_NOT_COMPLETED` before accusation.
-   Return saved result after completion.
-   Do not re-run Gemini or recalculate a completed result.

### Standard error format

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Difficulty must be easy, medium, or hard."
  }
}
```

Use appropriate HTTP statuses: `400` validation, `404` not found, `409`
invalid game state, `429` rate limit, `500` unexpected server error,
`503` AI/database unavailable. Never return stack traces, provider
secrets, or raw prompts to clients.

## 9. MongoDB / Mongoose Data Model

### Case document

Suggested fields:

-   `title: String`
-   `story: String`
-   `premise: String`
-   `difficulty: enum`
-   `suspects: [{ id, name, description, motive }]`
-   `clues: [{ id, title, location, text, importance, supports }]`
-   `hints: [String]`
-   `culpritId: String` --- backend only
-   `solution: String` --- backend only
-   `solutionEvidence: [String]` --- backend only
-   `discoveredClueIds: [String]`
-   `hintsUsed: Number`
-   `accusation: { suspectId, correct, submittedAt }`
-   `score: Number`
-   `scoreBreakdown: { base, cluePoints, hintPenalty, total }`
-   `status: enum active | completed`
-   `createdAt`, `updatedAt`, `completedAt`

Use timestamps and indexes for case ID and status. Use Mongoose
validation and avoid storing duplicate discovered clue IDs. Consider a
TTL policy only if temporary cases are desired; do not expire cases
during the demo.

### Data privacy

-   Public DTOs must be explicitly constructed (allowlist), not
    serialized directly from Mongoose documents.
-   Never send hidden solution fields in initial case responses.
-   Keep API keys and database credentials in environment variables.
-   No personal data is required for MVP.

## 10. Frontend Structure

Suggested layout:

``` text
client/
  src/
    components/
      Navbar.jsx
      SuspectCard.jsx
      ClueCard.jsx
      HintPanel.jsx
      LoadingState.jsx
      ErrorMessage.jsx
    pages/
      Home.jsx
      CreateMystery.jsx
      InvestigationRoom.jsx
      Accusation.jsx
      Results.jsx
    services/
      api.js
    App.jsx
    main.jsx
```

Suggested routes: - `/` --- Home - `/create` --- Create Mystery -
`/case/:id` --- Investigation Room - `/case/:id/accuse` --- Accusation -
`/case/:id/results` --- Results

Use Axios with a configured API base URL. Read the backend URL from
`VITE_API_BASE_URL`. Do not store secrets in Vite environment variables.
Keep case IDs in route parameters and retrieve state from the backend.

## 11. Environment Configuration

### Backend `.env`

``` env
PORT=5000
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=...
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend `.env`

``` env
VITE_API_BASE_URL=http://localhost:5000/api
```

Production: - Render: set `MONGODB_URI`, `GEMINI_API_KEY`, `CLIENT_URL`,
`NODE_ENV=production`. - Vercel: set `VITE_API_BASE_URL` to the deployed
Render API URL ending in `/api`. - Configure CORS to allow only the
deployed frontend origin and localhost during development. - Never
commit `.env` files. Add `.env`, `node_modules`, and build output to
`.gitignore`.

## 12. Security and Reliability

-   Keep Gemini key on Render only.
-   Validate every request using Zod.
-   Validate and sanitize AI output before database writes.
-   Use explicit public DTO serializers.
-   Apply CORS allowlist, Helmet, JSON body size limit, and rate
    limiting.
-   Use server-side score calculation.
-   Prevent duplicate clue rewards and repeated accusations.
-   Avoid exposing internal errors or hidden fields.
-   Use environment-specific configuration.
-   Handle Gemini timeout, quota, malformed JSON, MongoDB outage, and
    network failure.
-   Set reasonable request timeouts and retry generation at most once.
-   Do not log API keys, full secrets, or hidden solution content in
    production logs.

## 13. Testing Plan

### Backend tests

-   Valid and invalid premise/difficulty.
-   Exact counts for all difficulty levels.
-   Invalid Gemini JSON and schema mismatch.
-   Culprit ID and evidence references validated.
-   Public case response excludes culprit and solution.
-   Clue discovery is idempotent.
-   Invalid clue/suspect IDs rejected.
-   Hint exhaustion and hint penalty.
-   Correct and incorrect accusation scoring.
-   Minimum score is zero.
-   Completed case cannot be changed or accused again.
-   Result endpoint blocks before accusation.
-   Provider and database failures return safe errors.

### Frontend tests / manual checks

-   Home navigation and create form.
-   Loading, validation, empty, and error states.
-   Suspect and clue cards render correctly.
-   Discover clue updates progress.
-   Hint usage updates remaining count.
-   Accusation confirmation and submission.
-   Results and score breakdown.
-   Play Again starts a new case.
-   Responsive layout on mobile and desktop.
-   Keyboard navigation and visible focus.

### Acceptance criteria

-   [ ] Easy, Medium, and Hard mysteries generate with exact required
    counts.
-   [ ] User can discover clues and request hints.
-   [ ] User can submit a final accusation.
-   [ ] Solution is never returned before accusation.
-   [ ] Backend owns game state and score calculation.
-   [ ] Results show verdict, culprit, explanation, evidence, and score.
-   [ ] AI failures are handled without saving invalid cases.
-   [ ] Complete flow works on the deployed Vercel + Render website.
-   [ ] GitHub repository contains source and setup instructions, but no
    secrets.

## 14. Deployment Plan

### MongoDB Atlas

1.  Create a database and database user.
2.  Configure network access for Render.
3.  Copy the connection string into Render environment variables.
4.  Verify the backend can connect.

### Render backend

1.  Push project to GitHub.
2.  Create a Render Web Service from the backend directory.
3.  Build command: `npm install`.
4.  Start command: `npm start` (or `node src/server.js`, matching the
    implemented entry point).
5.  Set environment variables.
6.  Configure health endpoint `GET /health`.
7.  Confirm logs show server and database readiness without exposing
    secrets.

### Vercel frontend

1.  Import the GitHub repository.
2.  Set root directory to `client`.
3.  Build command: `npm run build`.
4.  Output directory: `dist`.
5.  Set `VITE_API_BASE_URL` to the Render API URL.
6.  Configure SPA rewrites so React Router routes load directly.
7.  Deploy and test production API calls.

### Production smoke test

-   Open the live website.
-   Create one Easy, one Medium, and one Hard case.
-   Discover at least one clue and request a hint.
-   Submit both a correct and incorrect accusation in separate cases.
-   Verify score breakdown and solution reveal.
-   Refresh the investigation page and verify persisted progress.
-   Confirm no Gemini key or hidden solution appears in browser network
    responses.

## 15. Deliverables

1.  `SPEC.md` --- this specification.
2.  GitHub repository containing frontend and backend source.
3.  MongoDB Atlas database configuration (credentials kept private).
4.  Deployed Render backend URL.
5.  Deployed Vercel website URL.
6.  Evidence of a complete live mystery-solving flow (screenshots or
    demo recording if required).

## 16. Definition of Done

The project is complete when the specification is implemented, all
acceptance criteria pass, the application is deployed to Vercel and
Render, and a user can create, investigate, accuse, and view the result
of a mystery on the live website without the solution being exposed
prematurely.
