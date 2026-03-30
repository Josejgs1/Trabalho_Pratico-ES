# KULTI — Golden Path

Project conventions and standards for the KULTI development team.

## Language

- All code, comments, commits, and documentation must be written in **English**.

## Naming Conventions

- Use **camelCase** for variables, functions, and file names.
- Use **PascalCase** for React components and class names.
- Use **UPPER_SNAKE_CASE** for constants and environment variables.

## Branch Naming

Branches must follow the pattern: `<type>/<short-description>`

| Type       | Usage                          |
|------------|--------------------------------|
| `feature/` | New features                  |
| `fix/`     | Bug fixes                     |
| `refactor/`| Code refactoring              |
| `setup/`   | Project setup and config      |
| `docs/`    | Documentation-only changes    |

Examples: `feature/user-auth`, `fix/map-marker-click`, `refactor/api-routes`

## Commits

- Write commit messages in **English**.
- Use the imperative mood: `Add user login endpoint`, not `Added` or `Adds`.
- Keep the subject line short (≤ 72 characters).

## Project Structure

```
├── docs/                   # Project documentation
├── backend/
│   └── app/
│       ├── api/            # Route handlers / endpoints
│       ├── models/         # Database models (SQLAlchemy)
│       ├── schemas/        # Pydantic schemas (request/response)
│       ├── services/       # Business logic
│       └── core/           # Config, security, dependencies
├── frontend/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page-level components / routes
│       ├── services/       # API calls and external integrations
│       └── assets/         # Images, fonts, static files
```

## Tech Stack

| Layer      | Technology                |
|------------|---------------------------|
| Frontend   | React.js                  |
| Backend    | FastAPI (Python)          |
| Database   | PostgreSQL + PostGIS      |
| AI         | Gemini API                |

## Documentation Style

- Documentation lives in the `docs/` folder.
- Use Markdown (`.md`) for all docs.
- Keep docs concise and up to date with the codebase.
