# quick-prototype

Brainstorm product ideas, spin up a working prototype fast, and lift-and-shift the
ones that stick into their own repo — without the prototype ever having been
sloppy code to begin with.

The premise: a prototype you'd be embarrassed to ship is also a prototype that lies
to you about whether the idea works. So this repo treats "quick" and "production-grade
code quality" as compatible, not in tension — every prototype starts from a template
that's fully typed, linted, tested, and migration-ready from its first commit.

## Workflow

```
1. Write the idea down       docs/ideas/<date>-<slug>.md
2. Scaffold a prototype      pnpm run new -- <ts|py> <name>
3. Build against real checks pnpm run verify   (or the individual commands below)
4. Decide                    park it, kill it, or lift-and-shift it out
```

Record any non-obvious _architectural_ choice (not every choice) in
[`docs/decisions/`](docs/decisions/) as you go — see that folder's README.

## Structure

```
config/typescript/    Shared base tsconfig every TS package extends
docs/ideas/            One file per idea — problem, hypothesis, is it worth building
docs/decisions/        Lightweight ADRs for choices worth remembering the "why" of
docs/STACK.md          Why the tooling is shaped the way it is
packages/ts-shared/    Small TS utilities shared across prototypes (Result, slug, ...)
packages/py-shared/    Same, for Python
templates/ts-app/      React + Vite + Vitest starter
templates/py-service/  FastAPI + SQLAlchemy 2.0 + Alembic starter
prototypes/            Where scaffolded prototypes live — see prototypes/README.md
scripts/               new-prototype.sh (scaffolding) and py-check.sh (Python CI gate)
```

`ts-*` / `py-*` prefixes aren't cosmetic: `pnpm-workspace.yaml` and the root
`pyproject.toml` glob on them to decide what's a workspace member, so anything
scaffolded under `prototypes/` is wired into tooling automatically.

## Getting started

```bash
pnpm install                       # TS workspace deps
uv sync --all-packages             # Python workspace deps (see docs/STACK.md re: shared venv)
uv tool install pre-commit --with pre-commit-uv && pre-commit install
```

Scaffold a new prototype:

```bash
pnpm run new -- ts idea-tracker    # -> prototypes/ts-idea-tracker
pnpm run new -- py idea-tracker    # -> prototypes/py-idea-tracker
```

## Code quality

One command runs everything CI runs:

```bash
pnpm run verify
```

Which is: `eslint` + `prettier --check` + `tsc` + `vitest` across every TS package
(`pnpm run lint` / `format:check` / `typecheck` / `test` individually), plus `ruff
check` + `ruff format --check` + `mypy` + `pytest` across every Python package
(`pnpm run check:py`, backed by `scripts/py-check.sh` since `uv` has no built-in
"run this for every workspace member" the way `pnpm -r` does).

`.github/workflows/ci.yml` runs the TS and Python sides as separate jobs on every
push and PR. `pre-commit` (see `.pre-commit-config.yaml`) runs the fast, local subset
(ruff, eslint, prettier) on staged files before each commit.

See [`docs/STACK.md`](docs/STACK.md) for the reasoning behind these choices,
including the one genuinely sharp edge in this setup (Python workspace members share
a single virtual environment) and how the tooling here works around it.

## Lift-and-shift

Once a prototype earns its keep, it graduates out of this repo into its own —
see [`prototypes/README.md`](prototypes/README.md) for the steps (mainly: inline the
couple of workspace-relative config paths it depends on, then move the rest as-is).
