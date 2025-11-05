import { describe, it, expect } from 'vitest';
import { detectArtifactType } from '../src/index.js';
import {
  validateSurefireHTML,
  ARTIFACT_TYPE_REGISTRY,
  canConvertToJSON,
} from '../src/validators/index.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const FIXTURES_DIR = join(import.meta.dirname, '../fixtures/generated/java');

describe('Surefire HTML artifact type', () => {
  const surefireHtmlPath = join(FIXTURES_DIR, 'surefire-report.html');

  it('detects surefire-html by content', () => {
    const result = detectArtifactType(surefireHtmlPath);
    expect(result.detectedType).toBe('surefire-html');
    expect(result.originalFormat).toBe('html');
    expect(result.isBinary).toBe(false);
  });

  it('validates surefire HTML content', () => {
    const content = readFileSync(surefireHtmlPath, 'utf-8');
    const result = validateSurefireHTML(content);

    expect(result.valid).toBe(true);
  });

  it('rejects HTML without surefire markers', () => {
    const invalidHtml = '<html><body><h1>Some Report</h1></body></html>';
    const result = validateSurefireHTML(invalidHtml);

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects non-HTML content', () => {
    const notHtml = '{"not": "html"}';
    const result = validateSurefireHTML(notHtml);

    expect(result.valid).toBe(false);
  });

  it('rejects HTML without test content', () => {
    const htmlNoTests = '<html><body><h1>Surefire Report</h1></body></html>';
    const result = validateSurefireHTML(htmlNoTests);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('test');
  });

  it('has proper registry entry', () => {
    const capabilities = ARTIFACT_TYPE_REGISTRY['surefire-html'];

    expect(capabilities).toBeDefined();
    expect(capabilities.supportsAutoDetection).toBe(true);
    expect(capabilities.validator).toBeDefined();
    expect(capabilities.isJSON).toBe(false);
    expect(capabilities.normalize).toBeNull();
  });

  it('real surefire HTML has expected structure', () => {
    const content = readFileSync(surefireHtmlPath, 'utf-8');

    // Check for surefire report structure
    expect(content.toLowerCase()).toMatch(/surefire/);
    expect(content.toLowerCase()).toMatch(/test/);
    expect(content).toMatch(/<html/i);
    expect(content).toMatch(/<body/i);
  });

  it('surefire HTML is not JSON format', () => {
    const capabilities = ARTIFACT_TYPE_REGISTRY['surefire-html'];
    expect(capabilities.isJSON).toBe(false);
  });

  it('surefire HTML cannot be converted to JSON', () => {
    const result = canConvertToJSON({ detectedType: 'surefire-html' });

    expect(result).toBe(false);
  });
});
