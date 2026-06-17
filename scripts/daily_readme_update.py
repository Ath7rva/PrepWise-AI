from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
import os
import sys


IST = timezone(timedelta(hours=5, minutes=30))
START_AT = datetime(2026, 6, 18, 9, 0, 0, tzinfo=IST)
END_AT = datetime(2026, 7, 17, 23, 59, 59, tzinfo=IST)

REPO_ROOT = Path(__file__).resolve().parents[1]
README_PATH = REPO_ROOT / "client" / "README.md"


@dataclass(frozen=True)
class ReadmeNote:
    title: str
    body: str
    commit_message: str

    def render(self) -> str:
        return f"### {self.title}\n\n{self.body}\n"


NOTES = [
    ReadmeNote(
        "Frontend scripts",
        "`npm run dev` starts the Vite dev server, `npm run build` creates the production bundle, `npm run lint` runs ESLint, and `npm run preview` serves the built client locally.",
        "docs: note frontend scripts",
    ),
    ReadmeNote(
        "Backend scripts",
        "The Node backend uses `npm run dev` for `nodemon server.js` during development and `npm start` for the plain `node server.js` production-style entrypoint.",
        "docs: note backend scripts",
    ),
    ReadmeNote(
        "Protected pages",
        "The app protects `/analytics`, `/history`, `/dashboard`, `/interview`, and `/prep-center` with `ProtectedRoute`, while `/`, `/login`, and `/signup` stay public.",
        "docs: note protected pages",
    ),
    ReadmeNote(
        "Theme preference",
        "The floating theme toggle defaults to dark mode and persists the current theme in `localStorage` under `theme`.",
        "docs: note theme preference",
    ),
    ReadmeNote(
        "Backend route map",
        "The Express server mounts `/api/auth`, `/api/ai`, `/api/evaluation`, `/api/history`, `/api/analytics`, and `/api/roadmap` from `server/server.js`.",
        "docs: note backend route map",
    ),
    ReadmeNote(
        "Backend defaults",
        "The backend enables CORS, accepts JSON payloads up to 10 MB, exposes a root health route that returns `API Running Successfully`, and defaults to port `5000` when `PORT` is not set.",
        "docs: note backend defaults",
    ),
    ReadmeNote(
        "Server environment",
        "Current backend wiring depends on `MONGO_URI` for MongoDB, `JWT_SECRET` for auth token signing, and `OPENROUTER_API_KEY` for the AI-backed controllers.",
        "docs: note server environment",
    ),
    ReadmeNote(
        "AI integration",
        "The `ai`, `evaluation`, and `roadmap` controllers call OpenRouter chat completions from the backend instead of sending provider keys to the frontend.",
        "docs: note ai integration",
    ),
    ReadmeNote(
        "Dashboard data",
        "The dashboard fetches both analytics and recent interview history so the main user view can summarize performance and past sessions together.",
        "docs: note dashboard data",
    ),
    ReadmeNote(
        "History tools",
        "The history page keeps a searchable interview list, supports client-side filtering, and lets users drill into question-by-question feedback from saved sessions.",
        "docs: note history tools",
    ),
    ReadmeNote(
        "Interview setup",
        "Interview setup currently supports role, difficulty, experience level, tech stack, company, job description, resume text, practice mode, and an optional targeted skill.",
        "docs: note interview setup",
    ),
    ReadmeNote(
        "Voice input",
        "The interview page uses the browser speech-recognition API through `window.SpeechRecognition || window.webkitSpeechRecognition` for spoken answers.",
        "docs: note voice input",
    ),
    ReadmeNote(
        "Question narration",
        "The interview flow also uses `window.speechSynthesis` to read questions aloud before the answer phase starts.",
        "docs: note question narration",
    ),
    ReadmeNote(
        "Proctor snapshots",
        "During proctored sessions, `ProctorGuard` captures up to 10 JPEG snapshots at intervals while the interview is active.",
        "docs: note proctor snapshots",
    ),
    ReadmeNote(
        "Proctor video clip",
        "The same proctoring flow records up to 30 seconds of WebM camera and microphone footage before packaging the session media for submission.",
        "docs: note proctor video clip",
    ),
    ReadmeNote(
        "Resume PDF parsing",
        "Prep Center reads PDF resumes client-side with `pdfjs-dist`, so text-based PDFs can be analyzed without sending the original file to the server first.",
        "docs: note resume pdf parsing",
    ),
    ReadmeNote(
        "Supported resume file types",
        "Besides PDFs, Prep Center currently accepts `.txt`, `.md`, `.csv`, and `.json` resume files for quick text import.",
        "docs: note supported resume file types",
    ),
    ReadmeNote(
        "Resume analysis payload",
        "Before calling `/api/ai/analyze-fit`, Prep Center trims resume text and job description payloads so large inputs stay within the current backend request limits.",
        "docs: note resume analysis payload",
    ),
    ReadmeNote(
        "Tailored interview launch",
        "Prep Center can launch the interview page directly with `practiceMode` set to `resume-jd`, carrying the chosen role, resume text, and job description into the session.",
        "docs: note tailored interview launch",
    ),
    ReadmeNote(
        "Client libraries",
        "The current frontend dependency set includes `recharts` for analytics visuals, `react-circular-progressbar` for score displays, and `jspdf` for report export.",
        "docs: note client libraries",
    ),
]


def set_output(name: str, value: str) -> None:
    output_path = os.environ.get("GITHUB_OUTPUT")
    if not output_path:
        return

    with open(output_path, "a", encoding="utf-8") as handle:
        handle.write(f"{name}={value}\n")


def get_now() -> datetime:
    override = os.environ.get("README_AUTOMATION_NOW")
    if override:
        return datetime.fromisoformat(override).astimezone(IST)

    return datetime.now(IST)


def in_schedule_window(now: datetime) -> bool:
    return START_AT <= now <= END_AT


def insert_note(readme_text: str, note: ReadmeNote) -> str:
    marker = "\n# React + Vite"
    rendered = f"{note.render()}\n"

    if marker in readme_text:
        return readme_text.replace(marker, f"\n{rendered}{marker}", 1)

    return f"{readme_text.rstrip()}\n\n{rendered}"


def main() -> int:
    now = get_now()
    readme_text = README_PATH.read_text(encoding="utf-8")

    set_output("changed", "false")
    set_output("reason", "none")

    if not in_schedule_window(now):
        set_output("reason", "out_of_window")
        print(f"Skipping README update at {now.isoformat()} because it is outside the scheduled window.")
        return 0

    next_note = next(
        (note for note in NOTES if f"### {note.title}" not in readme_text),
        None,
    )

    if next_note is None:
        set_output("reason", "no_remaining_notes")
        print("Skipping README update because no remaining deterministic notes are left.")
        return 0

    updated_readme = insert_note(readme_text, next_note)

    if updated_readme == readme_text:
        set_output("reason", "unchanged")
        print("Skipping README update because the generated content matched the existing file.")
        return 0

    README_PATH.write_text(updated_readme, encoding="utf-8")
    set_output("changed", "true")
    set_output("reason", "updated")
    set_output("commit_message", next_note.commit_message)
    print(f"Applied README note: {next_note.title}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
