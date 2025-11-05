import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { readFileSync } from 'fs';
import { detectArtifactType } from '../src/detectors/type-detector.js';
import { validate, ARTIFACT_TYPE_REGISTRY } from '../src/validators/index.js';
import { getArtifactDescription } from '../src/docs/artifact-descriptions.js';
import { FIXTURES_DIR } from './fixtures-helper.js';

describe('Isort and Black Artifacts', () => {
  describe('Isort Text Output', () => {
    const isortPath = join(FIXTURES_DIR, 'generated/python/isort-output.txt');

    it('detects isort-txt by content', () => {
      const result = detectArtifactType(isortPath);
      expect(result.detectedType).toBe('isort-txt');
      expect(result.originalFormat).toBe('txt');
      expect(result.isBinary).toBe(false);
    });

    it('validates isort output content', () => {
      const content = readFileSync(isortPath, 'utf-8');
      const result = validate('isort-txt', content);
      expect(result.valid).toBe(true);
      expect(result.description).toBeDefined();
      expect(result.description?.type).toBe('isort-txt');
    });

    it('has isort in error message', () => {
      const content = readFileSync(isortPath, 'utf-8');
      expect(content).toContain('ERROR:');
      expect(content).toContain('Imports are incorrectly sorted');
    });

    it('has unified diff format', () => {
      const content = readFileSync(isortPath, 'utf-8');
      expect(content).toMatch(/^---\s+/m);
      expect(content).toMatch(/^\+\+\+\s+/m);
    });

    it('shows import reordering', () => {
      const content = readFileSync(isortPath, 'utf-8');
      expect(content).toMatch(/^[+-]\s*import\s+/m);
    });

    it('rejects invalid isort output', () => {
      const invalidOutput = 'Some random text without isort markers';
      const result = validate('isort-txt', invalidOutput);
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('rejects output without ERROR marker', () => {
      const noErrorOutput = '--- file.py\n+++ file.py\n-import os';
      const result = validate('isort-txt', noErrorOutput);
      expect(result.valid).toBe(false);
    });

    it('has registry entry without auto-detection', () => {
      const capabilities = ARTIFACT_TYPE_REGISTRY['isort-txt'];
      expect(capabilities).toBeDefined();
      expect(capabilities.supportsAutoDetection).toBe(false);
      expect(capabilities.validator).toBeDefined();
      expect(capabilities.extract).toBeNull();
      expect(capabilities.isJSON).toBe(false);
    });

    it('has comprehensive artifact description', () => {
      const description = getArtifactDescription('isort-txt');
      expect(description).toBeDefined();
      expect(description?.shortDescription).toBeTruthy();
      expect(description?.toolUrl).toBe('https://pycqa.github.io/isort/');
      expect(description?.parsingGuide).toBeTruthy();
      expect(description?.parsingGuide).toContain('unified diff');
    });
  });

  describe('Black Text Output', () => {
    const blackPath = join(FIXTURES_DIR, 'generated/python/black-output.txt');

    it('detects black-txt by content', () => {
      const result = detectArtifactType(blackPath);
      expect(result.detectedType).toBe('black-txt');
      expect(result.originalFormat).toBe('txt');
      expect(result.isBinary).toBe(false);
    });

    it('validates black output content', () => {
      const content = readFileSync(blackPath, 'utf-8');
      const result = validate('black-txt', content);
      expect(result.valid).toBe(true);
      expect(result.description).toBeDefined();
      expect(result.description?.type).toBe('black-txt');
    });

    it('has black completion message', () => {
      const content = readFileSync(blackPath, 'utf-8');
      expect(content).toContain('All done!');
    });

    it('shows unicode characters in output', () => {
      const content = readFileSync(blackPath, 'utf-8');
      // Black uses emojis in "All done! ✨ 🍰 ✨"
      expect(content).toMatch(/✨|🍰/);
    });

    it('shows file status', () => {
      const content = readFileSync(blackPath, 'utf-8');
      // Black shows whether files would be reformatted or left unchanged
      expect(content).toMatch(/would be left unchanged|would reformat/);
    });

    it('rejects invalid black output', () => {
      const invalidOutput = 'Just some random formatter output';
      const result = validate('black-txt', invalidOutput);
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('accepts black completion without changes', () => {
      const completionMessage = 'All done! ✨ 🍰 ✨\n2 files would be left unchanged.';
      const result = validate('black-txt', completionMessage);
      expect(result.valid).toBe(true);
    });

    it('accepts black output with reformat message', () => {
      const reformatMessage = 'would reformat src/file.py\nAll done! ✨ 🍰 ✨';
      const result = validate('black-txt', reformatMessage);
      expect(result.valid).toBe(true);
    });

    it('has registry entry without auto-detection', () => {
      const capabilities = ARTIFACT_TYPE_REGISTRY['black-txt'];
      expect(capabilities).toBeDefined();
      expect(capabilities.supportsAutoDetection).toBe(false);
      expect(capabilities.validator).toBeDefined();
      expect(capabilities.extract).toBeNull();
      expect(capabilities.isJSON).toBe(false);
    });

    it('has comprehensive artifact description', () => {
      const description = getArtifactDescription('black-txt');
      expect(description).toBeDefined();
      expect(description?.shortDescription).toBeTruthy();
      expect(description?.toolUrl).toBe('https://github.com/psf/black');
      expect(description?.parsingGuide).toBeTruthy();
      expect(description?.parsingGuide).toContain('All done');
    });
  });

  describe('Type Detection Integration', () => {
    it('detects isort before black', () => {
      const result = detectArtifactType(join(FIXTURES_DIR, 'generated/python/isort-output.txt'));
      expect(result.detectedType).toBe('isort-txt');
    });

    it('distinguishes black from other formatters', () => {
      const result = detectArtifactType(join(FIXTURES_DIR, 'generated/python/black-output.txt'));
      expect(result.detectedType).toBe('black-txt');
    });
  });
});
