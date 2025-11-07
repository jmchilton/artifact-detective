import { describe, it, expect } from 'vitest';
import {
  loadArtifactDescriptions,
  getArtifactDescription,
} from '../src/docs/artifact-descriptions.js';
import { ARTIFACT_TYPE_REGISTRY } from '../src/validators/index.js';
import type { ArtifactType } from '../src/types.js';

describe('Artifact Descriptions', () => {
  describe('YAML coverage', () => {
    it('loads all artifact descriptions from YAML', () => {
      const descriptions = loadArtifactDescriptions();
      expect(descriptions).toBeTruthy();
      expect(Object.keys(descriptions).length).toBeGreaterThan(0);
    });

    it('all registered artifact types have descriptions (prevents extraction null bugs)', () => {
      const descriptions = loadArtifactDescriptions();
      const registryKeys = Object.keys(ARTIFACT_TYPE_REGISTRY) as ArtifactType[];

      const missingDescriptions = registryKeys.filter((type) => !descriptions[type]);

      if (missingDescriptions.length > 0) {
        throw new Error(
          `${missingDescriptions.length} artifact type(s) registered in ARTIFACT_TYPE_REGISTRY but missing descriptions in artifact-descriptions.yml: ${missingDescriptions.join(', ')}. ` +
            'This causes extract() to return null even when extraction logic works correctly. ' +
            'Add entries to src/docs/artifact-descriptions.yml for these types.',
        );
      }

      expect(missingDescriptions).toHaveLength(0);
    });

    it('has entries for all expected artifact types', () => {
      const descriptions = loadArtifactDescriptions();

      // All artifact types that should have descriptions
      const expectedTypes: ArtifactType[] = [
        'jest-json',
        'playwright-json',
        'jest-html',
        'pytest-json',
        'pytest-html',
        'junit-xml',
        'checkstyle-xml',
        'checkstyle-sarif-json',
        'spotbugs-xml',
        'surefire-html',
        'eslint-json',
        'mypy-ndjson',
        'mypy-json',
        'eslint-txt',
        'tsc-txt',
        'flake8-txt',
        'ruff-txt',
        'mypy-txt',
        'cargo-test-txt',
        'clippy-ndjson',
        'clippy-json',
        'clippy-txt',
        'rustfmt-txt',
        'gofmt-txt',
        'go-test-ndjson',
        'go-test-json',
        'golangci-lint-json',
        'binary',
        'unknown',
      ];

      for (const type of expectedTypes) {
        expect(descriptions[type]).toBeDefined();
        expect(descriptions[type]).toHaveProperty('type', type);
      }
    });

    it('descriptions are well-formed', () => {
      const descriptions = loadArtifactDescriptions();

      for (const [type, desc] of Object.entries(descriptions)) {
        expect(desc.type).toBe(type);
        expect(desc.shortDescription).toBeTruthy();
        expect(typeof desc.shortDescription).toBe('string');
        expect(desc.shortDescription.length).toBeGreaterThan(0);
        expect(desc.shortDescription.length).toBeLessThan(200);

        expect(desc.parsingGuide).toBeTruthy();
        expect(typeof desc.parsingGuide).toBe('string');
        // Should have at least a few paragraphs
        expect(desc.parsingGuide.split('\n').filter((l) => l.trim()).length).toBeGreaterThanOrEqual(
          3,
        );

        // fileExtension should be present and valid
        expect(desc.fileExtension).toBeDefined();
        expect(typeof desc.fileExtension).toBe('string');
        expect(['json', 'xml', 'html', 'txt', 'ndjson', 'other']).toContain(desc.fileExtension);

        // Optional fields should be strings if present
        if (desc.toolUrl) {
          expect(typeof desc.toolUrl).toBe('string');
          expect(desc.toolUrl).toMatch(/^https?:\/\//);
        }
        if (desc.formatUrl) {
          expect(typeof desc.formatUrl).toBe('string');
          // formatUrl might be empty string for some types
          if (desc.formatUrl.length > 0) {
            expect(desc.formatUrl).toMatch(/^https?:\/\//);
          }
        }
      }
    });
  });

  describe('description loading', () => {
    it('loads descriptions synchronously', () => {
      const desc = getArtifactDescription('jest-json');
      expect(desc).toBeDefined();
      expect(desc?.type).toBe('jest-json');
      expect(desc?.shortDescription).toContain('Jest');
    });

    it('returns null for unknown type', () => {
      const desc = getArtifactDescription('unknown-type' as ArtifactType);
      expect(desc).toBeNull();
    });

    it('caches descriptions after first load', () => {
      const desc1 = getArtifactDescription('jest-json');
      const desc2 = getArtifactDescription('jest-json');
      expect(desc1).toBe(desc2); // Same object reference due to caching
    });

    it('returns description for all real artifact types', () => {
      const realTypes: ArtifactType[] = [
        'jest-json',
        'playwright-json',
        'pytest-json',
        'eslint-json',
        'checkstyle-sarif-json',
      ];

      for (const type of realTypes) {
        const desc = getArtifactDescription(type);
        expect(desc).toBeDefined();
        expect(desc?.type).toBe(type);
        expect(desc?.shortDescription.length).toBeGreaterThan(0);
      }
    });

    it('returns description for artificial types', () => {
      const artificialTypes: ArtifactType[] = ['mypy-json', 'go-test-json', 'clippy-json'];

      for (const type of artificialTypes) {
        const desc = getArtifactDescription(type);
        expect(desc).toBeDefined();
        expect(desc?.type).toBe(type);
        expect(desc?.shortDescription).toContain('artificial');
      }
    });

    it('returns description for meta types', () => {
      const metaTypes: ArtifactType[] = ['binary', 'unknown'];

      for (const type of metaTypes) {
        const desc = getArtifactDescription(type);
        expect(desc).toBeDefined();
        expect(desc?.type).toBe(type);
      }
    });
  });
});
