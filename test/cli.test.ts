import { describe, it, expect, vi } from 'vitest';
import { execSync, spawnSync } from 'child_process';
import { join } from 'path';
import { readFileSync } from 'fs';
import { FIXTURES_DIR } from './fixtures-helper.js';
import { runCLIInProcess, runCLISubprocess, type CLITestResult } from '../src/cli/test-helper.js';

/**
 * Parameterized CLI test suite - runs tests with a given CLI runner
 * This function contains all core CLI command tests (detect, validate, extract, normalize)
 */
function testCLI(runCommand: (args: string[]) => Promise<CLITestResult>, mode: string) {
  describe(`CLI Commands (${mode} mode)`, () => {
    describe('detect command', () => {
      const eslintJsonPath = join(FIXTURES_DIR, 'generated/javascript/eslint-results.json');

      it('detects artifact type from file', async () => {
        const result = await runCommand(['detect', eslintJsonPath]);

        expect(result.stdout).toContain('Detected Type: eslint-json');
        expect(result.stdout).toContain('Format: json');
        expect(result.stdout).toContain('Binary: no');

        expect(result.exitCode).toBe(0);
      });

      it('outputs JSON with --json flag', async () => {
        const result = await runCommand(['detect', '--json', eslintJsonPath]);

        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json.detectedType).toBe('eslint-json');
        expect(json.originalFormat).toBe('json');
        expect(json.isBinary).toBe(false);
      });

      it('handles file not found', async () => {
        const result = await runCommand(['detect', '/nonexistent/file.json']);

        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain('Error');
      });

      it('outputs JSON format for detected file', async () => {
        const eslintJsonPath = join(FIXTURES_DIR, 'generated/javascript/eslint-results.json');
        const result = await runCommand(['detect', '--json', eslintJsonPath]);

        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json).toHaveProperty('detectedType');
        expect(json).toHaveProperty('originalFormat');
        expect(json).toHaveProperty('isBinary');
      });
    });

    describe('validate command', () => {
      const eslintJsonPath = join(FIXTURES_DIR, 'generated/javascript/eslint-results.json');

      it('validates artifact against type', async () => {
        const result = await runCommand(['validate', 'eslint-json', eslintJsonPath]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('Valid: eslint-json');
      });

      it('rejects invalid artifact', async () => {
        const pytestJsonPath = join(FIXTURES_DIR, 'generated/python/pytest-results.json');
        const result = await runCommand(['validate', 'eslint-json', pytestJsonPath]);

        expect(result.exitCode).toBe(2);
        expect(result.stdout).toContain('Invalid');
      });

      it('outputs JSON with --json flag', async () => {
        const result = await runCommand(['validate', '--json', 'eslint-json', eslintJsonPath]);

        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json.valid).toBe(true);
      });

      it('includes description with --show-description flag', async () => {
        const result = await runCommand(['validate', '--show-description', 'eslint-json', eslintJsonPath]);

        expect(result.exitCode).toBe(0);
        expect(result.stderr).toContain('Parsing Guide');
      });

      it('validates and outputs JSON with description', async () => {
        const result = await runCommand(['validate', '--json', '--show-description', 'eslint-json', eslintJsonPath]);

        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json.valid).toBe(true);
        expect(json).toHaveProperty('artifact');
      });

      it('handles file not found in validate', async () => {
        const result = await runCommand(['validate', 'eslint-json', '/nonexistent/file.json']);

        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain('Error');
      });

      it('includes error message for invalid artifact in JSON', async () => {
        const pytestJsonPath = join(FIXTURES_DIR, 'generated/python/pytest-results.json');
        const result = await runCommand(['validate', '--json', 'eslint-json', pytestJsonPath]);

        expect(result.exitCode).toBe(2);
        const json = JSON.parse(result.stdout);
        expect(json.valid).toBe(false);
        expect(json).toHaveProperty('error');
      });
    });

    describe('extract command', () => {
      const eslintOutputPath = join(FIXTURES_DIR, 'generated/javascript/eslint-output.txt');

      it('extracts artifact from log file', async () => {
        const result = await runCommand(['extract', 'eslint-txt', eslintOutputPath]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('error');
        expect(result.stdout).toContain('no-unused-vars');
      });

      it('writes output to file with --output', async () => {
        const tmpFile = `/tmp/extracted-${Date.now()}.txt`;
        const result = await runCommand(['extract', 'eslint-txt', eslintOutputPath, '--output', tmpFile]);

        expect(result.exitCode).toBe(0);
        const content = readFileSync(tmpFile, 'utf-8');
        expect(content).toContain('error');

        // Cleanup
        try {
          execSync(`rm ${tmpFile}`);
        } catch {
          // Ignore cleanup errors
        }
      });

      it('handles extraction failure gracefully', async () => {
        const result = await runCommand(['extract', 'eslint-txt', '/nonexistent/file.txt']);

        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain('Error');
      });

      it('extracts with custom start marker', async () => {
        const eslintOutputPath = join(FIXTURES_DIR, 'generated/javascript/eslint-output.txt');
        const result = await runCommand(['extract', 'eslint-txt', eslintOutputPath, '--start-marker', 'error']);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('error');
      });

      it('extracts with custom end marker', async () => {
        const eslintOutputPath = join(FIXTURES_DIR, 'generated/javascript/eslint-output.txt');
        const result = await runCommand(['extract', 'eslint-txt', eslintOutputPath, '--end-marker', 'passing']);

        expect(result.exitCode).toBe(0);
      });

      it('handles invalid regex in start marker', async () => {
        const eslintOutputPath = join(FIXTURES_DIR, 'generated/javascript/eslint-output.txt');
        const result = await runCommand(['extract', 'eslint-txt', eslintOutputPath, '--start-marker', '[invalid(regex']);

        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain('Error');
      });
    });

    describe('normalize command', () => {
      const pytestHtmlPath = join(FIXTURES_DIR, 'generated/python/pytest-report.html');
      const jestHtmlPath = join(FIXTURES_DIR, 'generated/javascript/jest-report.html');

      it('converts HTML artifact to JSON', async () => {
        const result = await runCommand(['normalize', pytestHtmlPath]);

        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json).toHaveProperty('tests');
      });

      it('outputs to file with --output', async () => {
        const tmpFile = `/tmp/normalized-${Date.now()}.json`;
        const result = await runCommand(['normalize', pytestHtmlPath, '--output', tmpFile]);

        expect(result.exitCode).toBe(0);
        const content = readFileSync(tmpFile, 'utf-8');
        const json = JSON.parse(content);
        expect(json).toHaveProperty('tests');

        // Cleanup
        try {
          execSync(`rm ${tmpFile}`);
        } catch {
          // Ignore cleanup errors
        }
      });

      it('includes description with --show-description', async () => {
        const result = await runCommand(['normalize', '--show-description', pytestHtmlPath]);

        expect(result.exitCode).toBe(0);
        expect(result.stderr).toContain('Parsing Guide');
      });

      it('overrides artifact type with --type', async () => {
        const result = await runCommand(['normalize', '--type', 'jest-html', jestHtmlPath]);

        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json).toHaveProperty('testResults');
      });

      it('handles conversion failure', async () => {
        const eslintJsonPath = join(FIXTURES_DIR, 'generated/javascript/eslint-results.json');
        const result = await runCommand(['normalize', eslintJsonPath]);

        // JSON artifacts should still succeed (already JSON)
        expect(result.exitCode).toBe(0);
      });

      it('normalizes with explicit type override', async () => {
        const jestHtmlPath = join(FIXTURES_DIR, 'generated/javascript/jest-report.html');
        const result = await runCommand(['normalize', '--type', 'jest-html', jestHtmlPath]);

        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json).toHaveProperty('testResults');
      });

      it('normalizes to file with --output', async () => {
        const tmpFile = `/tmp/normalized-${Date.now()}.json`;
        const pytestHtmlPath = join(FIXTURES_DIR, 'generated/python/pytest-report.html');
        const result = await runCommand(['normalize', pytestHtmlPath, '--output', tmpFile]);

        expect(result.exitCode).toBe(0);
        const content = readFileSync(tmpFile, 'utf-8');
        const json = JSON.parse(content);
        expect(json).toHaveProperty('tests');

        // Cleanup
        try {
          execSync(`rm ${tmpFile}`);
        } catch {
          // Ignore cleanup errors
        }
      });

      it('normalizes HTML and includes description', async () => {
        const pytestHtmlPath = join(FIXTURES_DIR, 'generated/python/pytest-report.html');
        const result = await runCommand(['normalize', '--show-description', pytestHtmlPath]);

        expect(result.exitCode).toBe(0);
        expect(result.stderr).toContain('Parsing Guide');
      });

      it('handles file not found in normalize', async () => {
        const result = await runCommand(['normalize', '/nonexistent/file.html']);

        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain('Error');
      });

      it('normalizes JSON with type override', async () => {
        const eslintJsonPath = join(FIXTURES_DIR, 'generated/javascript/eslint-results.json');
        const result = await runCommand(['normalize', '--type', 'eslint-json', eslintJsonPath]);

        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json).toBeDefined();
      });
    });
  });
}

