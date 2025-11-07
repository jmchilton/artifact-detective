import { unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Pattern 3: Temporary file management helpers
 * Eliminates boilerplate try/catch cleanup code
 */

/**
 * Hook-based temporary file management for use with beforeEach/afterEach
 */
export function useTempFile(prefix: string = 'test') {
  let tmpFile: string | null = null;

  return {
    beforeEach: () => {
      tmpFile = join(tmpdir(), `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.tmp`);
    },

    afterEach: () => {
      if (tmpFile) {
        try {
          unlinkSync(tmpFile);
        } catch {
          // Ignore cleanup errors (file may not exist)
        }
      }
    },

    get path(): string {
      if (!tmpFile) throw new Error('Call beforeEach first');
      return tmpFile;
    },
  };
}

/**
 * Functional temporary file management for inline use
 * Automatically cleans up after operation
 */
export async function withTempFile<T>(
  operation: (path: string) => T | Promise<T>,
  prefix: string = 'test',
): Promise<T> {
  const tmpFile = join(tmpdir(), `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.tmp`);
  try {
    return await operation(tmpFile);
  } finally {
    try {
      unlinkSync(tmpFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Synchronous version of withTempFile
 */
export function withTempFileSync<T>(
  operation: (path: string) => T,
  prefix: string = 'test',
): T {
  const tmpFile = join(tmpdir(), `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.tmp`);
  try {
    return operation(tmpFile);
  } finally {
    try {
      unlinkSync(tmpFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}
