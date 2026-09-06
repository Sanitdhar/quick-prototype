from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Ok[T]:
    value: T
    ok: bool = True


@dataclass(frozen=True, slots=True)
class Err[E]:
    error: E
    ok: bool = False


type Result[T, E] = Ok[T] | Err[E]


def try_catch[T](fn: Callable[[], T]) -> Result[T, Exception]:
    """Calls `fn`, turning a raised exception into an `Err` instead of propagating it."""
    try:
        return Ok(fn())
    except Exception as exc:  # intentionally broad, mirrors ts-shared's tryCatch
        return Err(exc)
