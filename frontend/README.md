# ScriptLab Frontend

This frontend is a React + Vite client for generating short-form video scripts.

## What It Does

- Accepts a content idea from the user
- Lets the user choose a tone: `Dramatic`, `Neutral`, or `Uplifting`
- Lets the user choose a target runtime: `1`, `3`, `5`, or `10` minutes
- Calls the backend API and renders the generated script in a readable layout

## Local Development

1. Install dependencies:
   - `npm install`
2. Create `.env`:
   - `VITE_API_URL=http://localhost:5000`
3. Start the dev server:
   - `npm run dev`

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - build the production bundle
- `npm run lint` - run ESLint
