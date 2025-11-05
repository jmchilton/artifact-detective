# Docsify Documentation Site Implementation Plan

## Overview

Create a comprehensive docsify-based documentation site that expands on the current README. The site will include:
- CLI command reference with all arguments
- Enhanced artifact types table with programmatically generated metadata
- Fixture information from all sample projects
- TypeScript API documentation
- User guides for common workflows

## Site Structure

```
docs/
├── index.html              # Docsify entry point with config
├── README.md               # Home page (enhanced from root README)
├── _sidebar.md            # Navigation sidebar
├── _navbar.md             # Top navigation (optional)
├── getting-started.md     # Installation & quick start
├── cli/
│   ├── README.md          # CLI overview
│   ├── detect.md          # detect command reference
│   ├── validate.md        # validate command reference
│   ├── extract.md         # extract command reference
│   └── normalize.md       # normalize command reference
├── api/
│   ├── README.md          # API overview
│   ├── functions.md       # Core functions guide
│   ├── types.md           # TypeScript types reference
│   └── typedoc/           # Generated TypeDoc output (gitignored)
├── artifact-types/
│   ├── README.md          # Artifact types table (generated)
│   ├── test-frameworks.md # Jest, Pytest, etc. (generated)
│   ├── linters.md         # ESLint, Mypy, etc. (generated)
│   └── formatters.md      # Black, Rustfmt, etc. (generated)
├── fixtures/
│   ├── README.md          # Fixtures overview
│   ├── javascript.md      # JS fixtures (generated from manifest)
│   ├── python.md          # Python fixtures (generated from manifest)
│   ├── rust.md            # Rust fixtures (generated from manifest)
│   ├── go.md              # Go fixtures (generated from manifest)
│   ├── java.md            # Java fixtures (generated from manifest)
│   └── ruby.md            # Ruby fixtures (generated from manifest)
└── guides/
    ├── extraction.md      # CI log extraction guide
    ├── normalization.md   # JSON conversion guide
    └── custom-markers.md  # Custom extraction markers
```

## Dependencies to Install

```bash
npm install -D docsify-cli typedoc
```

## Build Scripts (package.json)

Add these scripts to package.json:

```json
{
  "scripts": {
    "docs:generate": "node scripts/generate-docs.js",
    "docs:api": "typedoc --out docs/api/typedoc src/index.ts",
    "docs:dev": "npm run docs:generate && docsify serve docs",
    "docs:build": "npm run docs:generate && npm run docs:api",
    "docs:init": "docsify init docs"
  }
}
```

## Generator Script (scripts/generate-docs.js)

Create a Node.js script that generates markdown files from:

### 1. Artifact Types Table

Read from:
- `src/validators/index.ts` → `ARTIFACT_TYPE_REGISTRY`
- `src/docs/artifact-descriptions.yml`

Generate `docs/artifact-types/README.md` with enhanced table:

