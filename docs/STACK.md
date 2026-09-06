# Stack & tooling rationale

Why this repo is set up the way it is — referenced from comments in the config files
themselves, collected here so the reasoning doesn't get lost.

## Two ecosystems, one repo

Prototypes are either a TypeScript/React frontend (`ts-*`) or a Python/FastAPI backend
(`py-*`). Rather than pick one stack for every idea, both are first-class, each with its
own workspace tooling:

- **TypeScript** — [pnpm workspaces](https://pnpm.io/workspaces), declared in
  `pnpm-workspace.yaml`.
- **Python** — [uv workspaces](https://docs.astral.sh/uv/concepts/projects/workspaces/),
  declared in the root `pyproject.toml`.

The `ts-`/`py-` prefix convention (on folders under `packages/`, `templates/`, and
`prototypes/`) is what the two workspace globs key off of — it's also what lets a
Python-only prototype sit right next to a TS-only one without either workspace tool
accidentally picking up the wrong folder.

## Why `pre-commit` instead of Husky + lint-staged

Most prototypes here will be TypeScript, but the repo isn't only TypeScript — and
Husky/lint-staged is a Node-only hook runner. [`pre-commit`](https://pre-commit.com) is
the one orchestrator that's language-agnostic, so it runs both the Python hooks (ruff)
and the JS hooks (eslint, prettier) from a single `.pre-commit-config.yaml`, regardless
of which stack a given prototype uses.

## Why one repo-wide ESLint config and one repo-wide `ruff.toml`

`eslint.config.js` and `ruff.toml` both live at the repo root and apply to every
package — no per-package config duplication. Both tools support this natively:

- ESLint's flat config lints every `ts-*` workspace member with type-aware rules (via
  `projectService`) from the single root config.
- Ruff walks up from whatever file it's linting to find `ruff.toml`, so
  `uv run ruff check .` behaves identically whether run from the repo root or from
  inside a single prototype folder.

The one thing that _can't_ be centralized this way is `[lint.isort] known-first-party`
in `ruff.toml` — it has to name each package's actual importable module name
(`py_shared`, `py_service`), which only exists for the two permanent packages. A
freshly scaffolded prototype's module name isn't (and can't be) in that list, which is
why `alembic/env.py`'s import order is excluded from linting per-prototype (see the
comment in `ruff.toml`) rather than solved by scaling the list.

## uv workspaces share ONE virtual environment

This is the sharpest edge in the whole setup, worth calling out explicitly: unlike
pnpm (where every workspace member gets its own `node_modules`), a uv workspace
resolves and installs into a **single shared `.venv` at the repo root**. Running
`uv sync` scoped to one member (e.g. `cd packages/py-shared && uv sync`) reconciles
that shared venv down to _only_ that member's dependencies — silently uninstalling
whatever another member (e.g. `templates/py-service`'s FastAPI/SQLAlchemy/Pydantic)
had installed.

Concretely, this breaks the naive version of "loop over every Python package and run
its checks" — each iteration's `uv sync` would undo the previous one's. The fix,
implemented in `scripts/py-check.sh`:

1. `uv sync --all-packages` once, up front, to install every member's dependencies
   into the shared venv together.
2. `uv run --no-sync <cmd>` per package after that — `--no-sync` is what stops each
   invocation from silently re-scoping (and narrowing) the shared environment.

If you're running Python tooling by hand across more than one package, use this same
`--all-packages` / `--no-sync` pattern, or symptoms like "no module named pydantic"
mypy plugin errors in a package that doesn't even use Pydantic (mypy config —
`[tool.mypy]` in the root `pyproject.toml` — is resolved by walking up parent
directories, so it applies repo-wide even though its `pydantic.mypy` plugin is only
actually needed by `py-service`) will show up depending on whichever package was
synced last.

## Why FastAPI + Pydantic v2 + SQLAlchemy 2.0 for the Python template

A conventional, boring stack on purpose — the point of a template is to not have to
make these decisions again for every new prototype. SQLAlchemy models (`models.py`)
and Pydantic schemas (`schemas.py`) are kept as separate files even though that's an
extra file for a throwaway prototype: it means the DB shape can change without
breaking the API contract, and vice versa, which matters as soon as a prototype gets
real usage.

Data lives in SQLite by default (zero external infra to start prototyping) and reads
its URL from `Settings.database_url`, overridable via `APP_DATABASE_URL`. Tables are
created directly from the models (`Base.metadata.create_all`) on startup for
prototyping speed, but a real Alembic migration setup (`alembic/`) is scaffolded from
day one with an initial migration matching the starting schema — switch to
`alembic revision --autogenerate` for schema changes as soon as a prototype needs to
preserve data across deploys, and drop the `create_all` call in `main.py`'s lifespan
handler at that point.

`ruff.toml`'s `flake8-bugbear` config explicitly allowlists `fastapi.Depends` (and
`Query`/`Path`/`Body`) via `extend-immutable-calls` — B008 (no function calls in
argument defaults) is a real footgun in general, but calling `Depends()` in a default
is _the_ idiomatic FastAPI dependency-injection pattern, not the mutable-default bug
the rule exists to catch.

## Why Vite + React + Vitest for the TypeScript template

Same reasoning: a fast, conventional default so prototypes start from working code,
not from stack decisions. One thing worth knowing if you ever bump dependencies here:
Vite and Vitest version together — Vitest 2.x only supports Vite 5/6, so pairing it
with Vite 8 (as this template does) requires Vitest 5.x. If `pnpm run build` or
`typecheck` starts failing with deep, confusing type-mismatch errors pointing at two
different resolved copies of `vite/dist/node/index`, a Vite/Vitest version mismatch is
almost certainly why — check `vitest`'s peer dependency range against the installed
Vite version.

The test setup (`src/test-setup.ts`) explicitly registers `afterEach(() => cleanup())`
rather than relying on `@testing-library/react`'s automatic cleanup — that automatic
cleanup only registers itself if `afterEach` already exists as a _global_ at the
moment the library is imported, which requires `test.globals: true` in the Vite
config. This template intentionally imports test APIs explicitly (`import { describe,
it, expect } from 'vitest'`) instead of turning on globals, so cleanup has to be
wired up by hand — omitting it doesn't error, it just leaks DOM between tests in ways
that only show up as flaky "found multiple elements" failures once a suite has more
than one test.

## Alembic scaffolding lives inside the template, not just referenced by it

The template's own README describes an Alembic setup "already" living in `alembic/` —
so it does: `alembic.ini`, `alembic/env.py` (wired to the app's `Settings` and
`Base.metadata`), `alembic/script.py.mako`, and one real migration
(`versions/..._create_ideas_table.py`) matching the `Idea` model that ships with the
template. `scripts/new-prototype.sh` renames all of this consistently along with the
Python package itself, so a scaffolded prototype's migrations reference its own
(renamed) package from the start, not `py_service`.
