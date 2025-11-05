import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  readInput,
  writeOutput,
  writeError,
  formatJSON,
  formatKeyValue,
} from '../src/cli/utils.js';

describe('CLI Utils', () => {
  describe('readInput', () => {
    let tmpFile: string;

    beforeEach(() => {
      tmpFile = join(tmpdir(), `test-input-${Date.now()}.txt`);
    });

    afterEach(() => {
      try {
        unlinkSync(tmpFile);
      } catch {
        // Ignore if file doesn't exist
      }
    });

    it('reads from file', async () => {
      const content = 'test file content\nwith multiple lines';
      writeFileSync(tmpFile, content, 'utf-8');

      const result = await readInput(tmpFile);
      expect(result).toBe(content);
    });

    it('reads from stdin when path is -', async () => {
      const testData = 'stdin test data';

      // Mock stdin
      const originalStdinRead = process.stdin.read;
      const originalStdinOn = process.stdin.on;

      let readableCallback: (() => void) | null = null;
      let endCallback: (() => void) | null = null;

      process.stdin.read = vi.fn(() => {
        const data = testData;
        // Return null on second read to trigger end
        process.stdin.read = vi.fn(() => null);
        return data;
      });

      process.stdin.on = vi.fn(((event: string, callback: (() => void) | ((err: Error) => void)) => {
        if (event === 'readable') readableCallback = callback as () => void;
        if (event === 'end') endCallback = callback as () => void;
        return process.stdin;
      }) as typeof process.stdin.on);

      process.stdin.setEncoding = vi.fn(() => process.stdin);

      const readPromise = readInput('-');

      // Simulate stdin events
      if (readableCallback) {
        readableCallback();
        readableCallback();
      }
      if (endCallback) {
        endCallback();
      }

      const result = await readPromise;
      expect(result).toBe(testData);

      // Restore
      process.stdin.read = originalStdinRead;
      process.stdin.on = originalStdinOn;
    });

    it('handles empty file', async () => {
      writeFileSync(tmpFile, '', 'utf-8');

      const result = await readInput(tmpFile);
      expect(result).toBe('');
    });

    it('handles file with special characters', async () => {
      const content = 'test with special chars: 🚀 \n\t tab';
      writeFileSync(tmpFile, content, 'utf-8');

      const result = await readInput(tmpFile);
      expect(result).toBe(content);
    });
  });

  describe('writeOutput', () => {
    let tmpFile: string;

    beforeEach(() => {
      tmpFile = join(tmpdir(), `test-output-${Date.now()}.txt`);
    });

    afterEach(() => {
      try {
        unlinkSync(tmpFile);
      } catch {
        // Ignore if file doesn't exist
      }
    });

    it('writes to file', () => {
      const content = 'test output content';

      writeOutput(content, tmpFile);

      const result = readFileSync(tmpFile, 'utf-8');
      expect(result).toBe(content);
    });

    it('writes to stdout with newline', () => {
      let captured = '';
      const originalWrite = process.stdout.write;

      process.stdout.write = ((text: string) => {
        captured += text;
        return true;
      }) as NodeJS.WriteStream['write'];

      writeOutput('test output', null);

      expect(captured).toBe('test output\n');

      process.stdout.write = originalWrite;
    });

    it('writes to stdout with existing newline', () => {
      let captured = '';
      const originalWrite = process.stdout.write;

      process.stdout.write = ((text: string) => {
        captured += text;
        return true;
      }) as NodeJS.WriteStream['write'];

      writeOutput('test output\n', null);

      expect(captured).toBe('test output\n');

      process.stdout.write = originalWrite;
    });
  });

  describe('writeError', () => {
    it('writes to stderr with newline', () => {
      let captured = '';
      const originalWrite = process.stderr.write;

      process.stderr.write = ((text: string) => {
        captured += text;
        return true;
      }) as NodeJS.WriteStream['write'];

      writeError('error message');

      expect(captured).toBe('error message\n');

      process.stderr.write = originalWrite;
    });

    it('does not add extra newline if already present', () => {
      let captured = '';
      const originalWrite = process.stderr.write;

      process.stderr.write = ((text: string) => {
        captured += text;
        return true;
      }) as NodeJS.WriteStream['write'];

      writeError('error message\n');

      expect(captured).toBe('error message\n');

      process.stderr.write = originalWrite;
    });
  });

  describe('formatJSON', () => {
    it('formats object as JSON', () => {
      const obj = { key: 'value', nested: { foo: 'bar' } };
      const result = formatJSON(obj);

      expect(result).toBe(
        `{
  "key": "value",
  "nested": {
    "foo": "bar"
  }
}`
      );
    });

    it('formats array as JSON', () => {
      const arr = [1, 2, 3];
      const result = formatJSON(arr);

      expect(result).toBe(`[
  1,
  2,
  3
]`);
    });

    it('formats primitive values', () => {
      expect(formatJSON('string')).toBe('"string"');
      expect(formatJSON(42)).toBe('42');
      expect(formatJSON(true)).toBe('true');
      expect(formatJSON(null)).toBe('null');
    });

    it('handles complex nested structures', () => {
      const obj = {
        results: [
          { id: 1, name: 'test', valid: true },
          { id: 2, name: 'test2', valid: false },
        ],
      };
      const result = formatJSON(obj);

      expect(result).toContain('"results"');
      expect(result).toContain('"id": 1');
      expect(result).toContain('"valid": true');
    });
  });

  describe('formatKeyValue', () => {
    it('formats simple key-value pairs', () => {
      const obj = { key1: 'value1', key2: 'value2' };
      const result = formatKeyValue(obj);

      expect(result).toContain('key1: value1');
      expect(result).toContain('key2: value2');
      expect(result.split('\n')).toHaveLength(2);
    });

    it('handles numeric values', () => {
      const obj = { count: 42, percentage: 99.5 };
      const result = formatKeyValue(obj);

      expect(result).toContain('count: 42');
      expect(result).toContain('percentage: 99.5');
    });

    it('handles boolean values', () => {
      const obj = { active: true, archived: false };
      const result = formatKeyValue(obj);

      expect(result).toContain('active: true');
      expect(result).toContain('archived: false');
    });

    it('formats nested objects as JSON', () => {
      const obj = { name: 'test', metadata: { version: '1.0', author: 'test' } };
      const result = formatKeyValue(obj);

      expect(result).toContain('name: test');
      expect(result).toContain('metadata: {"version":"1.0","author":"test"}');
    });

    it('preserves order of keys', () => {
      const obj = { first: '1', second: '2', third: '3' };
      const result = formatKeyValue(obj);
      const lines = result.split('\n');

      expect(lines[0]).toContain('first:');
      expect(lines[1]).toContain('second:');
      expect(lines[2]).toContain('third:');
    });

    it('handles empty object', () => {
      const obj = {};
      const result = formatKeyValue(obj);

      expect(result).toBe('');
    });

    it('handles special characters in values', () => {
      const obj = { path: '/path/to/file', emoji: '🚀' };
      const result = formatKeyValue(obj);

      expect(result).toContain('path: /path/to/file');
      expect(result).toContain('emoji: 🚀');
    });
  });
});
