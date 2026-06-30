## PrepWise Client Notes

This frontend is the React + Vite client for PrepWise AI.

### Local development

```bash
npm install
npm run dev
```

The client reads `VITE_API_URL` from the environment. If it is not set, the code falls back to `http://localhost:5000` during local development and `https://prepwise-ai-backend-a16j.onrender.com` in production. See [`client/src/config/api.js`](C:/Users/salun/OneDrive/Desktop/PrepWise-AI/client/src/config/api.js).

### Auth behavior

After login or signup, the client stores the JWT in `localStorage` under `token` and reuses it through an Axios interceptor that sets the `Authorization` header automatically. The user payload is stored separately under `user`.

### Interview session output

Completed interviews can be exported locally as `PrepWise_Proctored_Interview_Report.pdf`. The interview flow also submits captured proctoring media with the session evaluation payload, including snapshots and a WebM video clip.

### Frontend scripts

`npm run dev` starts the Vite dev server, `npm run build` creates the production bundle, `npm run lint` runs ESLint, and `npm run preview` serves the built client locally.


### Backend scripts

The Node backend uses `npm run dev` for `nodemon server.js` during development and `npm start` for the plain `node server.js` production-style entrypoint.


### Protected pages

The app protects `/analytics`, `/history`, `/dashboard`, `/interview`, and `/prep-center` with `ProtectedRoute`, while `/`, `/login`, and `/signup` stay public.


### Theme preference

The floating theme toggle defaults to dark mode and persists the current theme in `localStorage` under `theme`.


### Backend route map

The Express server mounts `/api/auth`, `/api/ai`, `/api/evaluation`, `/api/history`, `/api/analytics`, and `/api/roadmap` from `server/server.js`.


### Backend defaults

The backend enables CORS, accepts JSON payloads up to 10 MB, exposes a root health route that returns `API Running Successfully`, and defaults to port `5000` when `PORT` is not set.


### Server environment

Current backend wiring depends on `MONGO_URI` for MongoDB, `JWT_SECRET` for auth token signing, and `OPENROUTER_API_KEY` for the AI-backed controllers.


### AI integration

The `ai`, `evaluation`, and `roadmap` controllers call OpenRouter chat completions from the backend instead of sending provider keys to the frontend.


### Dashboard data

The dashboard fetches both analytics and recent interview history so the main user view can summarize performance and past sessions together.


### History tools

The history page keeps a searchable interview list, supports client-side filtering, and lets users drill into question-by-question feedback from saved sessions.


### Interview setup

Interview setup currently supports role, difficulty, experience level, tech stack, company, job description, resume text, practice mode, and an optional targeted skill.


### Voice input

The interview page uses the browser speech-recognition API through `window.SpeechRecognition || window.webkitSpeechRecognition` for spoken answers.


### Question narration

The interview flow also uses `window.speechSynthesis` to read questions aloud before the answer phase starts.


### Proctor snapshots

During proctored sessions, `ProctorGuard` captures up to 10 JPEG snapshots at intervals while the interview is active.


### Proctor video clip

The same proctoring flow records up to 30 seconds of WebM camera and microphone footage before packaging the session media for submission.


### Resume PDF parsing

Prep Center reads PDF resumes client-side with `pdfjs-dist`, so text-based PDFs can be analyzed without sending the original file to the server first.


### Supported resume file types

Besides PDFs, Prep Center currently accepts `.txt`, `.md`, `.csv`, and `.json` resume files for quick text import.


### Resume analysis payload

Before calling `/api/ai/analyze-fit`, Prep Center trims resume text and job description payloads so large inputs stay within the current backend request limits.


### Tailored interview launch

Prep Center can launch the interview page directly with `practiceMode` set to `resume-jd`, carrying the chosen role, resume text, and job description into the session.


### Client libraries

The current frontend dependency set includes `recharts` for analytics visuals, `react-circular-progressbar` for score displays, and `jspdf` for report export.


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
