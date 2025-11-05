import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import type { ArtifactDescription } from '../validators/types.js';
import type { ArtifactType } from '../types.js';
import yaml from 'js-yaml';

const __dirname = join(fileURLToPath(import.meta.url), '..');

/**
 * Lazy-loaded descriptions cache
 */
let descriptionsCache: Record<ArtifactType, ArtifactDescription> | null = null;

/**
 * Load all artifact descriptions from YAML file
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
      shortDescription: data.shortDescription,
      toolUrl: data.toolUrl,
      formatUrl: data.formatUrl,
      parsingGuide: data.parsingGuide,
    };
  }

  return descriptionsCache;
}

/**
 * Get description for a specific artifact type
 */
export function getArtifactDescription(
  artifactType: ArtifactType,
): ArtifactDescription | null {
  const descriptions = loadArtifactDescriptions();
  return descriptions[artifactType] ?? null;
}

/**
 * Export the interface type
 */
export type { ArtifactDescription } from '../validators/types.js';