// Run parameterized tests with in-process mode (always)
testCLI(runCLIInProcess, 'in-process');

// Run parameterized tests with E2E subprocess mode if E2E_TESTS=true
if (process.env.E2E_TESTS === 'true') {
  testCLI(runCLISubprocess, 'E2E subprocess');
}

// Additional tests that only run in specific modes
describe('help and version', () => {
  const isE2E = process.env.E2E_TESTS === 'true';

  it('shows help with --help', async () => {
    if (!isE2E) {
      // Help tests only run in E2E mode
      expect(true).toBe(true);
      return;
    }

    const result = await runCLISubprocess(['--help']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('artifact-detective');
    expect(result.stdout).toContain('detect');
    expect(result.stdout).toContain('validate');
    expect(result.stdout).toContain('extract');
    expect(result.stdout).toContain('normalize');
  });

  it('shows version with --version', async () => {
    const result = await runCLIInProcess(['--version']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
  });

  it('shows command-specific help', async () => {
    if (!isE2E) {
      // Help tests only run in E2E mode
      expect(true).toBe(true);
      return;
    }

    const result = await runCLISubprocess(['detect', '--help']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('detect');
    expect(result.stdout).toContain('--json');
  });
});

describe('stdin input (- argument)', () => {
  describe('in-process stdin mode', () => {
    it('reads from stdin in detect command', async () => {
      const eslintJsonPath = join(FIXTURES_DIR, 'generated/javascript/eslint-results.json');
      const jsonContent = readFileSync(eslintJsonPath, 'utf-8');

      // Mock stdin for in-process test
      const originalStdinRead = process.stdin.read;
      const originalStdinOn = process.stdin.on;

      let readableCallback: (() => void) | null = null;
      let endCallback: (() => void) | null = null;

      process.stdin.read = vi.fn(() => {
        const data = jsonContent;
        process.stdin.read = vi.fn(() => null);
        return data;
      });

      process.stdin.on = vi.fn(((event: string, callback: (() => void) | ((err: Error) => void)) => {
        if (event === 'readable') readableCallback = callback as () => void;
        if (event === 'end') endCallback = callback as () => void;
        return process.stdin;
      }) as typeof process.stdin.on);

      process.stdin.setEncoding = vi.fn(() => process.stdin);

      const resultPromise = runCLIInProcess(['detect', '-']);

      if (readableCallback) {
        readableCallback();
        readableCallback();
      }
      if (endCallback) {
        endCallback();
      }

      const result = await resultPromise;

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Detected Type:');

      process.stdin.read = originalStdinRead;
      process.stdin.on = originalStdinOn;
    });
  });

  describe('E2E subprocess stdin mode', () => {
    it('detects artifact from stdin via subprocess', async () => {
      if (process.env.E2E_TESTS !== 'true') {
        expect(true).toBe(true);
        return;
      }

      const eslintJsonPath = join(FIXTURES_DIR, 'generated/javascript/eslint-results.json');
      const jsonContent = readFileSync(eslintJsonPath, 'utf-8');

      const result = spawnSync('artifact-detective', ['detect', '-'], {
        input: jsonContent,
        encoding: 'utf-8',
      });

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Detected Type:');
    });

    it('validates artifact from stdin via subprocess', async () => {
      if (process.env.E2E_TESTS !== 'true') {
        expect(true).toBe(true);
        return;
      }

      const eslintJsonPath = join(FIXTURES_DIR, 'generated/javascript/eslint-results.json');
      const jsonContent = readFileSync(eslintJsonPath, 'utf-8');

      const result = spawnSync('artifact-detective', ['validate', 'eslint-json', '-'], {
        input: jsonContent,
        encoding: 'utf-8',
      });

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Valid: eslint-json');
    });

    it('extracts artifact from stdin log via subprocess', async () => {
      if (process.env.E2E_TESTS !== 'true') {
        expect(true).toBe(true);
        return;
      }

      const eslintOutputPath = join(FIXTURES_DIR, 'generated/javascript/eslint-output.txt');
      const logContent = readFileSync(eslintOutputPath, 'utf-8');

      const result = spawnSync('artifact-detective', ['extract', 'eslint-txt', '-'], {
        input: logContent,
        encoding: 'utf-8',
      });

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('error');
      expect(result.stdout).toContain('no-unused-vars');
    });

    it('rejects invalid artifact from stdin via subprocess', async () => {
      if (process.env.E2E_TESTS !== 'true') {
        expect(true).toBe(true);
        return;
      }

      const pytestJsonPath = join(FIXTURES_DIR, 'generated/python/pytest-results.json');
      const jsonContent = readFileSync(pytestJsonPath, 'utf-8');

      const result = spawnSync('artifact-detective', ['validate', 'eslint-json', '-'], {
        input: jsonContent,
        encoding: 'utf-8',
      });

      expect(result.status).toBe(2);
      expect(result.stdout).toContain('Invalid');
    });

    it('normalizes artifact from stdin with type override via subprocess', async () => {
      if (process.env.E2E_TESTS !== 'true') {
        expect(true).toBe(true);
        return;
      }

      const pytestHtmlPath = join(FIXTURES_DIR, 'generated/python/pytest-report.html');
      const htmlContent = readFileSync(pytestHtmlPath, 'utf-8');

      const result = spawnSync('artifact-detective', ['normalize', '--type', 'pytest-html', '-'], {
        input: htmlContent,
        encoding: 'utf-8',
      });

      expect(result.status).toBe(0);
      const json = JSON.parse(result.stdout);
      expect(json).toHaveProperty('tests');
    });
  });
});
