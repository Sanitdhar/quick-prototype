#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/new-prototype.sh <ts|py> <name>

Scaffolds a new prototype under prototypes/ from the matching template:
  ts <name>   copies templates/ts-app     -> prototypes/ts-<name>
  py <name>   copies templates/py-service -> prototypes/py-<name>

<name> must be lowercase kebab-case, e.g. "idea-tracker".

Also runnable as: pnpm run new -- <ts|py> <name>
EOF
}

if [[ $# -ne 2 ]]; then
  usage >&2
  exit 1
fi

kind="$1"
name="$2"

if [[ ! "$name" =~ ^[a-z][a-z0-9]*(-[a-z0-9]+)*$ ]]; then
  echo "error: name must be lowercase kebab-case (e.g. 'idea-tracker'), got '$name'" >&2
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

case "$kind" in
  ts)
    template="templates/ts-app"
    target="prototypes/ts-$name"
    ;;
  py)
    template="templates/py-service"
    target="prototypes/py-$name"
    ;;
  *)
    usage >&2
    exit 1
    ;;
esac

if [[ -e "$target" ]]; then
  echo "error: $target already exists" >&2
  exit 1
fi

mkdir -p prototypes
cp -R "$template" "$target"

# Drop anything the template accumulated locally — the prototype starts clean.
find "$target" -depth -type d \( \
    -name node_modules -o -name dist -o -name build -o -name .venv \
    -o -name __pycache__ -o -name .pytest_cache -o -name .mypy_cache \
    -o -name .ruff_cache -o -name coverage \
  \) -exec rm -rf {} +
find "$target" -type f \( -name '*.tsbuildinfo' -o -name '*.sqlite3' \) -delete

if [[ "$kind" == ts ]]; then
  package_name="ts-$name"
  sed -i "s/\"name\": \"ts-app-template\"/\"name\": \"$package_name\"/" "$target/package.json"
else
  package_name="py-$name"
  module_name="py_${name//-/_}"
  sed -i "s/name = \"py-service-template\"/name = \"$package_name\"/" "$target/pyproject.toml"
  sed -i "1s/.*/# $package_name/" "$target/README.md"
  if [[ "$module_name" != "py_service" ]]; then
    mv "$target/src/py_service" "$target/src/$module_name"
    grep -rlZ "py_service" "$target" | xargs -0 -r sed -i "s/py_service/$module_name/g"
  fi
fi

echo "Created $target"
echo
if [[ "$kind" == ts ]]; then
  echo "Next: cd $target && pnpm install && pnpm run dev"
else
  echo "Next: cd $target && uv sync && uv run uvicorn ${module_name}.main:app --reload"
fi
