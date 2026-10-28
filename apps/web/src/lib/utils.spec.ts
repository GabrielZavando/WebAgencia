import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (shadcn/ui class merger)', () => {
  it('merges class names and drops falsy values', () => {
    expect(cn('a', false && 'b', undefined, 'c')).toBe('a c');
  });

  it('resolves tailwind conflicts keeping the last class', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('keeps independent utilities from both inputs', () => {
    expect(cn('px-2 py-1', 'text-sm')).toBe('px-2 py-1 text-sm');
  });
});
