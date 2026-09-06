import { describe, expect, it } from 'vitest';
import { err, ok, tryCatch } from './result';

describe('Result', () => {
  it('ok() wraps a value', () => {
    expect(ok(42)).toEqual({ ok: true, value: 42 });
  });

  it('err() wraps an error', () => {
    expect(err('boom')).toEqual({ ok: false, error: 'boom' });
  });

  it('tryCatch() returns ok on success', () => {
    expect(tryCatch(() => 1 + 1)).toEqual({ ok: true, value: 2 });
  });

  it('tryCatch() returns err on throw', () => {
    const result = tryCatch(() => {
      throw new Error('nope');
    });
    expect(result.ok).toBe(false);
  });
});
