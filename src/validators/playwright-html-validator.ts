import type { ValidationResult } from "./types.js";

export function validatePlaywrightHTML(content: string): ValidationResult {
  // Must be HTML and contain playwright markers
  const hasHTMLStart = /^[\s\n]*<!DOCTYPE\s+html|^[\s\n]*<html/i.test(content);
  const hasPlaywrightMarker = /playwright/i.test(content);

  if (!hasHTMLStart) {
    return {
      valid: false,
      error: "Not HTML content",
    };
  }

  if (!hasPlaywrightMarker) {
    return {
      valid: false,
      error: "Missing Playwright markers in HTML content",
    };
  }

  return { valid: true };
}
