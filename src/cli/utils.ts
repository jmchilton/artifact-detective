import { readFileSync, writeFileSync } from 'fs';

/**
 * Read input from file or stdin
 * @param filePath - Path to file or '-' for stdin
 * @returns File contents as string
 */
export async function readInput(filePath: string): Promise<string> {
  if (filePath === '-') {
    // Read from stdin
    return new Promise((resolve, reject) => {
      let data = '';
      process.stdin.setEncoding('utf-8');
      process.stdin.on('readable', () => {
        const chunk = process.stdin.read();
        if (chunk !== null) {
          data += chunk;
        }
      });
      process.stdin.on('end', () => {
        resolve(data);
      });
      process.stdin.on('error', reject);
    });
  } else {
    // Read from file
    return readFileSync(filePath, 'utf-8');
  }
}

/**
 * Write output to file or stdout
 * @param content - Content to write
 * @param outputPath - Path to write to, or null for stdout
 */
export function writeOutput(content: string, outputPath: string | null): void {
  if (outputPath) {
    writeFileSync(outputPath, content, 'utf-8');
  } else {
    process.stdout.write(content);
    if (!content.endsWith('\n')) {
      process.stdout.write('\n');
    }
  }
}

/**
 * Write message to stderr
 * @param message - Message to write
 */
export function writeError(message: string): void {
  if (!message.endsWith('\n')) {
    message += '\n';
  }
  process.stderr.write(message);
}

/**
 * Exit with error code and message
 * @param message - Error message
 * @param code - Exit code (default: 2 for runtime error)
 */
export function exitError(message: string, code: number = 2): never {
  writeError(`Error: ${message}`);
  process.exit(code);
}

/**
 * Format JSON output with proper spacing
 */
export function formatJSON(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

/**
 * Format simple key-value output
 */
export function formatKeyValue(obj: Record<string, unknown>): string {
  return Object.entries(obj)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        return `${key}: ${JSON.stringify(value)}`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');
}
