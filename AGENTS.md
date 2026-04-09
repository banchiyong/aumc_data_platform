# Repository Guidelines

## Project Structure & Module Organization
This repository is split into `backend/` and `frontend/`.

- `backend/app/`: FastAPI application code, organized by `api/`, `core/`, `db/`, `models/`, `schemas/`, and `services/`
- `backend/tests/`: pytest fixtures and backend tests
- `backend/scripts/`: one-off maintenance scripts
- `frontend/app/`: Next.js App Router pages and route layouts
- `frontend/components/`: shared UI and feature components
- `frontend/lib/`: API clients, actions, and utilities
- `frontend/public/`: static assets when needed

## Build, Test, and Development Commands
Run commands from the relevant package directory unless noted.

- `cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt`: set up the backend
- `cd backend && uvicorn app.main:app --reload --port 10402`: start the API locally
- `cd backend && python -m pytest`: run backend tests
- `cd frontend && npm install`: install frontend dependencies
- `cd frontend && npm run dev -- -p 10401`: start the Next.js app
- `cd frontend && npm run build`: create a production build
- `cd frontend && npm run lint`: run ESLint
- `docker-compose up`: run both services together with the checked-in local ports

## Coding Style & Naming Conventions
Follow the existing style in each stack.

- Python: 4-space indentation, snake_case modules, type-aware FastAPI/Pydantic code
- TypeScript/React: 2-space indentation, PascalCase for components such as `NoticeCard.tsx`, lower-case route folders under `frontend/app/`, and small utilities in `frontend/lib/`
- Keep changes localized; prefer extending existing modules before adding new abstractions

## Testing Guidelines
Backend tests use `pytest` with discovery configured in `backend/pytest.ini` (`test_*.py`, `Test*`, `test_*`). Add or update backend tests for behavior changes, especially around API routes, auth, and data handling. The frontend currently has linting but no dedicated test runner; for UI changes, include clear manual verification notes.

## Commit & Pull Request Guidelines
Recent history uses short, imperative subjects with prefixes such as `fix:`, `docs:`, and `security:`. Keep that pattern. Limit each commit to one concern. Pull requests should summarize backend/frontend impact, list verification performed (`pytest`, `npm run lint`, manual checks), link related issues, and include screenshots for visible UI changes.

## Security & Configuration Tips
Do not commit real secrets or production credentials. Local defaults use ports `10401` and `10402`; keep environment-specific values in local config or environment variables, not hard-coded into application logic.

## Agent-Specific Instructions
When asked to restart local services, execute the restart directly instead of first checking whether the service is already running. For this repository, treat frontend `10401` and backend `10402` restart requests as action requests, not investigation requests.

Reuse this local verification account for end-to-end checks unless the user asks otherwise:
- Email: `codex_verify_20260409@aumc.ac.kr`
- Password: `Codex1234!`
- Role: `RESEARCHER`
