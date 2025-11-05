import { validate } from '../../validators/index.js';
import { readInput, writeOutput, exitError, formatJSON, writeError } from '../utils.js';
import type { ArtifactType } from '../../types.js';

/**
 * Core validation logic - no I/O side effects
 */
export interface ValidateCoreResult {
  valid: boolean;
  error?: string;
  description?: { parsingGuide: string };
}

export async function validateCore(
  type: string,
  filePath: string,
): Promise<{ success: true; data: ValidateCoreResult } | { success: false; error: string }> {
  try {
    // Read input from file or stdin
    const content = await readInput(filePath);
    const result = validate(type as ArtifactType, content);
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to validate artifact: ${message}` };
  }
}

/**
 * Validate artifact content against expected type - CLI wrapper
 */
export async function validateArtifact(
  type: string,
  filePath: string,
  options: { json?: boolean; showDescription?: boolean },
): Promise<void> {
  const result = await validateCore(type, filePath);

  if (!result.success) {
    exitError(result.error);
  }

  const data = result.data;

  if (options.json) {
    const output: Record<string, unknown> = {
      valid: data.valid,
    };
    if (data.error) {
      output.error = data.error;
    }
    if (data.description && options.showDescription) {
      output.description = data.description;
    }
    writeOutput(formatJSON(output), null);
  } else {
    const status = data.valid ? 'Valid' : 'Invalid';
    writeOutput(`${status}: ${type}`, null);

    if (!data.valid && data.error) {
      writeError(`  ${data.error}`);
    }

    if (data.valid && data.description && options.showDescription) {
      writeError('');
      writeError(`Parsing Guide:`);
      writeError(data.description.parsingGuide);
    }
  }

  // Exit with appropriate code
  if (!data.valid) {
    process.exit(2);
  }
}
