import { describe, it, expect } from 'vitest';
import { validateGofmtOutput } from '../src/validators/index.js';
import { readFileSync } from 'fs';
import { testArtifactType } from './helpers/artifact-test-helpers.js';
import { fixtures } from './helpers/fixture-paths.js';

describe('gofmt-txt artifact type', () => {
  const gofmtPath = fixtures.go.gofmtTxt();

  testArtifactType({
    artifactType: 'gofmt-txt',
    fixturePath: gofmtPath,
    expectedFormat: 'txt',
    supportsAutoDetection: false,
    invalidSamples: [
      '',
      'This is not a diff format',
    ],
  });

  describe('gofmt-txt specific validation', () => {
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

    it('real gofmt output has expected diff structure', () => {
      const content = readFileSync(gofmtPath, 'utf-8');
      expect(content).toContain('---');
      expect(content).toContain('+++');
      expect(content).toContain('@@');
      expect(content).toContain('result');
    });
  });
});
