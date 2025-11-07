import { detectArtifactType } from '../../detectors/type-detector.js';
import { readInput, writeOutput, exitError, formatJSON, formatKeyValue } from '../utils.js';

/**
 * Core detection logic - no I/O side effects
 */
export interface DetectCoreResult {
  detectedType: string;
  originalFormat: string;
  isBinary: boolean;
  artifact?: {
    artifactType: string;
    fileExtension?: string;
    shortDescription: string;
    toolUrl?: string;
    formatUrl?: string;
    parsingGuide: string;
    isJSON: boolean;
  };
  validationResult?: {
    valid: boolean;
    error?: string;
    artifact?: unknown;
  };
}

export async function detectCore(filePath: string, validate?: boolean): Promise<{ success: true; data: DetectCoreResult } | { success: false; error: string }> {
  try {
    // Read input from file or stdin
    const content = await readInput(filePath);

    // For detection, we need the actual file path (not stdin)
    // If reading from stdin, create a temp file
    let detectionPath = filePath;
    if (filePath === '-') {
      // Write to temp file for detection
      const tmpFile = `/tmp/artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.tmp`;
      const fs = await import('fs');
      fs.writeFileSync(tmpFile, content);
      detectionPath = tmpFile;
    }

    const result = detectArtifactType(detectionPath, { validate });

    // Clean up temp file if created
    if (filePath === '-') {
      try {
        const fs = await import('fs');
        fs.unlinkSync(detectionPath);
      } catch {
        // Ignore cleanup errors
      }
    }

    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to detect artifact type: ${message}` };
  }
}

/**
 * Detect artifact type from file - CLI wrapper
 */
export async function detect(filePath: string, options: { json?: boolean; validate?: boolean; showDescription?: boolean }): Promise<void> {
  const result = await detectCore(filePath, options.validate);

  if (!result.success) {
    exitError(result.error);
  }

  const data = result.data;

  if (options.json) {
    const output: Record<string, unknown> = {
      detectedType: data.detectedType,
      originalFormat: data.originalFormat,
      isBinary: data.isBinary,
    };
    if (data.artifact) {
      output.artifact = data.artifact;
    }
    if (data.validationResult) {
      output.validationResult = data.validationResult;
    }
    writeOutput(formatJSON(output), null);
  } else {
    const output = formatKeyValue({
      'Detected Type': data.detectedType,
      Format: data.originalFormat,
      Binary: data.isBinary ? 'yes' : 'no',
    });
    writeOutput(output, null);

    if (data.artifact && options.showDescription) {
      writeOutput('', null);
      writeOutput(`Tool: ${data.artifact.toolUrl || 'unknown'}`, null);
      writeOutput(`Format: .${data.artifact.fileExtension}`, null);
    }

    if (data.validationResult) {
      writeOutput('', null);
      const validStatus = data.validationResult.valid ? 'Valid' : 'Invalid';
      writeOutput(`Validation: ${validStatus}`, null);
      if (!data.validationResult.valid && data.validationResult.error) {
        writeOutput(`  ${data.validationResult.error}`, null);
      }
    }
  }
}
