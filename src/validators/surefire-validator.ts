import type { ValidationResult } from './types.js';

export function validateSurefireHTML(content: string): ValidationResult {
  const lowerContent = content.toLowerCase();

  // Check for maven surefire report indicators
  if (!lowerContent.includes('surefire')) {
    return {
      valid: false,
      error: 'Missing surefire report markers',
    };
  }

  // Check for HTML structure
  if (!content.includes('<html') && !content.includes('<HTML')) {
    return {
      valid: false,
      error: 'Not valid HTML format',
    };
  }

  // Check for test-related content
  if (!lowerContent.includes('test')) {
    return {
      valid: false,
      error: 'Missing test-related content',
    };
  }

  return { valid: true };
}
