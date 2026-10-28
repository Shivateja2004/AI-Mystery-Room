# AI Mystery Room

A full-stack, AI-generated mystery investigation game. The backend owns game state and never exposes the culprit, solution, or undiscovered clue text until a player submits an accusation.

## Project structure

```text
AI Mystery Room/
├── client/                 # React, Vite, Tailwind frontend
│   ├── src/
│   │   ├── components/     # Reusable UI pieces
│   │   ├── pages/          # Home, creation, investigation, results
│   │   └── services/       # API client
│   └── .env.example
├── server/                 # Express, MongoDB, Gemini backend
│   ├── src/
│   │   ├── models/         # Mongoose Case schema
│   │   ├── routes/         # API endpoints
│   │   └── services/       # Gemini case generation
│   ├── .env.example
│   └── package.json
├── render.yaml             # Render backend deployment configuration
└── spec.md                 # Original project specification
```

## Run locally

1. Copy `server/.env.example` to `server/.env` and set a MongoDB Atlas URI and Gemini API key.
2. Install and start the backend:

   ```bash
   cd server
   npm install
   npm run dev
   ```

3. In another terminal, copy `client/.env.example` to `client/.env`, then install and start the frontend:

   ```bash
   cd client
   npm install
   npm run dev
   ```

The client is available at `http://localhost:5173`; the API health check is at `http://localhost:5000/health`.

## Deploy

- **Render:** create a Node web service with `server` as its root directory. Use `npm install` as the build command and `npm start` as the start command. Configure `MONGODB_URI`, `GEMINI_API_KEY`, `CLIENT_URL`, and `NODE_ENV=production`.
- **Vercel:** set the project root directory to `client`. Set `VITE_API_BASE_URL` to `https://YOUR-RENDER-SERVICE.onrender.com/api`. The included `vercel.json` provides a React Router fallback.

## Backend API

- `POST /api/cases` creates a case.
- `GET /api/cases/:id` retrieves safe active-case data.
- `POST /api/cases/:id/clues/:clueId/discover` reveals a clue once.
- `POST /api/cases/:id/hints` returns the next hint.
- `POST /api/cases/:id/accuse` closes the case and returns its result.
- `GET /api/cases/:id/result` returns a completed result.

The source implementation follows the full rules in `spec.md`.