| Type | Description | Auto-Detect | Extract | Normalize | Format | Tool |
|------|-------------|-------------|---------|-----------|--------|------|
| jest-json | Jest JSON reporter: 5 pass, 2 fail, 1 skip | ✓ | — | Already JSON | json | [Jest](https://jestjs.io) |
| eslint-txt | ESLint output with violations | ✗ | ✓ | — | txt | [ESLint](https://eslint.org) |
| pytest-html | Pytest HTML report | ✓ | — | → JSON | html | [Pytest](https://pytest.org) |

**Columns:**
- **Type**: ArtifactType name
- **Description**: From artifact-descriptions.yml `shortDescription`
- **Auto-Detect**: `supportsAutoDetection` from registry (✓/✗)
- **Extract**: Has `extract` function (✓) or not (—)
- **Normalize**:
  - "Already JSON" if `isJSON` = true
  - "→ {normalizesTo}" if has `normalize` function
  - "—" if no conversion
- **Format**: `originalFormat` (json/xml/html/txt)
- **Tool**: Link to `toolUrl` from descriptions

### 2. Individual Artifact Pages

Generate `docs/artifact-types/{test-frameworks,linters,formatters}.md`:

Group by category:
- **Test Frameworks**: jest-*, playwright-*, pytest-*, junit-*, surefire-*, go-test-*, rspec-*
- **Linters**: eslint-*, tsc-*, mypy-*, ruff-*, flake8-*, clippy-*, golangci-lint-*, rubocop-*, brakeman-*
- **Formatters**: checkstyle-*, spotbugs-*, cargo-test-*, rustfmt-*, gofmt-*, isort-*, black-*

For each artifact type, include:
- Short description
- Tool URL
- Format URL
- Parsing guide (from artifact-descriptions.yml)
- Registry capabilities (auto-detect, extract, normalize, etc.)
- Example fixture path

### 3. Fixture Pages

Read all `fixtures/sample-projects/*/manifest.yml` files.

Generate `docs/fixtures/{language}.md` for each language:

**Content per page:**
```markdown
# {Language} Fixtures

Language: {language}
Version: {language_version}

## Tools

| Tool | Version |
|------|---------|
| {tool.name} | {tool.version} |

## Generated Artifacts

| File | Type | Format | Description |
|------|------|--------|-------------|
| {artifact.file} | {artifact.type} | {artifact.format} | {artifact.description} |

## Generation Commands

\`\`\`bash
{commands.generate}
\`\`\`

## Cleanup Commands

\`\`\`bash
{commands.clean}
\`\`\`
```

### 4. CLI Reference Pages

Generate `docs/cli/{detect,validate,extract,normalize}.md` from CLI definitions in `src/cli/index.ts`:

**Template per command:**
```markdown
# {command} Command

{description}

## Usage

\`\`\`bash
artifact-detective {command} {args}
\`\`\`

## Arguments

- `{arg}`: {description}

## Options

- `--{option}`: {description}

## Examples

\`\`\`bash
# Example 1: {description}
artifact-detective {command} ...

# Example 2: {description}
artifact-detective {command} ...
\`\`\`

## Stdin Support

Use `-` to read from stdin:

\`\`\`bash
cat file.txt | artifact-detective {command} -
\`\`\`

## Exit Codes

- 0: Success
- 1: User error (invalid arguments)
- 2: Runtime error (validation failure, file not found, etc.)
```

## Docsify Configuration (docs/index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>artifact-detective - CI Artifact Detection & Parsing</title>
  <meta name="description" content="Detect and parse CI artifact types for test frameworks and linters">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css">
  <style>
    :root {
      --theme-color: #42b983;
    }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    window.$docsify = {
      name: 'artifact-detective',
      repo: 'jmchilton/artifact-detective',
      loadSidebar: true,
      subMaxLevel: 3,
      auto2top: true,
      coverpage: false,
      search: {
        paths: 'auto',
        placeholder: 'Search documentation...',
        noData: 'No results found.',
        depth: 6
      },
      alias: {
        '/.*/_sidebar.md': '/_sidebar.md'
      }
    }
  </script>
  <script src="//cdn.jsdelivr.net/npm/docsify@4/lib/docsify.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/docsify@4/lib/plugins/search.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-bash.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-typescript.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-json.min.js"></script>
</body>
</html>
```

## Sidebar Navigation (docs/_sidebar.md)

```markdown
- [Home](/)
- [Getting Started](/getting-started.md)

- CLI Reference
  - [Overview](/cli/README.md)
  - [detect](/cli/detect.md)
  - [validate](/cli/validate.md)
  - [extract](/cli/extract.md)
  - [normalize](/cli/normalize.md)

- API Reference
  - [Overview](/api/README.md)
  - [Functions](/api/functions.md)
  - [Types](/api/types.md)
  - [TypeDoc](/api/typedoc/index.html ':ignore')

- Artifact Types
  - [Overview](/artifact-types/README.md)
  - [Test Frameworks](/artifact-types/test-frameworks.md)
  - [Linters](/artifact-types/linters.md)
  - [Formatters](/artifact-types/formatters.md)

- Fixtures
  - [Overview](/fixtures/README.md)
  - [JavaScript](/fixtures/javascript.md)
  - [Python](/fixtures/python.md)
  - [Rust](/fixtures/rust.md)
  - [Go](/fixtures/go.md)
  - [Java](/fixtures/java.md)
  - [Ruby](/fixtures/ruby.md)

- Guides
  - [CI Log Extraction](/guides/extraction.md)
  - [JSON Normalization](/guides/normalization.md)
  - [Custom Markers](/guides/custom-markers.md)
```

## TypeScript API Documentation (TypeDoc)

### TypeDoc Configuration (typedoc.json)

Create `typedoc.json`:

```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api/typedoc",
  "name": "artifact-detective API",
  "excludePrivate": true,
  "excludeProtected": true,
  "excludeInternal": true,
  "includeVersion": true,
  "readme": "none",
  "navigationLinks": {
    "Documentation": "https://jmchilton.github.io/artifact-detective"
  }
}
```

### Add JSDoc Comments

Add JSDoc comments to all exported functions in `src/index.ts` and related files:

```typescript
/**
 * Detect the artifact type from a file by inspecting its content.
 *
 * @param filePath - Path to the artifact file
 * @returns Detection result with type, format, and binary status
 *
 * @example
 * ```typescript
 * const result = detectArtifactType('./test-results/report.html');
 * console.log(result.detectedType); // 'pytest-html'
 * ```
 */
export function detectArtifactType(filePath: string): DetectionResult { ... }
```

## Static Guide Pages

### docs/guides/extraction.md

Write guide for extracting artifacts from CI logs:
- When to use extractArtifactFromLog
- How default markers work
- Common extraction patterns per tool
- Troubleshooting

### docs/guides/normalization.md

Write guide for converting artifacts to JSON:
- Which types support conversion
- Using convertToJSON vs extractArtifactToJson
- Parsing the resulting JSON
- Type safety with TypeScript

### docs/guides/custom-markers.md

Write guide for custom extraction markers:
- ExtractorConfig interface
- startMarker/endMarker regex patterns
- includeEndMarker option
- Examples for different CI systems (GitHub Actions, CircleCI, GitLab CI)

## Implementation Steps

1. **Setup**
   - Install dependencies: `npm install -D docsify-cli typedoc`
   - Create `docs/` directory
   - Run `npm run docs:init` to create basic structure

2. **Create Generator Script**
   - Create `scripts/generate-docs.js`
   - Import necessary modules (fs, path, yaml)
   - Implement registry table generator
   - Implement artifact pages generator
   - Implement fixture pages generator
   - Implement CLI reference generator

3. **Add JSDoc Comments**
   - Add comprehensive JSDoc to `src/index.ts` exports
   - Add examples to each function
   - Add param/return descriptions
   - Add @see tags linking related functions

4. **Create Static Content**
   - Write `docs/README.md` (enhanced home page)
   - Write `docs/getting-started.md`
   - Write `docs/cli/README.md`
   - Write `docs/api/README.md`
   - Write `docs/api/functions.md` (manual guide)
   - Write `docs/api/types.md` (manual type guide)
   - Write `docs/fixtures/README.md`
   - Write all guide pages in `docs/guides/`

5. **Configure Docsify**
   - Create `docs/index.html` with config
   - Create `docs/_sidebar.md`
   - Test navigation structure

6. **Generate Content**
   - Run `npm run docs:generate` to create programmatic pages
   - Run `npm run docs:api` to create TypeDoc output
   - Review generated content

7. **Test Locally**
   - Run `npm run docs:dev`
   - Open http://localhost:3000
   - Test all navigation links
   - Test search functionality
   - Verify generated tables/content

8. **Polish**
   - Add code examples to guides
   - Add cross-references between pages
   - Ensure consistent formatting
   - Add badges/callouts where helpful

9. **Deploy Setup (Optional)**
   - Configure GitHub Pages to serve from /docs
   - Or add build step to deploy to gh-pages branch
   - Update repository settings

10. **Update Root Files**
    - Add link to docs site in README.md
    - Add `docs/api/typedoc/` to `.gitignore`
    - Add `docs/artifact-types/*.md` to `.gitignore` (except README)
    - Add `docs/fixtures/*.md` to `.gitignore` (except README)
    - Commit generated markdown files structure

## File Updates

### .gitignore additions

```
# Generated documentation
docs/api/typedoc/
docs/artifact-types/test-frameworks.md
docs/artifact-types/linters.md
docs/artifact-types/formatters.md
docs/fixtures/javascript.md
docs/fixtures/python.md
docs/fixtures/rust.md
docs/fixtures/go.md
docs/fixtures/java.md
docs/fixtures/ruby.md
docs/cli/detect.md
docs/cli/validate.md
docs/cli/extract.md
docs/cli/normalize.md
```

### README.md addition

Add link at top:

```markdown
📚 **[View Full Documentation](https://jmchilton.github.io/artifact-detective)**
```

## Data Sources Reference

### ARTIFACT_TYPE_REGISTRY

Location: `src/validators/index.ts`

Structure:
```typescript
{
  supportsAutoDetection: boolean;
  validator: ValidatorFunction | null;
  extract: ExtractFromLogFunction | null;
  normalize: NormalizeFunction | null;
  normalizesTo: ArtifactType | null;
  artificialType: boolean;
  isJSON: boolean;
}
```

### Artifact Descriptions

Location: `src/docs/artifact-descriptions.yml`

Structure per type:
```yaml
artifact-type:
  shortDescription: string
  toolUrl: string
  formatUrl: string
  parsingGuide: string (multiline)
```

### Fixture Manifests

Location: `fixtures/sample-projects/{language}/manifest.yml`

Structure:
```yaml
language: string
{language}_version: string
tools:
  - name: string
    version: string
artifacts:
  - file: string
    type: string
    format: string
    description: string
    coverage_target: string
commands:
  generate: string
  clean: string
```

### CLI Definitions

Location: `src/cli/index.ts`

Extract from Commander.js definitions:
- Command names
- Arguments (positional)
- Options (flags with descriptions)
- Help text

## Success Criteria

- [ ] All artifact types documented with capabilities
- [ ] All fixture languages have generated pages
- [ ] All CLI commands have reference pages
- [ ] TypeDoc API documentation generated
- [ ] All guides written and cross-linked
- [ ] Search works across all pages
- [ ] Local preview works (`npm run docs:dev`)
- [ ] Generated content matches source data
- [ ] Navigation is intuitive
- [ ] Code examples are accurate
