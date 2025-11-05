import { detectArtifactType, convertToJSON, canConvertToJSON } from '../../index.js';
import { readInput, writeOutput, exitError, writeError } from '../utils.js';
import type { ArtifactType } from '../../types.js';

interface NormalizeOptions {
  type?: string;
  output?: string;
  showDescription?: boolean;
}

/**
 * Normalize artifact to JSON format
 */
export async function normalize(
  filePath: string,
  options: NormalizeOptions,
): Promise<void> {
  try {
    let content: string;
    let detectedType: ArtifactType | undefined;

    // Read input from file or stdin
    if (filePath === '-') {
      // For stdin, we need to auto-detect differently
      content = await readInput(filePath);

      // Write to temp file for detection
      const tmpFile = `/tmp/artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.tmp`;
      const fs = await import('fs');
      fs.writeFileSync(tmpFile, content);

      const result = detectArtifactType(tmpFile);
      detectedType = result.detectedType;

      // Clean up temp file
      try {
        fs.unlinkSync(tmpFile);
      } catch {
        // Ignore cleanup errors
      }

      // Write content to another temp file for conversion
      const conversionFile = `/tmp/artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.tmp`;
      fs.writeFileSync(conversionFile, content);
      filePath = conversionFile;
    } else {
      content = await readInput(filePath);
    }

    // Determine artifact type
    const targetType: ArtifactType = (options.type as ArtifactType) || detectedType;

    if (!targetType) {
      const result = detectArtifactType(filePath);
      if (!canConvertToJSON(result)) {
        exitError(`Cannot determine artifact type and no --type specified`);
      }
      detectedType = result.detectedType;
    }

    const conversionResult = convertToJSON(
      { detectedType: targetType || detectedType },
      filePath,
    );

    if (!conversionResult) {
      exitError(`Cannot normalize ${targetType || detectedType} to JSON`);
    }

    writeOutput(conversionResult.json, options.output || null);

    if (options.showDescription) {
      writeError('');
      writeError(`Parsing Guide (${conversionResult.description.toolUrl}):`);
      writeError(conversionResult.description.parsingGuide);
    }

    // Clean up temp file if created from stdin
    if (options.type !== undefined && filePath.startsWith('/tmp/artifact-')) {
      try {
        const fs = await import('fs');
        fs.unlinkSync(filePath);
      } catch {
        // Ignore cleanup errors
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    exitError(`Failed to normalize artifact: ${message}`);
  }
}
