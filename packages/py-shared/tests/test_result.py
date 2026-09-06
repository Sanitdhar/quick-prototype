from py_shared import Err, Ok, try_catch


def test_ok_wraps_a_value() -> None:
    assert Ok(42) == Ok(42)


def test_err_wraps_an_error() -> None:
    result = Err(ValueError("boom"))
    assert result.ok is False


def test_try_catch_returns_ok_on_success() -> None:
    result = try_catch(lambda: 1 + 1)
    assert isinstance(result, Ok)
    assert result.value == 2


def test_try_catch_returns_err_on_raise() -> None:
    def boom() -> int:
        raise ValueError("nope")

    result = try_catch(boom)
    assert isinstance(result, Err)
