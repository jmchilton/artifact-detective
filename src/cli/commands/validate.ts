import { validate } from '../../validators/index.js';
import { readInput, writeOutput, exitError, formatJSON, writeError } from '../utils.js';
import type { ArtifactType } from '../../types.js';

/**
 * Validate artifact content against expected type
 */
export async function validateArtifact(
  type: string,
  filePath: string,
  options: { json?: boolean; showDescription?: boolean },
): Promise<void> {
  try {
    // Read input from file or stdin
    const content = await readInput(filePath);

    const result = validate(type as ArtifactType, content);

    if (options.json) {
      const output: Record<string, unknown> = {
        valid: result.valid,
      };
      if (result.error) {
        output.error = result.error;
      }
      if (result.description && options.showDescription) {
        output.description = result.description;
      }
      writeOutput(formatJSON(output), null);
    } else {
      const status = result.valid ? 'Valid' : 'Invalid';
      writeOutput(`${status}: ${type}`, null);

      if (!result.valid && result.error) {
        writeError(`  ${result.error}`);
      }

      if (result.valid && result.description && options.showDescription) {
        writeError('');
        writeError(`Parsing Guide:`);
        writeError(result.description.parsingGuide);
      }
    }

    // Exit with appropriate code
    if (!result.valid) {
      process.exit(2);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    exitError(`Failed to validate artifact: ${message}`);
  }
}
