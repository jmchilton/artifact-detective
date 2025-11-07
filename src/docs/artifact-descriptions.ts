import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import type { ArtifactDescription } from '../validators/types.js';
import type { ArtifactType } from '../types.js';
// @ts-expect-error js-yaml doesn't have proper TypeScript declarations
import yaml from 'js-yaml';

const __dirname = join(fileURLToPath(import.meta.url), '..');

/**
 * Lazy-loaded descriptions cache
 */
let descriptionsCache: Record<ArtifactType, ArtifactDescription> | null = null;

/**
 * Load all artifact descriptions from YAML file.
 *
 * Loads metadata about all supported artifact types including tool URLs,
 * descriptions, and parsing guides. Results are cached for performance.
 *
 * @returns Record mapping artifact types to their descriptions
 *
 * @example
 * ```typescript
 * import { loadArtifactDescriptions } from 'artifact-detective';
 *
 * const descriptions = loadArtifactDescriptions();
 * console.log(descriptions['jest-json'].toolUrl);
 * ```
 *
 * @see {@link getArtifactDescription} for getting a single artifact description
 */
export function loadArtifactDescriptions(): Record<ArtifactType, ArtifactDescription> {
  if (descriptionsCache) {
    return descriptionsCache;
  }

  const yamlPath = join(__dirname, 'artifact-descriptions.yml');
  const content = readFileSync(yamlPath, 'utf-8');
  const raw = yaml.load(content) as Record<string, Record<string, string>>;

  descriptionsCache = {} as Record<ArtifactType, ArtifactDescription>;

  for (const [type, data] of Object.entries(raw)) {
    descriptionsCache[type as ArtifactType] = {
      type,
      fileExtension: data.fileExtension,
      shortDescription: data.shortDescription,
      toolUrl: data.toolUrl,
      formatUrl: data.formatUrl,
      parsingGuide: data.parsingGuide,
    };
  }

  return descriptionsCache;
}

/**
 * Get description for a specific artifact type.
 *
 * Retrieves metadata about a specific artifact type including tool documentation
 * URL, short description, parsing guide, and format specification URL.
 *
 * @param artifactType - The artifact type to get description for
 * @returns Artifact description object if type exists, null otherwise
 *
 * @example
 * ```typescript
 * import { getArtifactDescription } from 'artifact-detective';
 *
 * const desc = getArtifactDescription('jest-json');
 * if (desc) {
 *   console.log('Tool:', desc.toolUrl);
 *   console.log('Guide:', desc.parsingGuide);
 * }
 * ```
 *
 * @see {@link loadArtifactDescriptions} to get all descriptions at once
 * @see {@link validate} which includes description when validation succeeds
 */
export function getArtifactDescription(artifactType: ArtifactType): ArtifactDescription | null {
  const descriptions = loadArtifactDescriptions();
  return descriptions[artifactType] ?? null;
}

/**
 * Export the interface type
 */
export type { ArtifactDescription } from '../validators/types.js';
