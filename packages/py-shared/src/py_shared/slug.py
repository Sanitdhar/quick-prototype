import re
import unicodedata

_NON_ALNUM = re.compile(r"[^a-z0-9]+")
_EDGE_DASHES = re.compile(r"^-+|-+$")


def slugify(text: str) -> str:
    """Turns free text into a URL-safe slug, e.g. "New Idea!" -> "new-idea"."""
    normalized = unicodedata.normalize("NFKD", text)
    without_accents = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    lowered = without_accents.lower().strip()
    hyphenated = _NON_ALNUM.sub("-", lowered)
    return _EDGE_DASHES.sub("", hyphenated)
