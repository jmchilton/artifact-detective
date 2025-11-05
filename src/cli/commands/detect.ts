import { detectArtifactType } from '../../detectors/type-detector.js';
import { readInput, writeOutput, exitError, formatJSON, formatKeyValue } from '../utils.js';

/**
 * Core detection logic - no I/O side effects
 */
export interface DetectCoreResult {
  detectedType: string;
  originalFormat: string;
  isBinary: boolean;
}

export async function detectCore(filePath: string): Promise<{ success: true; data: DetectCoreResult } | { success: false; error: string }> {
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

    const result = detectArtifactType(detectionPath);

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
export async function detect(filePath: string, options: { json?: boolean }): Promise<void> {
  const result = await detectCore(filePath);

  if (!result.success) {
    exitError(result.error);
  }

  if (options.json) {
    writeOutput(formatJSON(result.data), null);
  } else {
    const output = formatKeyValue({
      'Detected Type': result.data.detectedType,
      Format: result.data.originalFormat,
      Binary: result.data.isBinary ? 'yes' : 'no',
    });
    writeOutput(output, null);
  }
}
