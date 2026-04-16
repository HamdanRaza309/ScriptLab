# ScriptLab Walkthrough

## Overview

ScriptLab is an AI-powered YouTube script generator. It consists of a Node.js/Express backend and a React + Vite frontend. The backend uses OpenAI's API to generate structured scripts, while the frontend provides a modern, user-friendly interface.

---

## Key Features

- Generate YouTube scripts by providing an idea, tone, and runtime
- Supports multiple tones and runtimes
- Input validation with Zod (backend)
- Structured, sectioned script output
- Word count and estimated read time display
- Error handling and clear UI feedback
- Deployable to Railway (backend) and Vercel (frontend)

---

## Architecture & Decisions

### 1. **Separation of Concerns**

- **Backend**: Handles all AI logic, validation, and API endpoints. Keeps secrets (API keys) secure.
- **Frontend**: Handles user input, displays results, and manages UI/UX.

### 2. **Validation with Zod**

- Chosen for robust, declarative validation in the backend.
- Ensures only valid requests reach the OpenAI API, improving reliability and user feedback.

### 3. **Structured Output from OpenAI**

- Prompts are designed to request JSON output, making parsing and UI rendering easier and more reliable.
- Allows for clear section headings and script structure in the frontend.

### 4. **Deployment Choices**

- **Backend**: Deployed to Railway for easy Node.js hosting and environment variable management.
- **Frontend**: Deployed to Vercel for fast, global static hosting and simple environment variable setup.

### 5. **CORS & Environment Variables**

- CORS enabled in backend for secure frontend-backend communication.
- `.env` files and Vercel/Railway environment variables used for configuration and secrets.

### 6. **Error Handling**

- Backend returns clear error messages for validation and AI failures.
- Frontend displays errors and loading states for better UX.

---

## How to Use

1. Deploy backend to Railway and set `OPENAI_API_KEY`.
2. Deploy frontend to Vercel and set `VITE_API_URL` to your Railway backend URL (with `https://`).
3. Visit your Vercel frontend, enter a video idea, select tone and runtime, and generate a script!

---

## Not Implemented (Yet)

- No authentication or database (keeps MVP simple)
- No user accounts or script history
- No advanced prompt tuning or multi-language support

---

## Summary

ScriptLab demonstrates a clean, modern full-stack AI app with clear separation of concerns, robust validation, and cloud deployment. The key decisions focused on reliability, maintainability, and a great user experience.
