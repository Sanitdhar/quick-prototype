#!/usr/bin/env bash
# Runs ruff, mypy, and pytest for every Python package in the repo (packages/py-*,
# templates/py-*, prototypes/py-*). There's no `uv`-native equivalent of `pnpm -r`
# for running a command across every workspace member, so this fills that gap —
# used by `pnpm run check:py` and CI.
#
# All workspace members share ONE virtual environment at the repo root, so we sync
# it once with --all-packages up front, then use `uv run --no-sync` per package —
# `uv run` alone would re-sync scoped to just that one package's deps on each call,
# uninstalling every other package's dependencies from the shared venv in the process.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

uv sync --all-packages --quiet

status=0
while IFS= read -r -d '' pyproject; do
  dir="$(dirname "$pyproject")"
  [[ "$dir" == "." ]] && continue

  echo "== $dir =="
  (
    cd "$dir"
    uv run --no-sync ruff check .
    uv run --no-sync ruff format --check .
    uv run --no-sync mypy src
    uv run --no-sync pytest -q
  ) || status=1
done < <(find . -name pyproject.toml -not -path '*/.venv/*' -print0)

exit "$status"
