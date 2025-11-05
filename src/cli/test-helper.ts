/**
 * Test helper for CLI commands - supports both in-process and subprocess modes
 *
 * - Fast mode (default): Direct function calls via commander, no subprocess overhead (~3s)
 * - E2E mode (E2E_TESTS=true): Spawn actual CLI binary, full end-to-end testing (~10s)
 */
import { spawnSync } from 'child_process';
import { createProgram } from './index.js';

export interface CLITestResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Run CLI in current process using commander's built-in parsing
 */
async function runCLIInProcess(args: string[]): Promise<CLITestResult> {
  let stdout = '';
  let stderr = '';
  let exitCode = 0;

  const originalStdoutWrite = process.stdout.write;
  const originalStderrWrite = process.stderr.write;
  const originalExit = process.exit;

  try {
    process.stdout.write = ((text: string) => {
      stdout += text;
      return true;
    }) as NodeJS.WriteStream['write'];

    process.stderr.write = ((text: string) => {
      stderr += text;
      return true;
    }) as NodeJS.WriteStream['write'];

    process.exit = ((code?: number): never => {
      exitCode = code || 0;
      throw new Error(`EXIT_${code || 0}`);
    }) as typeof process.exit;

    try {
      const program = createProgram();
      await program.parseAsync(['node', 'cli', ...args]);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('EXIT_')) {
        // Already handled by process.exit override
      } else {
        throw error;
      }
    }

    return { stdout, stderr, exitCode };
  } finally {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
    process.exit = originalExit;
  }
}

/**
 * Run CLI via subprocess (E2E, slower)
 */
function runCLISubprocess(args: string[]): CLITestResult {
  const result = spawnSync('artifact-detective', args, {
    encoding: 'utf-8',
  });

  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  const exitCode = result.status || (result.error ? 1 : 0);

  return { stdout, stderr, exitCode };
}

/**
 * Parameterized CLI test runner
 * Uses E2E_TESTS=true env var to switch between modes
 */
export async function runCLI(args: string[]): Promise<CLITestResult> {
  const useSubprocess = process.env.E2E_TESTS === 'true';

  if (useSubprocess) {
    return runCLISubprocess(args);
  } else {
    return runCLIInProcess(args);
  }
}
