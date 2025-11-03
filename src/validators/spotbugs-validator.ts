import type { ValidationResult } from './types.js';

export function validateSpotBugsXML(content: string): ValidationResult {
  const lowerContent = content.toLowerCase();

  if (!lowerContent.includes('<bugcollection')) {
    return {
      valid: false,
      error: 'Missing <BugCollection> root element',
    };
  }

  // SpotBugs reports typically contain <BugInstance> elements for each bug
  // But a valid report can have zero bugs, so we just check for closing tag
  if (!content.includes('</BugCollection>')) {
    return {
      valid: false,
      error: 'Invalid SpotBugs XML structure - missing closing BugCollection tag',
    };
  }

  return { valid: true };
}
