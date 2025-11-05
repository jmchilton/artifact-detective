import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { join } from 'path';
import { readFileSync } from 'fs';
import { FIXTURES_DIR } from './fixtures-helper.js';

function runCLI(args: string[]): { stdout: string; stderr: string; exitCode: number } {
  const cmd = `artifact-detective ${args.join(' ')} 2>&1`;

  try {
    const output = execSync(cmd, { encoding: 'utf-8' });
    return { stdout: output, stderr: '', exitCode: 0 };
  } catch (error: unknown) {
    const err = error as { status?: number; stdout?: string; stderr?: string; message?: string };
    const output = err.stdout?.toString() || err.message?.toString() || '';
    return {
      stdout: output,
      stderr: '',
      exitCode: err.status || 1,
    };
  }
}

describe('CLI Commands', () => {
  describe('detect command', () => {
    const eslintJsonPath = join(FIXTURES_DIR, 'generated/javascript/eslint-results.json');

    it('detects artifact type from file', () => {
      const result = runCLI(['detect', eslintJsonPath]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Detected Type: eslint-json');
      expect(result.stdout).toContain('Format: json');
      expect(result.stdout).toContain('Binary: no');
    });

    it('outputs JSON with --json flag', () => {
      const result = runCLI(['detect', '--json', eslintJsonPath]);

      expect(result.exitCode).toBe(0);
      const json = JSON.parse(result.stdout);
      expect(json.detectedType).toBe('eslint-json');
      expect(json.originalFormat).toBe('json');
      expect(json.isBinary).toBe(false);
    });

    it('handles file not found', () => {
      const result = runCLI(['detect', '/nonexistent/file.json']);

      expect(result.exitCode).not.toBe(0);
      expect(result.stdout).toContain('Error');
    });
  });

  describe('validate command', () => {
    const eslintJsonPath = join(FIXTURES_DIR, 'generated/javascript/eslint-results.json');

    it('validates artifact against type', () => {
      const result = runCLI(['validate', 'eslint-json', eslintJsonPath]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Valid: eslint-json');
    });

    it('rejects invalid artifact', () => {
      const pytestJsonPath = join(FIXTURES_DIR, 'generated/python/pytest-results.json');
      const result = runCLI(['validate', 'eslint-json', pytestJsonPath]);

      expect(result.exitCode).toBe(2);
      expect(result.stdout).toContain('Invalid');
    });

    it('outputs JSON with --json flag', () => {
      const result = runCLI(['validate', '--json', 'eslint-json', eslintJsonPath]);

      expect(result.exitCode).toBe(0);
      const json = JSON.parse(result.stdout);
      expect(json.valid).toBe(true);
    });

    it('includes description with --show-description flag', () => {
      const result = runCLI(['validate', '--show-description', 'eslint-json', eslintJsonPath]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Parsing Guide');
    });
  });

  describe('extract command', () => {
    const eslintOutputPath = join(FIXTURES_DIR, 'generated/javascript/eslint-output.txt');

    it('extracts artifact from log file', () => {
      const result = runCLI(['extract', 'eslint-txt', eslintOutputPath]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('error');
      expect(result.stdout).toContain('no-unused-vars');
    });

    it('writes output to file with --output', () => {
      const tmpFile = `/tmp/extracted-${Date.now()}.txt`;
      const result = runCLI(['extract', 'eslint-txt', eslintOutputPath, '--output', tmpFile]);

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

    it('handles extraction failure gracefully', () => {
      const result = runCLI(['extract', 'eslint-txt', '/nonexistent/file.txt']);

      expect(result.exitCode).not.toBe(0);
      expect(result.stdout).toContain('Error');
    });
  });

  describe('normalize command', () => {
    const pytestHtmlPath = join(FIXTURES_DIR, 'generated/python/pytest-report.html');
    const jestHtmlPath = join(FIXTURES_DIR, 'generated/javascript/jest-report.html');

    it('converts HTML artifact to JSON', () => {
      const result = runCLI(['normalize', pytestHtmlPath]);

      expect(result.exitCode).toBe(0);
      const json = JSON.parse(result.stdout);
      expect(json).toHaveProperty('tests');
    });

    it('outputs to file with --output', () => {
      const tmpFile = `/tmp/normalized-${Date.now()}.json`;
      const result = runCLI(['normalize', pytestHtmlPath, '--output', tmpFile]);

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

    it('includes description with --show-description', () => {
      const result = runCLI(['normalize', '--show-description', pytestHtmlPath]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Parsing Guide');
    });

    it('overrides artifact type with --type', () => {
      const result = runCLI(['normalize', '--type', 'jest-html', jestHtmlPath]);

      expect(result.exitCode).toBe(0);
      const json = JSON.parse(result.stdout);
      expect(json).toHaveProperty('testResults');
    });

    it('handles conversion failure', () => {
      const eslintJsonPath = join(FIXTURES_DIR, 'generated/javascript/eslint-results.json');
      const result = runCLI(['normalize', eslintJsonPath]);

      // JSON artifacts should still succeed (already JSON)
      expect(result.exitCode).toBe(0);
    });
  });

  describe('help and version', () => {
    it('shows help with --help', () => {
      const result = runCLI(['--help']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('artifact-detective');
      expect(result.stdout).toContain('detect');
      expect(result.stdout).toContain('validate');
      expect(result.stdout).toContain('extract');
      expect(result.stdout).toContain('normalize');
    });

    it('shows version with --version', () => {
      const result = runCLI(['--version']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    it('shows command-specific help', () => {
      const result = runCLI(['detect', '--help']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('detect');
      expect(result.stdout).toContain('--json');
    });
  });
});
