# AI YouTube Script Generator – Backend

## Overview

This is the backend for the AI-powered YouTube script generator. It exposes a single endpoint to generate a video script using OpenAI's API based on user input.

## Features

- POST `/api/generate-script` endpoint
- Input validation
- Converts video length to word count
- Calls OpenAI Chat Completion API
- Handles errors and timeouts
- CORS enabled for frontend integration

## Tech Stack

- Node.js
- Express
- Axios
- dotenv

## Setup Instructions

1. **Clone the repo**
2. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and add your OpenAI API key

4. **Run locally:**
   ```bash
   npm run dev
   # or
   npm start
   ```

## Environment Variables

- `OPENAI_API_KEY` – Your OpenAI API key
- `PORT` – (optional) Port to run the server (default: 5000)

## Deployment (Railway)

- Deploy the backend folder to [Railway](https://railway.app/)
- Set `OPENAI_API_KEY` in Railway environment variables
- Expose port 5000

## Example Request

```
POST /api/generate-script
{
  "idea": "How to learn React fast",
  "tone": "Uplifting",
  "length": 3
}
```

## Example Response

```
{
  "script": "...generated script..."
}
```

## Screenshots

- _[Add screenshots here]_

## What I would say in a 3-min Loom video

- **Architecture:** Simple Express server, modular structure, single endpoint, CORS for frontend.
- **Prompt design:** Prompt is dynamically built to include idea, tone, length, and word count. Follows clear requirements for script structure.
- **Word count logic:** Video length is mapped to word count (1 min = 150, 3 min = 400, 5 min = 700, 10 min = 1300) to guide the AI.
- **Tradeoffs:** No database or authentication for simplicity. Timeout and error handling for reliability. Minimal dependencies for fast deploy.

---

## Deploying to Railway

1. **Push your backend code to GitHub.**
2. **Go to [railway.app](https://railway.app/) and create a new project.**
3. **Connect your GitHub repo and select the `backend` folder.**
4. **Set environment variables in Railway:**
   - `OPENAI_API_KEY` (required)
   - `PORT` (optional, defaults to 5000)
5. **Railway will auto-detect Node.js and deploy.**
6. **After deploy, note your Railway backend URL.**
7. **Update your frontend’s `VITE_API_URL` to point to this Railway URL.**

_You’re now ready to serve your API from the cloud!_

---
