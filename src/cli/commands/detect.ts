import { detectArtifactType } from '../../detectors/type-detector.js';
import { readInput, writeOutput, exitError, formatJSON, formatKeyValue } from '../utils.js';

/**
 * Detect artifact type from file
 */
export async function detect(filePath: string, options: { json?: boolean }): Promise<void> {
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

    if (options.json) {
      writeOutput(formatJSON(result), null);
    } else {
      const output = formatKeyValue({
        'Detected Type': result.detectedType,
        Format: result.originalFormat,
        Binary: result.isBinary ? 'yes' : 'no',
      });
      writeOutput(output, null);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    exitError(`Failed to detect artifact type: ${message}`);
  }
}
