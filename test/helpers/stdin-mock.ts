import { vi } from 'vitest';

/**
 * Pattern 2: Stdin mocking helper
 * Eliminates 30+ lines of stdin mock setup/teardown boilerplate
 */
export function mockStdin(data: string) {
  const originalRead = process.stdin.read;
  const originalOn = process.stdin.on;

  let readableCallback: (() => void) | null = null;
  let endCallback: (() => void) | null = null;

  process.stdin.read = vi.fn(() => {
    const result = data;
    // After first read, return null to signal EOF
    process.stdin.read = vi.fn(() => null);
    return result;
  });

  process.stdin.on = vi.fn(((event: string, callback: (() => void) | ((err: Error) => void)) => {
    if (event === 'readable') readableCallback = callback as () => void;
    if (event === 'end') endCallback = callback as () => void;
    return process.stdin;
  }) as typeof process.stdin.on);

  process.stdin.setEncoding = vi.fn(() => process.stdin);

  return {
    /**
     * Trigger the readable and end callbacks to simulate stdin data flow
     */
    trigger: () => {
      readableCallback?.();
      readableCallback?.();
      endCallback?.();
    },

    /**
     * Restore original stdin behavior
     */
    restore: () => {
      process.stdin.read = originalRead;
      process.stdin.on = originalOn;
    },
  };
}
