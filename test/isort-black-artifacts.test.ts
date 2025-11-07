import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { testArtifactType } from './helpers/artifact-test-helpers.js';
import { fixtures } from './helpers/fixture-paths.js';
import { detectArtifactType } from '../src/detectors/type-detector.js';
import { getArtifactDescription } from '../src/docs/artifact-descriptions.js';
import { validate } from '../src/validators/index.js';

describe('Isort and Black Artifacts', () => {
  const isortPath = fixtures.python.isortTxt();
  const blackPath = fixtures.python.blackTxt();

  testArtifactType({
    artifactType: 'isort-txt',
    fixturePath: isortPath,
    expectedFormat: 'txt',
    supportsAutoDetection: false,
    invalidSamples: [
      'Some random text without isort markers',
      '--- file.py\n+++ file.py\n-import os',
    ],
  });

  describe('Isort Text Output specific tests', () => {

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

    it('has comprehensive artifact description', () => {
      const description = getArtifactDescription('isort-txt');
      expect(description).toBeDefined();
      expect(description?.shortDescription).toBeTruthy();
      expect(description?.toolUrl).toBe('https://pycqa.github.io/isort/');
      expect(description?.parsingGuide).toBeTruthy();
      expect(description?.parsingGuide).toContain('unified diff');
    });
  });

  testArtifactType({
    artifactType: 'black-txt',
    fixturePath: blackPath,
    expectedFormat: 'txt',
    supportsAutoDetection: false,
    invalidSamples: [
      'Just some random formatter output',
    ],
  });

  describe('Black Text Output specific tests', () => {

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
      const result = detectArtifactType(fixtures.python.isortTxt());
      expect(result.detectedType).toBe('isort-txt');
    });

    it('distinguishes black from other formatters', () => {
      const result = detectArtifactType(fixtures.python.blackTxt());
      expect(result.detectedType).toBe('black-txt');
    });
  });
});
