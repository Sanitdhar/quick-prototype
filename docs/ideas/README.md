# Ideas

One file per idea, named `YYYY-MM-DD-slug.md` (e.g. `2026-09-06-idea-tracker.md`), using
[`_template.md`](./_template.md).

The point of writing an idea down before touching code is to force the two or three
sentences that decide whether it's worth a prototype at all — a full doc is overkill,
but "what problem, for whom, why now" shouldn't live only in your head.

Once an idea is worth trying, spin it up with `pnpm run new -- <ts|py> <name>` (see
the root [README](../../README.md)) and link the prototype's path back into the idea
doc.
