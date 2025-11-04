import type { ValidationResult } from './types.js';

export function validateCheckstyleXML(content: string): ValidationResult {
  const lowerContent = content.toLowerCase();

  if (!lowerContent.includes('<checkstyle')) {
    return {
      valid: false,
      error: 'Missing <checkstyle> root element',
    };
  }

  if (!lowerContent.includes('<file') && !content.includes('</checkstyle>')) {
    return {
      valid: false,
      error: 'Missing <file> elements or invalid structure',
    };
  }

  return { valid: true };
}

export function validateCheckstyleSARIF(content: string): ValidationResult {
  try {
    const obj = JSON.parse(content);

    // SARIF files must have version and runs
    if (!obj.version) {
      return {
        valid: false,
        error: 'Missing SARIF version field',
      };
    }

    if (!Array.isArray(obj.runs)) {
      return {
        valid: false,
        error: 'Missing SARIF runs array',
      };
    }

    // Check if this looks like checkstyle output (contains results with ruleIndex)
    if (obj.runs.length > 0 && obj.runs[0].tool) {
      const tool = obj.runs[0].tool;
      if (
        tool.driver &&
        (tool.driver.name === 'checkstyle' ||
          (typeof tool.driver.name === 'string' &&
            tool.driver.name.toLowerCase().includes('checkstyle')))
      ) {
        return { valid: true };
      }
    }

    // If not explicitly checkstyle, but has proper SARIF structure with results, accept it
    if (obj.runs.length > 0 && Array.isArray(obj.runs[0].results)) {
      return { valid: true };
    }

    return {
      valid: false,
      error: 'SARIF structure present but no results found',
    };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
