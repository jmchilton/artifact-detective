import { describe, it, expect } from 'vitest';
import { validateGofmtOutput, ARTIFACT_TYPE_REGISTRY } from '../src/validators/index.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const FIXTURES_DIR = join(import.meta.dirname, '../fixtures/generated/go');

describe('gofmt-txt artifact type', () => {
  const gofmtPath = join(FIXTURES_DIR, 'gofmt-output.txt');

  it('validates gofmt diff output', () => {
    const content = readFileSync(gofmtPath, 'utf-8');
    const result = validateGofmtOutput(content);
    expect(result.valid).toBe(true);
  });

  it('rejects empty content', () => {
    const result = validateGofmtOutput('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects non-diff content', () => {
    const notDiff = 'This is not a diff format';
    const result = validateGofmtOutput(notDiff);
    expect(result.valid).toBe(false);
  });

  it('accepts diff format with --- and +++', () => {
    const validDiff = `--- file.go
+++ file.go
@@ -1,3 +1,3 @@
-old line
+new line`;
    const result = validateGofmtOutput(validDiff);
    expect(result.valid).toBe(true);
  });

  it('accepts diff format with @@ markers', () => {
    const validDiff = `--- file.go
+++ file.go
@@ -10,5 +10,5 @@
 context line
-old
+new`;
    const result = validateGofmtOutput(validDiff);
    expect(result.valid).toBe(true);
  });

  it('has proper registry entry', () => {
    const capabilities = ARTIFACT_TYPE_REGISTRY['gofmt-txt'];
    expect(capabilities).toBeDefined();
    expect(capabilities.supportsAutoDetection).toBe(false);
    expect(capabilities.validator).toBeDefined();
    expect(capabilities.isJSON).toBe(false);
    expect(capabilities.normalize).toBeNull();
  });

  it('real gofmt output has expected diff structure', () => {
    const content = readFileSync(gofmtPath, 'utf-8');
    expect(content).toContain('---');
    expect(content).toContain('+++');
    expect(content).toContain('@@');
    expect(content).toContain('result');
  });
});
