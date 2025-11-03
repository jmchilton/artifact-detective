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
