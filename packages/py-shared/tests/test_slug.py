from py_shared import slugify


def test_lowercases_and_hyphenates() -> None:
    assert slugify("New Idea!") == "new-idea"


def test_strips_accents() -> None:
    assert slugify("Café Idée") == "cafe-idee"


def test_trims_leading_trailing_separators() -> None:
    assert slugify("  --Loose Ends--  ") == "loose-ends"
