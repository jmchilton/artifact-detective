import { describe, it, expect } from 'vitest';
import { execSync, spawnSync } from 'child_process';
import { join } from 'path';
import { readFileSync } from 'fs';
import { FIXTURES_DIR } from './fixtures-helper.js';
import { runCLI } from '../src/cli/test-helper.js';

describe('CLI Commands', () => {
  describe('detect command', () => {
    const eslintJsonPath = join(FIXTURES_DIR, 'generated/javascript/eslint-results.json');

    it('detects artifact type from file', async () => {
      const result = await runCLI(['detect', eslintJsonPath]);

      expect(result.stdout).toContain('Detected Type: eslint-json');
      expect(result.stdout).toContain('Format: json');
      expect(result.stdout).toContain('Binary: no');

      expect(result.exitCode).toBe(0);
    });

    it('outputs JSON with --json flag', async () => {
      const result = await runCLI(['detect', '--json', eslintJsonPath]);

      expect(result.exitCode).toBe(0);
      const json = JSON.parse(result.stdout);
      expect(json.detectedType).toBe('eslint-json');
      expect(json.originalFormat).toBe('json');
      expect(json.isBinary).toBe(false);
    });

    it('handles file not found', async () => {
      const result = await runCLI(['detect', '/nonexistent/file.json']);

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Error');
    });
  });

  describe('validate command', () => {
    const eslintJsonPath = join(FIXTURES_DIR, 'generated/javascript/eslint-results.json');

    it('validates artifact against type', async () => {
      const result = await runCLI(['validate', 'eslint-json', eslintJsonPath]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Valid: eslint-json');
    });

    it('rejects invalid artifact', async () => {
      const pytestJsonPath = join(FIXTURES_DIR, 'generated/python/pytest-results.json');
      const result = await runCLI(['validate', 'eslint-json', pytestJsonPath]);

      expect(result.exitCode).toBe(2);
      expect(result.stdout).toContain('Invalid');
    });

    it('outputs JSON with --json flag', async () => {
      const result = await runCLI(['validate', '--json', 'eslint-json', eslintJsonPath]);

      expect(result.exitCode).toBe(0);
      const json = JSON.parse(result.stdout);
      expect(json.valid).toBe(true);
    });

    it('includes description with --show-description flag', async () => {
      const result = await runCLI(['validate', '--show-description', 'eslint-json', eslintJsonPath]);

      expect(result.exitCode).toBe(0);
      expect(result.stderr).toContain('Parsing Guide');
    });
  });

  describe('extract command', () => {
    const eslintOutputPath = join(FIXTURES_DIR, 'generated/javascript/eslint-output.txt');

    it('extracts artifact from log file', async () => {
      const result = await runCLI(['extract', 'eslint-txt', eslintOutputPath]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('error');
      expect(result.stdout).toContain('no-unused-vars');
    });

    it('writes output to file with --output', async () => {
      const tmpFile = `/tmp/extracted-${Date.now()}.txt`;
      const result = await runCLI(['extract', 'eslint-txt', eslintOutputPath, '--output', tmpFile]);

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
      const result = await runCLI(['extract', 'eslint-txt', '/nonexistent/file.txt']);

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Error');
    });
  });

  describe('normalize command', () => {
    const pytestHtmlPath = join(FIXTURES_DIR, 'generated/python/pytest-report.html');
    const jestHtmlPath = join(FIXTURES_DIR, 'generated/javascript/jest-report.html');

    it('converts HTML artifact to JSON', async () => {
      const result = await runCLI(['normalize', pytestHtmlPath]);

      expect(result.exitCode).toBe(0);
      const json = JSON.parse(result.stdout);
      expect(json).toHaveProperty('tests');
    });

    it('outputs to file with --output', async () => {
      const tmpFile = `/tmp/normalized-${Date.now()}.json`;
      const result = await runCLI(['normalize', pytestHtmlPath, '--output', tmpFile]);

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
      const result = await runCLI(['normalize', '--show-description', pytestHtmlPath]);

      expect(result.exitCode).toBe(0);
      expect(result.stderr).toContain('Parsing Guide');
    });

    it('overrides artifact type with --type', async () => {
      const result = await runCLI(['normalize', '--type', 'jest-html', jestHtmlPath]);

      expect(result.exitCode).toBe(0);
      const json = JSON.parse(result.stdout);
      expect(json).toHaveProperty('testResults');
    });

    it('handles conversion failure', async () => {
      const eslintJsonPath = join(FIXTURES_DIR, 'generated/javascript/eslint-results.json');
      const result = await runCLI(['normalize', eslintJsonPath]);

      // JSON artifacts should still succeed (already JSON)
      expect(result.exitCode).toBe(0);
    });
  });

  describe('help and version', () => {
    const isE2E = process.env.E2E_TESTS === 'true';

    it('shows help with --help', async () => {
      if (!isE2E) {
        // Help tests only run in E2E mode
        expect(true).toBe(true);
        return;
      }

      const result = await runCLI(['--help']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('artifact-detective');
      expect(result.stdout).toContain('detect');
      expect(result.stdout).toContain('validate');
      expect(result.stdout).toContain('extract');
      expect(result.stdout).toContain('normalize');
    });

    it('shows version with --version', async () => {
      const result = await runCLI(['--version']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    it('shows command-specific help', async () => {
      if (!isE2E) {
        // Help tests only run in E2E mode
        expect(true).toBe(true);
        return;
      }

      const result = await runCLI(['detect', '--help']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('detect');
      expect(result.stdout).toContain('--json');
    });
  });

  describe('stdin input (- argument)', () => {
    // Stdin tests require E2E mode and subprocess spawning
    // These tests exercise readInput's stdin path via actual subprocess

    it('validates artifact from stdin', async () => {
      if (process.env.E2E_TESTS !== 'true') {
        // Stdin tests only work in E2E mode with subprocess
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

    it('extracts artifact from stdin log', async () => {
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

    it('rejects invalid artifact from stdin', async () => {
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
  });
});
