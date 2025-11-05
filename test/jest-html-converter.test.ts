import { describe, it, expect } from 'vitest';
import { extractJestJSON } from '../src/parsers/html/jest-html.js';
import { convertToJSON } from '../src/validators/index.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const FIXTURES_DIR = join(import.meta.dirname, '../fixtures/generated/javascript');

describe('Jest HTML converter', () => {
  const jestHtmlPath = join(FIXTURES_DIR, 'jest-report.html');
  const jestJsonPath = join(FIXTURES_DIR, 'jest-results.json');

  it('parses jest-html file and returns JSON report', () => {
    const report = extractJestJSON(jestHtmlPath);

    expect(report).toBeTruthy();
    expect(report?.numTotalTests).toBe(8);
    expect(report?.numPassedTests).toBe(5);
    expect(report?.numFailedTests).toBe(2);
    expect(report?.numPendingTests).toBe(1);
  });

  it('returns assertion results for each test', () => {
    const report = extractJestJSON(jestHtmlPath);

    expect(report?.testResults).toHaveLength(1);
    const testResult = report!.testResults[0];
    expect(testResult.assertionResults).toHaveLength(8);
  });

  it('correctly identifies passed tests', () => {
    const report = extractJestJSON(jestHtmlPath);
    const passedTests = report!.testResults[0].assertionResults.filter(
      (t) => t.status === 'passed',
    );

    expect(passedTests).toHaveLength(5);
    expect(passedTests[0].title).toBe('passes basic assertion');
  });

  it('correctly identifies failed tests', () => {
    const report = extractJestJSON(jestHtmlPath);
    const failedTests = report!.testResults[0].assertionResults.filter(
      (t) => t.status === 'failed',
    );

    expect(failedTests).toHaveLength(2);
    expect(failedTests[0].title).toBe('fails deliberately');
    expect(failedTests[1].title).toBe('fails with async error');
  });

  it('correctly identifies pending tests', () => {
    const report = extractJestJSON(jestHtmlPath);
    const pendingTests = report!.testResults[0].assertionResults.filter(
      (t) => t.status === 'pending',
    );

    expect(pendingTests).toHaveLength(1);
    expect(pendingTests[0].title).toBe('skipped test');
  });

  it('extracts test durations', () => {
    const report = extractJestJSON(jestHtmlPath);
    const assertions = report!.testResults[0].assertionResults;

    // Durations should be in milliseconds
    expect(assertions[0].duration).toBeGreaterThanOrEqual(0);
    expect(typeof assertions[0].duration).toBe('number');
  });

  it('includes suite name in ancestorTitles', () => {
    const report = extractJestJSON(jestHtmlPath);
    const assertions = report!.testResults[0].assertionResults;

    assertions.forEach((assertion) => {
      expect(assertion.ancestorTitles).toContain('Sample tests');
    });
  });

  it('marks suite as failed when tests fail', () => {
    const report = extractJestJSON(jestHtmlPath);

    expect(report?.success).toBe(false);
    expect(report?.testResults[0].status).toBe('failed');
  });

  it('includes timestamps in report', () => {
    const report = extractJestJSON(jestHtmlPath);

    expect(report?.startTime).toBeGreaterThan(0);
    expect(report?.testResults[0].startTime).toBeGreaterThan(0);
  });

  it('converts via convertToJSON utility', () => {
    const conversionResult = convertToJSON({ detectedType: 'jest-html' }, jestHtmlPath);

    expect(conversionResult).toBeTruthy();
    expect(conversionResult?.description).toBeTruthy();
    expect(() => JSON.parse(conversionResult!.json)).not.toThrow();

    const report = JSON.parse(conversionResult!.json);
    expect(report.numTotalTests).toBe(8);
    expect(report.success).toBe(false);
  });

  it('produces format compatible with jest-json validator', () => {
    const htmlReport = extractJestJSON(jestHtmlPath);
    const jsonContent = readFileSync(jestJsonPath, 'utf-8');
    const jsonReport = JSON.parse(jsonContent);

    // Both should have these key fields
    expect(htmlReport).toHaveProperty('numFailedTestSuites');
    expect(htmlReport).toHaveProperty('numPassedTestSuites');
    expect(htmlReport).toHaveProperty('numFailedTests');
    expect(htmlReport).toHaveProperty('numPassedTests');
    expect(htmlReport).toHaveProperty('testResults');

    // Test count should match
    expect(htmlReport?.numTotalTests).toBe(jsonReport.numTotalTests);
    expect(htmlReport?.numPassedTests).toBe(jsonReport.numPassedTests);
    expect(htmlReport?.numFailedTests).toBe(jsonReport.numFailedTests);
  });

  it('handles HTML entity decoding properly', () => {
    const report = extractJestJSON(jestHtmlPath);
    const assertions = report!.testResults[0].assertionResults;

    // Test titles should be readable (not HTML entities)
    assertions.forEach((assertion) => {
      expect(assertion.title).not.toMatch(/&\w+;/);
    });
  });
});
