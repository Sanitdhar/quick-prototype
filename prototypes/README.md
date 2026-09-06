# Prototypes

Every prototype lives here as `ts-<name>` or `py-<name>`, scaffolded with:

```
pnpm run new -- ts <name>   # React + Vite, from templates/ts-app
pnpm run new -- py <name>   # FastAPI + SQLAlchemy, from templates/py-service
```

The prefix isn't cosmetic — `pnpm-workspace.yaml` and the root `pyproject.toml` glob
on `ts-*`/`py-*` to decide what's a workspace member, so a prototype is wired into
the repo's lint/typecheck/test/build tooling the moment it's created.

There's a third, deliberately un-globbed prefix: **`html-<name>`**, for a prototype that is
just files you open in a browser — no package, no install, no build tooling. It has no
workspace membership precisely because there is nothing to install or typecheck, and it's
excluded from the repo's lint and format gates for the same reason. Use it when the fastest
honest answer to "what are we building" is a page rather than an app
(see [`html-occasio-web`](./html-occasio-web/)).

## Lift-and-shift

When a prototype is worth turning into its own product, take the whole `ts-<name>`
or `py-<name>` folder out as a standalone repo:

1. `git subtree split` (or a plain copy, if history doesn't matter) the prototype's
   folder into its own repository.
2. Drop the workspace-relative bits it no longer needs:
   - TS: replace `"extends": "../../config/typescript/tsconfig.base.json"` in
     `tsconfig*.json` with the inlined contents of that base config, and drop any
     `@quick-prototype/ts-shared` dependency in favor of a copy or a real published
     package.
   - Python: same idea for `packages/py-shared` — inline what you used, or publish it.
3. Bring its own `eslint.config.js` / `ruff.toml` + `pyproject.toml` `[tool.mypy]` —
   copy the root ones as a starting point (see [docs/STACK.md](../docs/STACK.md) for
   why they're shaped the way they are) and drop the workspace-specific bits (the
   `known-first-party` list, the `alembic/env.py` per-file ignore).
4. Everything else — the app code, tests, Alembic migrations, CI checks — moves over
   unchanged, because it was never workspace-coupled to begin with.

A prototype that doesn't graduate is just deleted — nothing else in the repo depends
on it.
