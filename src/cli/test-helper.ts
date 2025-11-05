/**
 * Test helper for CLI commands - supports both in-process and subprocess modes
 */
import { execSync, spawnSync } from 'child_process';
import { writeFileSync } from 'fs';
import { detectCore } from './commands/detect.js';
import { validateCore } from './commands/validate.js';
import { extractCore } from './commands/extract.js';
import { normalizeCore } from './commands/normalize.js';

export interface CLITestResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Run CLI command in current process (fast, for unit testing)
 */
async function runCLIInProcess(args: string[]): Promise<CLITestResult> {
  const [command, ...commandArgs] = args;

  // Capture stdout/stderr
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
    }) as any;

    process.stderr.write = ((text: string) => {
      stderr += text;
      return true;
    }) as any;

    process.exit = ((code?: number) => {
      exitCode = code || 1;
      throw new Error(`EXIT_${code || 1}`);
    }) as any;

    try {
      switch (command) {
        case 'detect': {
          let hasJsonFlag = false;
          let filePath: string | undefined;

          for (let i = 0; i < commandArgs.length; i++) {
            if (commandArgs[i] === '--json') {
              hasJsonFlag = true;
            } else if (!commandArgs[i].startsWith('--')) {
              filePath = commandArgs[i];
            }
          }

          const result = await detectCore(filePath);

          if (!result.success) {
            exitCode = 2;
            stderr += `Error: ${result.error}\n`;
          } else {
            if (hasJsonFlag) {
              stdout += JSON.stringify(result.data, null, 2) + '\n';
            } else {
              stdout += `Detected Type: ${result.data.detectedType}\n`;
              stdout += `Format: ${result.data.originalFormat}\n`;
              stdout += `Binary: ${result.data.isBinary ? 'yes' : 'no'}\n`;
            }
          }
          break;
        }

        case 'validate': {
          let idx = 0;
          let hasJsonFlag = false;
          let hasShowDescFlag = false;

          while (idx < commandArgs.length && commandArgs[idx].startsWith('--')) {
            if (commandArgs[idx] === '--json') hasJsonFlag = true;
            if (commandArgs[idx] === '--show-description') hasShowDescFlag = true;
            idx++;
          }

          const type = commandArgs[idx];
          const filePath = commandArgs[idx + 1];

          const result = await validateCore(type, filePath);

          if (!result.success) {
            exitCode = 2;
            stderr += `Error: ${result.error}\n`;
          } else {
            if (hasJsonFlag) {
              const output: Record<string, unknown> = { valid: result.data.valid };
              if (result.data.error) output.error = result.data.error;
              if (result.data.description && hasShowDescFlag) output.description = result.data.description;
              stdout += JSON.stringify(output, null, 2) + '\n';
            } else {
              const status = result.data.valid ? 'Valid' : 'Invalid';
              stdout += `${status}: ${type}\n`;
              if (!result.data.valid && result.data.error) {
                stderr += `  ${result.data.error}\n`;
              }
              if (result.data.valid && result.data.description && hasShowDescFlag) {
                stderr += '\nParsing Guide:\n';
                stderr += result.data.description.parsingGuide + '\n';
              }
            }

            if (!result.data.valid) {
              exitCode = 2;
            }
          }
          break;
        }

        case 'extract': {
          let outputFile: string | undefined;
          let startMarker: string | undefined;
          let endMarker: string | undefined;
          let type: string | undefined;
          let logPath: string | undefined;

          for (let i = 0; i < commandArgs.length; i++) {
            if (commandArgs[i] === '--output' && i + 1 < commandArgs.length) {
              outputFile = commandArgs[++i];
            } else if (commandArgs[i] === '--start-marker' && i + 1 < commandArgs.length) {
              startMarker = commandArgs[++i];
            } else if (commandArgs[i] === '--end-marker' && i + 1 < commandArgs.length) {
              endMarker = commandArgs[++i];
            } else if (!commandArgs[i].startsWith('--') && !type) {
              type = commandArgs[i];
            } else if (!commandArgs[i].startsWith('--') && type) {
              logPath = commandArgs[i];
            }
          }

          const result = await extractCore(type, logPath, { startMarker, endMarker });

          if (!result.success) {
            exitCode = 2;
            stderr += `Error: ${result.error}\n`;
          } else {
            if (outputFile) {
              writeFileSync(outputFile, result.data, 'utf-8');
            } else {
              stdout += result.data;
              if (!result.data.endsWith('\n')) {
                stdout += '\n';
              }
            }
          }
          break;
        }

        case 'normalize': {
          let type: string | undefined;
          let outputFile: string | undefined;
          let hasShowDescFlag = false;
          let filePath: string | undefined;

          for (let i = 0; i < commandArgs.length; i++) {
            if (commandArgs[i] === '--type' && i + 1 < commandArgs.length) {
              type = commandArgs[++i];
            } else if (commandArgs[i] === '--output' && i + 1 < commandArgs.length) {
              outputFile = commandArgs[++i];
            } else if (commandArgs[i] === '--show-description') {
              hasShowDescFlag = true;
            } else if (!commandArgs[i].startsWith('--') && !filePath) {
              filePath = commandArgs[i];
            }
          }

          const result = await normalizeCore(filePath, type);

          if (!result.success) {
            exitCode = 2;
            stderr += `Error: ${result.error}\n`;
          } else {
            if (outputFile) {
              writeFileSync(outputFile, result.data.json, 'utf-8');
            } else {
              stdout += result.data.json;
              if (!result.data.json.endsWith('\n')) {
                stdout += '\n';
              }
            }

            if (hasShowDescFlag && result.data.description) {
              stderr += '\n';
              stderr += `Parsing Guide (${result.data.description.toolUrl}):\n`;
              stderr += result.data.description.parsingGuide + '\n';
            }
          }
          break;
        }

        case '--help': {
          stdout += 'artifact-detective\n';
          stdout += 'Detect and parse CI artifact types for test frameworks and linters\n';
          stdout += '\nCommands:\n';
          stdout += '  detect\n';
          stdout += '  validate\n';
          stdout += '  extract\n';
          stdout += '  normalize\n';
          break;
        }

        case '--version': {
          stdout += '1.6.0\n';
          break;
        }

        default:
          exitCode = 1;
          stderr += `Unknown command: ${command}\n`;
      }
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
 * Run CLI command via subprocess (E2E, slower)
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
