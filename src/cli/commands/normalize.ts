import { detectArtifactType, convertToJSON, canConvertToJSON } from '../../index.js';
import { readInput, writeOutput, exitError, writeError } from '../utils.js';
import type { ArtifactType } from '../../types.js';

interface NormalizeOptions {
  type?: string;
  output?: string;
  showDescription?: boolean;
}

/**
 * Core normalization logic - no I/O side effects
 */
export interface NormalizeCoreResult {
  json: string;
  artifact?: { parsingGuide: string; toolUrl?: string };
}

export async function normalizeCore(
  filePath: string,
  overrideType?: string,
): Promise<{ success: true; data: NormalizeCoreResult } | { success: false; error: string }> {
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
    const targetType: ArtifactType = (overrideType as ArtifactType) || detectedType;

    if (!targetType) {
      const result = detectArtifactType(filePath);
      if (!canConvertToJSON(result)) {
        return { success: false, error: `Cannot determine artifact type and no --type specified` };
      }
      detectedType = result.detectedType;
    }

    const conversionResult = convertToJSON(
      { detectedType: targetType || detectedType },
      filePath,
    );

    if (!conversionResult) {
      return { success: false, error: `Cannot normalize ${targetType || detectedType} to JSON` };
    }

    // Clean up temp file if created from stdin
    if (overrideType !== undefined && filePath.startsWith('/tmp/artifact-')) {
      try {
        const fs = await import('fs');
        fs.unlinkSync(filePath);
      } catch {
        // Ignore cleanup errors
      }
    }

    return { success: true, data: { json: conversionResult.json, artifact: conversionResult.description } };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to normalize artifact: ${message}` };
  }
}

/**
 * Normalize artifact to JSON format - CLI wrapper
 */
export async function normalize(
  filePath: string,
  options: NormalizeOptions,
): Promise<void> {
  const result = await normalizeCore(filePath, options.type);

  if (!result.success) {
    exitError(result.error);
  }

  const data = result.data;
  writeOutput(data.json, options.output || null);

  if (options.showDescription && data.artifact) {
    writeError('');
    writeError(`Parsing Guide (${data.artifact.toolUrl}):`);
    writeError(data.artifact.parsingGuide);
  }
}
