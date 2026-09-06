import { describe, expect, it } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('New Idea!')).toBe('new-idea');
  });

  it('strips accents', () => {
    expect(slugify('Café Idée')).toBe('cafe-idee');
  });

  it('trims leading/trailing separators', () => {
    expect(slugify('  --Loose Ends--  ')).toBe('loose-ends');
  });
});
