import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { parse as parseYAML } from "yaml";
import type { ArtifactType } from "../src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface FixtureInfo {
  type: ArtifactType;
  path: string;
  file: string;
  language: string;
}

/**
 * Load all generated fixtures from manifest files
 * @param languages - List of language directories to load (default: all)
 * @returns Array of fixture info objects
 */
export function loadAllFixtures(
  languages: string[] = ["javascript", "python", "rust", "java"],
): FixtureInfo[] {
  const allFixtures: FixtureInfo[] = [];

  for (const lang of languages) {
    const manifestPath = join(
      __dirname,
      `../fixtures/sample-projects/${lang}/manifest.yml`,
    );

    if (!existsSync(manifestPath)) {
      continue;
    }

    try {
      const manifest = parseYAML(readFileSync(manifestPath, "utf-8")) as {
        artifacts: Array<{ file: string; type: string }>;
      };

      for (const artifact of manifest.artifacts) {
        const fixturePath = join(
          __dirname,
          `../fixtures/generated/${lang}/${artifact.file}`,
        );

        if (!existsSync(fixturePath)) {
          continue;
        }

        allFixtures.push({
          type: artifact.type as ArtifactType,
          path: fixturePath,
          file: artifact.file,
          language: lang,
        });
      }
    } catch (error) {
      console.warn(`Failed to parse manifest for ${lang}:`, error);
    }
  }

  return allFixtures;
}
